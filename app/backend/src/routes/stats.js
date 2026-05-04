'use strict'

const pool = require('../db')

async function statsRoutes(fastify) {

  // ── GET /api/stats/publico ─────────────────────────────────────────────────
  // Stats reales de la DB sin autenticación — para el login page.
  // Usa subqueries en un solo SELECT para evitar 6 roundtrips.
  fastify.get('/api/stats/publico', async () => {
    const [[stats]] = await pool.execute(`
      SELECT
        (SELECT COUNT(*) FROM Producto)                 AS total_productos,
        (SELECT COUNT(*) FROM Genero)                   AS total_generos,
        (SELECT COUNT(*) FROM Proveedor)                AS total_proveedores,
        (SELECT COUNT(*) FROM Cliente)                  AS total_clientes,
        (SELECT COUNT(*) FROM Compra)                   AS total_ventas,
        (SELECT COUNT(*) FROM Producto WHERE stock < 5) AS alertas_stock
    `)
    return stats
  })

}

module.exports = statsRoutes
