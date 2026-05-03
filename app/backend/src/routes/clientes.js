'use strict'

const pool       = require('../db')
const authenticate = require('../hooks/authenticate')
const requireRol = require('../hooks/authorize')

async function clientesRoutes(fastify) {

  // ── GET /api/clientes/mi-perfil ───────────────────────────────────────────
  // Devuelve NIT, dirección y datos de la persona del cliente autenticado.
  fastify.get('/api/clientes/mi-perfil', {
    preHandler: authenticate
  }, async (req, reply) => {
    const [[row]] = await pool.execute(`
      SELECT c.id, c.NIT, c.direccion, p.nombre, p.correo
      FROM   Cliente c
      JOIN   Persona p ON p.id = c.id_persona
      WHERE  c.id_persona = ?
    `, [req.user.id])

    if (!row) return reply.code(404).send({ error: 'Perfil de cliente no encontrado' })
    return row
  })


  // ── PATCH /api/clientes/mi-perfil ─────────────────────────────────────────
  // Actualiza NIT y/o dirección del cliente autenticado.
  fastify.patch('/api/clientes/mi-perfil', {
    preHandler: authenticate,
    schema: {
      body: {
        type: 'object',
        properties: {
          NIT:       { type: 'string', minLength: 1 },
          direccion: { type: ['string', 'null'] }
        },
        additionalProperties: false
      }
    }
  }, async (req, reply) => {
    const { NIT, direccion } = req.body
    const sets   = []
    const params = []

    if (NIT       !== undefined) { sets.push('NIT = ?');       params.push(NIT) }
    if (direccion !== undefined) { sets.push('direccion = ?'); params.push(direccion) }
    if (!sets.length) return reply.code(400).send({ error: 'Ningún campo para actualizar' })

    params.push(req.user.id)
    await pool.execute(`UPDATE Cliente SET ${sets.join(', ')} WHERE id_persona = ?`, params)

    const [[updated]] = await pool.execute(`
      SELECT c.id, c.NIT, c.direccion, p.nombre, p.correo
      FROM Cliente c JOIN Persona p ON p.id = c.id_persona
      WHERE c.id_persona = ?
    `, [req.user.id])
    return updated
  })


  // ── GET /api/admin/buscar-cliente ────────────────────────────────────────
  // Busca un cliente por correo. Usado en el modal de venta presencial para
  // verificar que la cuenta existe antes de enviar la orden.
  fastify.get('/api/admin/buscar-cliente', {
    preHandler: requireRol('admin', 'vendedor'),
    schema: {
      querystring: {
        type: 'object',
        required: ['correo'],
        properties: { correo: { type: 'string' } }
      }
    }
  }, async (req, reply) => {
    const [[row]] = await pool.execute(`
      SELECT c.id, p.nombre, p.correo, c.NIT
      FROM   Persona p
      JOIN   Cliente c ON c.id_persona = p.id
      WHERE  p.correo = ?
    `, [req.query.correo])
    if (!row) return reply.code(404).send({ error: 'No existe ningún cliente con ese correo' })
    return row
  })


  // ── GET /api/admin/clientes ───────────────────────────────────────────────
  // Lista de todos los clientes (para vista de admin/vendedor).
  fastify.get('/api/admin/clientes', {
    preHandler: requireRol('admin', 'vendedor')
  }, async () => {
    const [rows] = await pool.execute(`
      SELECT c.id, c.NIT, c.direccion, p.nombre, p.correo
      FROM   Cliente c
      JOIN   Persona p ON p.id = c.id_persona
      ORDER BY p.nombre ASC
    `)
    return rows
  })

}

module.exports = clientesRoutes
