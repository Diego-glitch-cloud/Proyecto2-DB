'use strict'

const pool = require('../db')

async function albumsRoutes(fastify) {

  // ── GET /api/albums ────────────────────────────────────────────────────────
  // GROUP_CONCAT(): agrupa todas las filas con el mismo id de álbum
  // y concatena los géneros en un solo string: "Alternative Rock, Grunge".
  fastify.get('/api/albums', async (request, reply) => {
    const [rows] = await pool.execute(`
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
      JOIN  Artista      ar ON ar.id       = a.id_artista
      LEFT JOIN Album_Genero ag ON ag.id_album  = a.id
      LEFT JOIN Genero        g  ON g.id         = ag.id_genero
      GROUP BY a.id, a.titulo, a.anio, a.url_portada, a.track_count,
               ar.id, ar.nombre
      ORDER BY ar.nombre ASC, a.anio DESC
    `)
    return rows
  })


  // ── GET /api/albums/:id ────────────────────────────────────────────────────
  // Detalle de un álbum por ID
  // Devuelve 404 si no existe.
  fastify.get('/api/albums/:id', {
    schema: {
      params: {
        type: 'object',
        properties: { id: { type: 'integer', minimum: 1 } },
        required: ['id']
      }
    }
  }, async (request, reply) => {
    const { id } = request.params

    const [rows] = await pool.execute(`
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
      JOIN  Artista      ar ON ar.id       = a.id_artista
      LEFT JOIN Album_Genero ag ON ag.id_album  = a.id
      LEFT JOIN Genero        g  ON g.id         = ag.id_genero
      WHERE a.id = ?
      GROUP BY a.id, a.titulo, a.anio, a.url_portada, a.track_count,
               ar.id, ar.nombre
    `, [id])

    if (rows.length === 0) {
      return reply.code(404).send({ error: 'Álbum no encontrado' })
    }

    return rows[0]
  })

}

module.exports = albumsRoutes
