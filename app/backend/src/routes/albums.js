'use strict'

const pool       = require('../db')
const requireRol = require('../hooks/authorize')

// Query base reutilizada en GET /api/albums y GET /api/albums/:id
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
  fastify.get('/api/albums', async (request, reply) => {
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
  }, async (request, reply) => {
    const [rows] = await pool.execute(
      SQL_ALBUM + ' WHERE a.id = ? ' + SQL_ALBUM_GROUP,
      [request.params.id]
    )
    if (rows.length === 0) return reply.code(404).send({ error: 'Álbum no encontrado' })
    return rows[0]
  })


  // ── GET /api/albums/buscar-portada ─────────────────────────────────────────
  // Busca álbumes en la iTunes Search API y devuelve opciones de portada.
  // Solo admin y vendedor (es una herramienta de gestión de catálogo).
  //
  // Uso: GET /api/albums/buscar-portada?q=Metallica+Master+of+Puppets
  //
  // iTunes devuelve artworkUrl100 (100×100 px). Reemplazamos "100x100bb"
  // por "500x500bb" para obtener una imagen de mayor calidad sin cambiar
  // de CDN ni hacer peticiones extra.
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
  }, async (request, reply) => {
    const { q, limit = 6 } = request.query

    const url = new URL('https://itunes.apple.com/search')
    url.searchParams.set('term',   q)
    url.searchParams.set('media',  'music')
    url.searchParams.set('entity', 'album')
    url.searchParams.set('limit',  String(limit))
    url.searchParams.set('lang',   'es_es')

    // AbortController permite cancelar la petición si iTunes tarda más de 6s.
    // Sin esto, una API lenta dejaría la conexión del cliente colgada.
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 6000)

    let data
    try {
      const resp = await fetch(url.toString(), { signal: controller.signal })
      if (!resp.ok) {
        return reply.code(502).send({ error: 'Error al consultar iTunes API' })
      }
      data = await resp.json()
    } catch (err) {
      if (err.name === 'AbortError') {
        return reply.code(504).send({ error: 'iTunes API no respondió a tiempo' })
      }
      throw err
    } finally {
      clearTimeout(timer)
    }

    if (data.resultCount === 0) {
      return []
    }

    // Mapear solo los campos que el frontend necesita.
    // artworkUrl100 → artworkUrl500: reemplazamos la dimensión en la URL
    // del CDN de Apple para obtener la misma imagen en mayor resolución.
    return data.results.map(r => ({
      itunes_id:   r.collectionId,
      titulo:      r.collectionName,
      artista:     r.artistName,
      anio:        r.releaseDate ? new Date(r.releaseDate).getFullYear() : null,
      track_count: r.trackCount  ?? null,
      // URL en 100px (la que entrega iTunes por defecto)
      url_100:     r.artworkUrl100 ?? null,
      // URL en 500px (simplemente reemplazando el segmento de dimensión)
      url_500:     r.artworkUrl100
                     ? r.artworkUrl100.replace('100x100bb', '500x500bb')
                     : null
    }))
  })


  // ── PATCH /api/albums/:id/portada ─────────────────────────────────────────
  // Persiste la URL de portada elegida en la tabla Album.
  // El admin busca con el endpoint anterior, elige una opción, y este
  // endpoint guarda la url_500 en la DB.
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
        properties: {
          url_portada: { type: 'string', minLength: 10 }
        },
        additionalProperties: false
      }
    }
  }, async (request, reply) => {
    const { id }          = request.params
    const { url_portada } = request.body

    // Verificar que el álbum existe antes de actualizar
    const [[existe]] = await pool.execute(
      'SELECT EXISTS(SELECT 1 FROM Album WHERE id = ?) AS ok',
      [id]
    )
    if (!existe.ok) return reply.code(404).send({ error: 'Álbum no encontrado' })

    await pool.execute(
      'UPDATE Album SET url_portada = ? WHERE id = ?',
      [url_portada, id]
    )

    // Devolver el álbum actualizado con todas sus relaciones
    const [rows] = await pool.execute(
      SQL_ALBUM + ' WHERE a.id = ? ' + SQL_ALBUM_GROUP,
      [id]
    )
    return rows[0]
  })

}

module.exports = albumsRoutes
