'use strict'

const pool       = require('../db')
const requireRol = require('../hooks/authorize')

const SQL_ALBUM = `
  SELECT
    a.id,
    a.titulo,
    a.anio,
    a.url_portada,
    a.track_count,
    ar.id     AS id_artista,
    ar.nombre AS artista,
    GROUP_CONCAT(g.detalle ORDER BY g.detalle SEPARATOR ', ') AS generos
  FROM Album a
  JOIN      Artista      ar ON ar.id      = a.id_artista
  LEFT JOIN Album_Genero ag ON ag.id_album = a.id
  LEFT JOIN Genero        g  ON g.id       = ag.id_genero
`
const SQL_ALBUM_GROUP = `
  GROUP BY a.id, a.titulo, a.anio, a.url_portada, a.track_count, ar.id, ar.nombre
`

async function albumsRoutes(fastify) {

  // ── GET /api/albums ────────────────────────────────────────────────────────
  fastify.get('/api/albums', async () => {
    const [rows] = await pool.execute(
      SQL_ALBUM + SQL_ALBUM_GROUP + ' ORDER BY ar.nombre ASC, a.anio DESC'
    )
    return rows
  })

  // ── GET /api/albums/:id ────────────────────────────────────────────────────
  fastify.get('/api/albums/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'integer', minimum: 1 } }
      }
    }
  }, async (req, reply) => {
    const [rows] = await pool.execute(
      SQL_ALBUM + ' WHERE a.id = ? ' + SQL_ALBUM_GROUP,
      [req.params.id]
    )
    if (!rows.length) return reply.code(404).send({ error: 'Álbum no encontrado' })
    return rows[0]
  })

  // ── GET /api/albums/buscar-portada ─────────────────────────────────────────
  // Busca en iTunes y devuelve opciones de portada + metadata.
  fastify.get('/api/albums/buscar-portada', {
    preHandler: requireRol('admin', 'vendedor'),
    schema: {
      querystring: {
        type: 'object',
        required: ['q'],
        properties: {
          q:     { type: 'string', minLength: 2 },
          limit: { type: 'integer', minimum: 1, maximum: 10, default: 6 }
        }
      }
    }
  }, async (req, reply) => {
    const { q, limit = 6 } = req.query

    const url = new URL('https://itunes.apple.com/search')
    url.searchParams.set('term',   q)
    url.searchParams.set('media',  'music')
    url.searchParams.set('entity', 'album')
    url.searchParams.set('limit',  String(limit))
    url.searchParams.set('lang',   'es_es')

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 6000)

    let data
    try {
      const resp = await fetch(url.toString(), { signal: controller.signal })
      if (!resp.ok) return reply.code(502).send({ error: 'Error al consultar iTunes API' })
      data = await resp.json()
    } catch (err) {
      if (err.name === 'AbortError') return reply.code(504).send({ error: 'iTunes API no respondió' })
      throw err
    } finally {
      clearTimeout(timer)
    }

    if (!data.resultCount) return []

    return data.results.map(r => ({
      itunes_id:      r.collectionId,
      titulo:         r.collectionName,
      artista:        r.artistName,
      anio:           r.releaseDate ? new Date(r.releaseDate).getFullYear() : null,
      track_count:    r.trackCount  ?? null,
      genero_itunes:  r.primaryGenreName ?? null,
      url_100:        r.artworkUrl100 ?? null,
      url_500:        r.artworkUrl100
                        ? r.artworkUrl100.replace('100x100bb', '500x500bb')
                        : null
    }))
  })

  // ── PATCH /api/albums/:id/portada ─────────────────────────────────────────
  fastify.patch('/api/albums/:id/portada', {
    preHandler: requireRol('admin', 'vendedor'),
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'integer', minimum: 1 } }
      },
      body: {
        type: 'object',
        required: ['url_portada'],
        properties: { url_portada: { type: 'string', minLength: 10 } },
        additionalProperties: false
      }
    }
  }, async (req, reply) => {
    const { id }          = req.params
    const { url_portada } = req.body
    const [[existe]] = await pool.execute(
      'SELECT EXISTS(SELECT 1 FROM Album WHERE id = ?) AS ok', [id]
    )
    if (!existe.ok) return reply.code(404).send({ error: 'Álbum no encontrado' })
    await pool.execute('UPDATE Album SET url_portada = ? WHERE id = ?', [url_portada, id])
    const [rows] = await pool.execute(SQL_ALBUM + ' WHERE a.id = ? ' + SQL_ALBUM_GROUP, [id])
    return rows[0]
  })

  // ── POST /api/albums ───────────────────────────────────────────────────────
  // Crea un álbum nuevo desde los datos traídos de iTunes.
  // Si el artista no existe se crea automáticamente.
  // Devuelve 409 si el álbum (título + artista) ya existe.
  fastify.post('/api/albums', {
    preHandler: requireRol('admin', 'vendedor'),
    schema: {
      body: {
        type: 'object',
        required: ['titulo', 'anio', 'nombre_artista'],
        properties: {
          titulo:         { type: 'string', minLength: 1 },
          anio:           { type: 'integer', minimum: 1900, maximum: 2100 },
          track_count:    { type: 'integer', minimum: 1, default: 1 },
          url_portada:    { type: 'string' },
          nombre_artista: { type: 'string', minLength: 1 }
        },
        additionalProperties: false
      }
    }
  }, async (req, reply) => {
    const { titulo, anio, track_count = 1, url_portada, nombre_artista } = req.body

    // Buscar o crear artista
    let [[artista]] = await pool.execute(
      'SELECT id FROM Artista WHERE nombre = ?', [nombre_artista]
    )
    if (!artista) {
      const [r] = await pool.execute('INSERT INTO Artista (nombre) VALUES (?)', [nombre_artista])
      artista = { id: r.insertId }
    }

    // Verificar álbum duplicado
    const [[dup]] = await pool.execute(
      'SELECT id FROM Album WHERE titulo = ? AND id_artista = ?',
      [titulo, artista.id]
    )
    if (dup) {
      return reply.code(409).send({
        error: 'Este álbum ya existe en el catálogo',
        id_album: dup.id
      })
    }

    const [result] = await pool.execute(
      'INSERT INTO Album (titulo, anio, track_count, url_portada, id_artista) VALUES (?, ?, ?, ?, ?)',
      [titulo, anio, track_count, url_portada || null, artista.id]
    )

    return reply.code(201).send({
      id:      result.insertId,
      titulo,
      artista: nombre_artista,
      anio,
      url_portada: url_portada || null
    })
  })

}

module.exports = albumsRoutes
