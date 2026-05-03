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

  // ── GET /api/generos ───────────────────────────────────────────────────────
  // Géneros musicales que clasifican los álbumes (tabla Genero, no Categoria).
  fastify.get('/api/generos', async (request, reply) => {
    const [rows] = await pool.execute(
      'SELECT id, detalle FROM Genero ORDER BY detalle ASC'
    )
    return rows
  })

  // ── GET /api/proveedores ───────────────────────────────────────────────────
  fastify.get('/api/proveedores', async (request, reply) => {
    const [rows] = await pool.execute(
      'SELECT id, nombre FROM Proveedor ORDER BY nombre ASC'
    )
    return rows
  })

}

module.exports = catalogosRoutes
