'use strict'

const bcrypt = require('bcryptjs')
const pool = require('../db')


async function authRoutes(fastify) {

  // ── REGISTER ──────────────────────────────────────────────────────────────
  // Cualquier persona que se registre desde la UI pública recibe rol "cliente".
  // Los admin y vendedores son creados por un admin dentro del sistema (más adelante).
  fastify.post('/api/auth/register', {
    schema: {
      // Fastify valida el body antes de que llegue a nuestro código.
      // Si falta un campo requerido o el tipo es incorrecto, responde 400 automáticamente.
      body: {
        type: 'object',
        required: ['nombre', 'correo', 'contrasena'],
        properties: {
          nombre:    { type: 'string', minLength: 2 },
          correo:    { type: 'string', format: 'email' },
          contrasena: { type: 'string', minLength: 6 }
        },
        additionalProperties: false
      }
    }
  }, async (request, reply) => {
    const { nombre, correo, contrasena } = request.body

    const conn = await pool.getConnection()

    try {
      // Verificar si el correo ya está en uso
      const [existing] = await conn.execute(
        'SELECT id FROM Persona WHERE correo = ?',
        [correo]
      )
      if (existing.length > 0) {
        return reply.code(409).send({ error: 'El correo ya está registrado' })
      }

      
      const hash = await bcrypt.hash(contrasena, 12)

      // ── TRANSACCIÓN EXPLÍCITA ──────────────────────────────────────────────
      // Si el INSERT de Persona tiene éxito pero el de Cliente falla,
      // el ROLLBACK deshace ambos y la DB queda en estado consistente.
      await conn.beginTransaction()

      // Buscar el id del rol "cliente" por nombre
      const [roles] = await conn.execute(
        'SELECT id FROM Rol WHERE detalle = ?',
        ['cliente']
      )
      const idRolCliente = roles[0].id

      const [personaResult] = await conn.execute(
        'INSERT INTO Persona (nombre, correo, contrasena, id_rol) VALUES (?, ?, ?, ?)',
        [nombre, correo, hash, idRolCliente]
      )

      // Toda persona con rol cliente necesita su fila en Cliente.
      // NIT = 'CF' por defecto
      // direccion = NULL porque es opcional y el usuario puede definirla luego en su perfil.
      await conn.execute(
        'INSERT INTO Cliente (id_persona, NIT, direccion) VALUES (?, ?, NULL)',
        [personaResult.insertId, 'CF']
      )

      await conn.commit()

      return reply.code(201).send({ message: 'Cuenta creada correctamente' })

    } catch (err) {
      
      await conn.rollback()
      throw err  //responde 500
    } finally {
      conn.release()
    }
  })


  // ── LOGIN ──────────────────────────────────────────────────────────────────
  fastify.post('/api/auth/login', {
    schema: {
      body: {
        type: 'object',
        required: ['correo', 'contrasena'],
        properties: {
          correo:    { type: 'string', format: 'email' },
          contrasena: { type: 'string' }
        },
        additionalProperties: false
      }
    }
  }, async (request, reply) => {
    const { correo, contrasena } = request.body

    // Traer la persona junto con su rol en una sola consulta
    const [rows] = await pool.execute(
      `SELECT p.id, p.nombre, p.correo, p.contrasena, p.id_rol, r.detalle AS rol
       FROM Persona p
       JOIN Rol r ON r.id = p.id_rol
       WHERE p.correo = ?`,
      [correo]
    )

    // Siempre se responde lo mismo por seguridad 
    if (rows.length === 0) {
      return reply.code(401).send({ error: 'Credenciales incorrectas' })
    }

    const persona = rows[0]
    const match = await bcrypt.compare(contrasena, persona.contrasena)
    if (!match) {
      return reply.code(401).send({ error: 'Credenciales incorrectas' })
    }

    // Firmar el JWT con los datos que el frontend necesita saber del usuario
    const token = fastify.jwt.sign({
      id:     persona.id,
      nombre: persona.nombre,
      rol:    persona.rol
    })

    return reply.send({ token, rol: persona.rol, nombre: persona.nombre })
  })
}

module.exports = authRoutes