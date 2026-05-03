'use strict'

const bcrypt     = require('bcryptjs')
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

  // ── GET /api/admin/empleados ──────────────────────────────────────────────
  // Lista de todos los empleados registrados (admin y vendedor).
  fastify.get('/api/admin/empleados', {
    preHandler: requireRol('admin', 'vendedor')
  }, async () => {
    const [rows] = await pool.execute(`
      SELECT e.id, e.DPI, p.nombre, p.correo, r.detalle AS rol
      FROM   Empleado e
      JOIN   Persona  p ON p.id    = e.id_persona
      JOIN   Rol      r ON r.id    = p.id_rol
      ORDER  BY p.nombre ASC
    `)
    return rows
  })


  // ── POST /api/admin/empleados ─────────────────────────────────────────────
  // Registra un nuevo empleado (Persona + Empleado). Solo admin.
  // Transacción explícita: si falla el INSERT de Empleado, se deshace Persona.
  fastify.post('/api/admin/empleados', {
    preHandler: requireRol('admin'),
    schema: {
      body: {
        type: 'object',
        required: ['nombre', 'correo', 'contrasena', 'DPI'],
        properties: {
          nombre:     { type: 'string', minLength: 2 },
          correo:     { type: 'string', format: 'email' },
          contrasena: { type: 'string', minLength: 6 },
          DPI:        { type: 'string', minLength: 13, maxLength: 13, pattern: '^[0-9]{13}$' },
          rol:        { type: 'string', enum: ['vendedor', 'admin'], default: 'vendedor' }
        },
        additionalProperties: false
      }
    }
  }, async (req, reply) => {
    const { nombre, correo, contrasena, DPI, rol = 'vendedor' } = req.body
    const conn = await pool.getConnection()
    try {
      const [[exCorreo]] = await conn.execute(
        'SELECT EXISTS(SELECT 1 FROM Persona WHERE correo = ?) AS existe', [correo]
      )
      if (exCorreo.existe) return reply.code(409).send({ error: 'El correo ya está registrado' })

      const [[exDPI]] = await conn.execute(
        'SELECT EXISTS(SELECT 1 FROM Empleado WHERE DPI = ?) AS existe', [DPI]
      )
      if (exDPI.existe) return reply.code(409).send({ error: 'El DPI ya está registrado' })

      const [[rolRow]] = await conn.execute('SELECT id FROM Rol WHERE detalle = ?', [rol])
      if (!rolRow) return reply.code(422).send({ error: `Rol '${rol}' no encontrado` })

      const hash = await bcrypt.hash(contrasena, 12)

      await conn.beginTransaction()

      const [pResult] = await conn.execute(
        'INSERT INTO Persona (nombre, correo, contrasena, id_rol) VALUES (?, ?, ?, ?)',
        [nombre, correo, hash, rolRow.id]
      )
      await conn.execute(
        'INSERT INTO Empleado (id_persona, DPI) VALUES (?, ?)',
        [pResult.insertId, DPI]
      )

      await conn.commit()
      return reply.code(201).send({ nombre, correo, DPI, rol })

    } catch (err) {
      await conn.rollback()
      throw err
    } finally {
      conn.release()
    }
  })

}

module.exports = clientesRoutes
