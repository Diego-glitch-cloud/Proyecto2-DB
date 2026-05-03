'use strict'

const pool = require('../db')

async function catalogosRoutes(fastify) {

  // ── GET /api/categorias ────────────────────────────────────────────────────
  // Devuelve todas las categorías comerciales de producto
  fastify.get('/api/categorias', async (request, reply) => {
    const [rows] = await pool.execute(
      'SELECT id, detalle FROM Categoria ORDER BY detalle ASC'
    )
    return rows
  })

}

module.exports = catalogosRoutes
