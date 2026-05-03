'use strict'

const pool = require('../db')
const authenticate = require('../hooks/authenticate')

async function ventasRoutes(fastify) {

  // ── POST /api/ventas ───────────────────────────────────────────────────────
  // Registra una compra. Acepta dos canales:
  //
  //   Canal ONLINE  (rol: cliente)
  //     El cliente compra para sí mismo desde la web.
  //     id_cliente   → se resuelve automáticamente desde el JWT
  //     id_empleado  → NULL (no hay empleado involucrado)
  //     Body: { items: [...] }
  //
  //   Canal TIENDA  (rol: vendedor | admin)
  //     Un empleado registra la venta a nombre de un cliente.
  //     id_empleado  → se resuelve automáticamente desde el JWT
  //     id_cliente   → debe venir en el body
  //     Body: { id_cliente: 3, items: [...] }
  //
  // Todos los roles autenticados pueden acceder; la lógica interna
  // bifurca según request.user.rol.
  fastify.post('/api/ventas', {
    preHandler: authenticate,
    schema: {
      body: {
        type: 'object',
        required: ['items'],
        properties: {
          id_cliente: { type: 'integer', minimum: 1 },
          items: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'object',
              required: ['id_producto', 'cantidad'],
              properties: {
                id_producto: { type: 'integer', minimum: 1 },
                cantidad:    { type: 'integer', minimum: 1 }
              },
              additionalProperties: false
            }
          }
        },
        additionalProperties: false
      }
    }
  }, async (request, reply) => {
    const { items } = request.body
    const { id: idPersona, rol } = request.user

    const conn = await pool.getConnection()

    try {

      // ── RESOLUCIÓN DE id_cliente e id_empleado SEGÚN CANAL ───────────────
      let id_cliente, id_empleado

      if (rol === 'cliente') {
        // Canal online: el cliente compra para sí mismo
        const [[fila]] = await conn.execute(
          'SELECT id FROM Cliente WHERE id_persona = ?',
          [idPersona]
        )
        if (!fila) {
          return reply.code(422).send({ error: 'El usuario no tiene perfil de cliente' })
        }
        id_cliente  = fila.id
        id_empleado = null        // compra online → sin empleado

      } else {
        // Canal tienda: el empleado especifica el cliente en el body
        if (!request.body.id_cliente) {
          return reply.code(400).send({ error: 'id_cliente es requerido para ventas en tienda' })
        }
        id_cliente = request.body.id_cliente

        const [[clienteRow]] = await conn.execute(
          'SELECT EXISTS(SELECT 1 FROM Cliente WHERE id = ?) AS existe',
          [id_cliente]
        )
        if (!clienteRow.existe) {
          return reply.code(422).send({ error: `No existe ningún cliente con id ${id_cliente}` })
        }

        // Traducir Persona.id → Empleado.id
        const [[empFila]] = await conn.execute(
          'SELECT id FROM Empleado WHERE id_persona = ?',
          [idPersona]
        )
        if (!empFila) {
          return reply.code(422).send({ error: 'El usuario autenticado no tiene registro de empleado' })
        }
        id_empleado = empFila.id
      }

      // ── INICIO DE TRANSACCIÓN ────────────────────────────────────────────
      await conn.beginTransaction()

      // ── PASO 5.2 ─────────────────────────────────────────────────────────
      // INSERT INTO Compra → obtener id_compra (insertId)
      // [se implementará en el siguiente paso]

      // ── PASO 5.3 + 5.4 ───────────────────────────────────────────────────
      // Para cada item: verificar stock, INSERT DetalleVenta, UPDATE stock
      // [se implementará en el siguiente paso]

      await conn.commit()

      return reply.code(201).send({ message: 'Transacción iniciada (implementación pendiente)' })

    } catch (err) {
      await conn.rollback()
      throw err
    } finally {
      conn.release()
    }
  })

}

module.exports = ventasRoutes
