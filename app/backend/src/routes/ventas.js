'use strict'

const pool = require('../db')
const authenticate  = require('../hooks/authenticate')
const requireRol    = require('../hooks/authorize')

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

      // insertar compra
      const [result] = await conn.execute(
        'INSERT INTO Compra (id_cliente, id_empleado) VALUES (?, ?)',
        [id_cliente, id_empleado]
      )
      const id_compra = result.insertId

      // bucle de items ───────────────────────────────────
      for (const { id_producto, cantidad } of items) {

        // SELECT ... FOR UPDATE bloquea la fila mientras dure la transacción.
        // Sin este lock, dos compras simultáneas podrían leer el mismo stock,
        // ambas ver que hay suficiente, y terminar dejando el stock negativo.
        const [[producto]] = await conn.execute(
          'SELECT precio, stock FROM Producto WHERE id = ? FOR UPDATE',
          [id_producto]
        )

        if (!producto) {
          await conn.rollback()
          return reply.code(422).send({ error: `No existe el producto con id ${id_producto}` })
        }

        // verificar stock antes de escribir ───────────────────
        if (producto.stock < cantidad) {
          await conn.rollback()
          return reply.code(409).send({
            error:               `Stock insuficiente para el producto ${id_producto}`,
            stock_disponible:    producto.stock,
            cantidad_solicitada: cantidad
          })
        }

        // precio_unitario = snapshot del precio en este momento.
        await conn.execute(
          `INSERT INTO DetalleVenta (id_compra, id_producto, cantidad, precio_unitario)
           VALUES (?, ?, ?, ?)`,
          [id_compra, id_producto, cantidad, producto.precio]
        )


        await conn.execute(
          'UPDATE Producto SET stock = stock - ? WHERE id = ?',
          [cantidad, id_producto]
        )
      }

      await conn.commit()

      // Consultar el recibo completo usando la vista vw_resumen_ventas.
      const [detalles] = await pool.execute(
        'SELECT * FROM vw_resumen_ventas WHERE id_compra = ?',
        [id_compra]
      )

      return reply.code(201).send({
        id_compra,
        fecha:       detalles[0]?.fecha       ?? null,
        id_cliente,
        id_empleado: id_empleado              ?? null,
        items:       detalles.map(d => ({
          id_producto:     d.id_producto,
          nombre_producto: `${d.nombre_artista} - ${d.titulo_album} (${d.tipo_formato})`,
          cantidad:        d.cantidad,
          precio_unitario: d.precio_unitario,
          subtotal:        d.subtotal
        })),
        total: detalles.reduce((sum, d) => sum + Number(d.subtotal), 0).toFixed(2)
      })

    } catch (err) {
      await conn.rollback()
      throw err
    } finally {
      conn.release()
    }
  })


  // ── POST /api/ventas/presencial ───────────────────────────────────────────
  // Registra una venta presencial en tienda. Solo admin y vendedor.
  //
  //   Con cuenta:  { correo: "x@y.com", items: [...] }
  //     → busca la Persona por correo, resuelve su Cliente.id, lo vincula.
  //   Sin cuenta:  { nombre_cf: "Juan Pérez", nit_cf: "CF", items: [...] }
  //     → id_cliente queda NULL; nombre_cf/nit_cf se guardan directo en Compra.
  //
  // Transacción explícita con ROLLBACK por stock insuficiente.
  fastify.post('/api/ventas/presencial', {
    preHandler: requireRol('admin', 'vendedor'),
    schema: {
      body: {
        type: 'object',
        required: ['items'],
        properties: {
          correo:    { type: 'string' },
          nombre_cf: { type: 'string', minLength: 1, maxLength: 200 },
          nit_cf:    { type: 'string', minLength: 1, maxLength: 20  },
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
    const { correo, nombre_cf, nit_cf, items } = request.body
    const { id: idPersona } = request.user

    if (!correo && !nombre_cf) {
      return reply.code(400).send({ error: 'Debe indicar el correo del cliente o el nombre para CF' })
    }

    // nit_cf puede llegar aunque haya correo: significa que el cliente quiere
    // facturar a un NIT diferente al de su perfil solo para esta venta.

    const conn = await pool.getConnection()
    try {
      // Resolver id_empleado del JWT
      const [[empFila]] = await conn.execute(
        'SELECT id FROM Empleado WHERE id_persona = ?', [idPersona]
      )
      if (!empFila) {
        return reply.code(422).send({ error: 'El usuario autenticado no tiene registro de empleado' })
      }
      const id_empleado = empFila.id

      // Resolver id_cliente (cuenta existente) o preparar datos CF
      let id_cliente      = null
      let nombre_cf_final = null
      let nit_cf_final    = null

      if (correo) {
        const [[personaFila]] = await conn.execute(
          'SELECT id FROM Persona WHERE correo = ?', [correo]
        )
        if (!personaFila) {
          return reply.code(422).send({ error: `No existe ninguna cuenta con correo: ${correo}` })
        }
        const [[clienteFila]] = await conn.execute(
          'SELECT id FROM Cliente WHERE id_persona = ?', [personaFila.id]
        )
        if (!clienteFila) {
          return reply.code(422).send({ error: `La cuenta ${correo} no tiene perfil de cliente` })
        }
        id_cliente = clienteFila.id
        // Si el vendedor especificó un NIT distinto para esta venta, guardarlo.
        // La vista usa COALESCE(nit_cf, cli.NIT), así que nit_cf tiene prioridad.
        if (nit_cf) nit_cf_final = nit_cf
      } else {
        nombre_cf_final = nombre_cf
        nit_cf_final    = nit_cf || 'CF'
      }

      await conn.beginTransaction()

      const [result] = await conn.execute(
        'INSERT INTO Compra (id_cliente, id_empleado, nombre_cf, nit_cf) VALUES (?, ?, ?, ?)',
        [id_cliente, id_empleado, nombre_cf_final, nit_cf_final]
      )
      const id_compra = result.insertId

      for (const { id_producto, cantidad } of items) {
        const [[producto]] = await conn.execute(
          'SELECT precio, stock FROM Producto WHERE id = ? FOR UPDATE', [id_producto]
        )
        if (!producto) {
          await conn.rollback()
          return reply.code(422).send({ error: `No existe el producto con id ${id_producto}` })
        }
        if (producto.stock < cantidad) {
          await conn.rollback()
          return reply.code(409).send({
            error:               `Stock insuficiente para el producto ${id_producto}`,
            stock_disponible:    producto.stock,
            cantidad_solicitada: cantidad
          })
        }
        await conn.execute(
          `INSERT INTO DetalleVenta (id_compra, id_producto, cantidad, precio_unitario)
           VALUES (?, ?, ?, ?)`,
          [id_compra, id_producto, cantidad, producto.precio]
        )
        await conn.execute(
          'UPDATE Producto SET stock = stock - ? WHERE id = ?', [cantidad, id_producto]
        )
      }

      await conn.commit()

      const [detalles] = await pool.execute(
        'SELECT * FROM vw_resumen_ventas WHERE id_compra = ?', [id_compra]
      )

      return reply.code(201).send({
        id_compra,
        fecha:          detalles[0]?.fecha          ?? null,
        nombre_cliente: detalles[0]?.nombre_cliente ?? null,
        nit_cliente:    detalles[0]?.nit_cliente    ?? null,
        id_empleado,
        items: detalles.map(d => ({
          id_producto:     d.id_producto,
          nombre_producto: `${d.nombre_artista} - ${d.titulo_album} (${d.tipo_formato})`,
          cantidad:        d.cantidad,
          precio_unitario: d.precio_unitario,
          subtotal:        d.subtotal
        })),
        total: detalles.reduce((sum, d) => sum + Number(d.subtotal), 0).toFixed(2)
      })

    } catch (err) {
      await conn.rollback()
      throw err
    } finally {
      conn.release()
    }
  })


  // ── GET /api/ventas ────────────────────────────────────────────────────────
  // Reporte completo de ventas. Solo admin y vendedor.
  // Acepta filtros opcionales por rango de fechas:
  //   ?fecha_desde=2025-01-01&fecha_hasta=2025-12-31
  //
  // Usa un CTE para pre-calcular el total y el conteo de productos por compra,
  // luego hace JOIN con vw_resumen_ventas para traer el detalle de cada item.
  // El CTE evita repetir el GROUP BY en cada fila del resultado final.
  fastify.get('/api/ventas', {
    preHandler: requireRol('admin', 'vendedor'),
    schema: {
      querystring: {
        type: 'object',
        properties: {
          fecha_desde: { type: 'string' },
          fecha_hasta: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    const { fecha_desde, fecha_hasta } = request.query

    // Construimos el filtro de fechas solo si se enviaron los parámetros.
    // Sin filtro devuelve todas las ventas.
    const condiciones = []
    const params      = []

    if (fecha_desde) { condiciones.push('v.fecha >= ?'); params.push(fecha_desde) }
    if (fecha_hasta) { condiciones.push('v.fecha <= ?'); params.push(fecha_hasta) }

    const WHERE = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : ''

    // CTE totales_compra: calcula una vez el total y número de productos
    // distintos de cada compra. El JOIN posterior lo aplica a cada fila
    // de la vista sin recalcular.
    const [filas] = await pool.execute(`
      WITH totales_compra AS (
        SELECT
          id_compra,
          SUM(cantidad * precio_unitario) AS total,
          COUNT(DISTINCT id_producto)     AS num_productos
        FROM DetalleVenta
        GROUP BY id_compra
      )
      SELECT
        v.*,
        t.total          AS total_compra,
        t.num_productos
      FROM vw_resumen_ventas v
      JOIN totales_compra t ON t.id_compra = v.id_compra
      ${WHERE}
      ORDER BY v.fecha DESC, v.id_compra DESC
    `, params)

    
    return agruparPorCompra(filas)
  })


  // ── GET /api/ventas/mis-compras ────────────────────────────────────────────
  // Historial de compras del cliente autenticado.
  // Filtra la vista por su id_cliente, derivado del JWT.
  fastify.get('/api/ventas/mis-compras', {
    preHandler: authenticate
  }, async (request, reply) => {
    const idPersona = request.user.id

    const [[clienteRow]] = await pool.execute(
      'SELECT id FROM Cliente WHERE id_persona = ?',
      [idPersona]
    )
    if (!clienteRow) {
      return reply.code(404).send({ error: 'El usuario no tiene perfil de cliente' })
    }

    // La vista no expone id_cliente, así que hacemos JOIN con Compra para filtrar.
    const [filas] = await pool.execute(`
      SELECT v.*
      FROM vw_resumen_ventas v
      JOIN Compra c ON c.id = v.id_compra
      WHERE c.id_cliente = ?
      ORDER BY v.fecha DESC, v.id_compra DESC
    `, [clienteRow.id])

    return agruparPorCompra(filas)
  })

}

// ── Helper: agrupa filas planas de la vista en compras con items anidados ──
// La vista devuelve una fila por item de cada compra. Esta función las
// convierte en un array de compras, cada una con su array de items.
function agruparPorCompra(filas) {
  const mapa = new Map()

  for (const f of filas) {
    if (!mapa.has(f.id_compra)) {
      mapa.set(f.id_compra, {
        id_compra:       f.id_compra,
        fecha:           f.fecha,
        nombre_cliente:  f.nombre_cliente,
        nit_cliente:     f.nit_cliente,
        nombre_empleado: f.nombre_empleado ?? 'Online',
        items:           [],
        total:           0
      })
    }
    const compra = mapa.get(f.id_compra)
    compra.items.push({
      id_producto:     f.id_producto,
      nombre_artista:  f.nombre_artista,
      titulo_album:    f.titulo_album,
      tipo_formato:    f.tipo_formato,
      categoria:       f.categoria,
      cantidad:        f.cantidad,
      precio_unitario: f.precio_unitario,
      subtotal:        f.subtotal
    })
    compra.total = Number(compra.total) + Number(f.subtotal)
  }

  // Redondear total a 2 decimales en cada compra
  return Array.from(mapa.values()).map(c => ({
    ...c,
    total: Number(c.total).toFixed(2)
  }))
}

module.exports = ventasRoutes
