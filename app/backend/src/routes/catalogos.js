'use strict'

const pool = require('../db')

async function catalogosRoutes(fastify) {

  fastify.get('/api/categorias', async () => {
    const [rows] = await pool.execute('SELECT id, detalle FROM Categoria ORDER BY detalle ASC')
    return rows
  })

  fastify.get('/api/generos', async () => {
    const [rows] = await pool.execute('SELECT id, detalle FROM Genero ORDER BY detalle ASC')
    return rows
  })

  fastify.get('/api/proveedores', async () => {
    const [rows] = await pool.execute('SELECT id, nombre FROM Proveedor ORDER BY nombre ASC')
    return rows
  })

  // ── GET /api/album-tipos ───────────────────────────────────────────────────
  // Formatos físicos: Vinilo, CD, Cassette, Edición Limitada.
  fastify.get('/api/album-tipos', async () => {
    const [rows] = await pool.execute('SELECT id, detalle FROM Album_Tipo ORDER BY detalle ASC')
    return rows
  })

}

module.exports = catalogosRoutes
