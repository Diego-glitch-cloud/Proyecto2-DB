'use strict'

const pool = require('../db')
const requireRol = require('../hooks/authorize')

async function ventasRoutes(fastify) {

  // ── POST /api/ventas ───────────────────────────────────────────────────────
  // Registra una compra completa.
  // Solo vendedores y admins pueden crear ventas
  //
  // Body esperado:
  //   {
  //     "id_cliente": 3,
  //     "items": [
  //       { "id_producto": 1, "cantidad": 2 },
  //       { "id_producto": 5, "cantidad": 1 }
  //     ]
  //   }
  //
  // El id_empleado se obtiene del JWT (request.user.id = Persona.id)
  fastify.post('/api/ventas', {
    preHandler: requireRol('admin', 'vendedor'),
    schema: {
      body: {
        type: 'object',
        required: ['id_cliente', 'items'],
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
    const { id_cliente, items } = request.body
    const idPersonaEmpleado = request.user.id   // Persona.id del vendedor logueado

    const conn = await pool.getConnection()

    try {

      // ── VALIDACIONES PRE-TRANSACCIÓN ────────────────────────────────────
      // Verificar que el cliente existe
      const [[clienteRow]] = await conn.execute(
        'SELECT EXISTS(SELECT 1 FROM Cliente WHERE id = ?) AS existe',
        [id_cliente]
      )
      if (!clienteRow.existe) {
        return reply.code(422).send({ error: `No existe ningún cliente con id ${id_cliente}` })
      }

      // Traducir Persona.id  Empleado.id
      const [[empleadoRow]] = await conn.execute(
        'SELECT id FROM Empleado WHERE id_persona = ?',
        [idPersonaEmpleado]
      )
      if (!empleadoRow) {
        // Esto solo pasa si alguien con rol vendedor/admin no tiene fila en Empleado
        return reply.code(422).send({ error: 'El usuario autenticado no tiene registro de empleado' })
      }
      const id_empleado = empleadoRow.id

      // ── INICIO DE TRANSACCIÓN ───────────────────────────────────────────
      await conn.beginTransaction()

      // ── PASO 5.2 ─────────────────────────────────────────────────────────
      // INSERT INTO Compra → obtener id de la compra recién creada (insertId)
      // [se implementará en el siguiente paso]

      // ── PASO 5.3 + 5.4 ───────────────────────────────────────────────────
      // Para cada item:
      //   1. Verificar stock disponible
      //   2. INSERT INTO DetalleVenta
      //   3. UPDATE Producto SET stock = stock - cantidad
      //   Si el stock es insuficiente → ROLLBACK y respuesta 409
      // [se implementará en el siguiente paso]

      await conn.commit()

      // Respuesta provisional 
      return reply.code(201).send({ message: 'Transacción iniciada (implementación pendiente)' })

    } catch (err) {
      // Si algo lanzó un error dentro de la transacción, deshacer todo.
      await conn.rollback()
      throw err
    } finally {
      // Siempre liberar la conexión al pool, con o sin error.
      conn.release()
    }
  })

}

module.exports = ventasRoutes
