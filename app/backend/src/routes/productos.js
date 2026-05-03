'use strict'

const pool       = require('../db')
const requireRol = require('../hooks/authorize')

// Query base: JOIN de 6 tablas + subquery de géneros.
// La subquery de géneros evita el GROUP BY en todas las columnas del producto.
const SQL_PRODUCTO = `
  SELECT
    p.id,
    p.precio,
    p.stock,
    alb.id          AS id_album,
    alb.titulo      AS titulo_album,
    alb.anio        AS anio_album,
    alb.url_portada,
    alb.track_count,
    art.id          AS id_artista,
    art.nombre      AS artista,
    at.id           AS id_album_tipo,
    at.detalle      AS tipo_formato,
    cat.id          AS id_categoria,
    cat.detalle     AS categoria,
    prov.id         AS id_proveedor,
    prov.nombre     AS proveedor,
    CONCAT(art.nombre, ' - ', alb.titulo, ' (', at.detalle, ')') AS nombre_producto,
    (
      SELECT GROUP_CONCAT(g.detalle ORDER BY g.detalle SEPARATOR ', ')
      FROM   Album_Genero ag
      JOIN   Genero g ON g.id = ag.id_genero
      WHERE  ag.id_album = p.id_album
    ) AS generos
  FROM      Producto   p
  JOIN      Album      alb  ON alb.id  = p.id_album
  JOIN      Artista    art  ON art.id  = alb.id_artista
  JOIN      Album_Tipo at   ON at.id   = p.id_album_tipo
  JOIN      Categoria  cat  ON cat.id  = p.id_categoria
  JOIN      Proveedor  prov ON prov.id = p.id_proveedor
`

async function productosRoutes(fastify) {

  // ── GET /api/productos/mas-vendidos ───────────────────────────────────────
  // Top N productos por unidades vendidas (SUM de DetalleVenta).
  // Declarado antes de /api/productos para que el router no interprete
  // "mas-vendidos" como un :id numérico.
  fastify.get('/api/productos/mas-vendidos', {
    schema: {
      querystring: {
        type: 'object',
        properties: { limit: { type: 'integer', minimum: 1, maximum: 20, default: 8 } }
      }
    }
  }, async (request) => {
    const limit = request.query.limit ?? 8
    const [rows] = await pool.execute(`
      SELECT
        p.id, p.precio, p.stock,
        alb.titulo      AS titulo_album,
        alb.anio        AS anio_album,
        alb.url_portada,
        art.nombre      AS artista,
        at.detalle      AS tipo_formato,
        COALESCE(SUM(dv.cantidad), 0) AS total_vendido,
        (
          SELECT GROUP_CONCAT(g.detalle ORDER BY g.detalle SEPARATOR ', ')
          FROM   Album_Genero ag
          JOIN   Genero g ON g.id = ag.id_genero
          WHERE  ag.id_album = p.id_album
        ) AS generos
      FROM      Producto     p
      JOIN      Album        alb ON alb.id  = p.id_album
      JOIN      Artista      art ON art.id  = alb.id_artista
      JOIN      Album_Tipo   at  ON at.id   = p.id_album_tipo
      LEFT JOIN DetalleVenta dv  ON dv.id_producto = p.id
      GROUP BY  p.id
      ORDER BY  total_vendido DESC, p.id ASC
      LIMIT ?
    `, [limit])
    return rows
  })


  // ── GET /api/productos ─────────────────────────────────────────────────────
  fastify.get('/api/productos', async () => {
    const [rows] = await pool.execute(
      SQL_PRODUCTO + `ORDER BY art.nombre ASC, alb.titulo ASC, at.detalle ASC`
    )
    return rows
  })


  // ── POST /api/productos ────────────────────────────────────────────────────
  fastify.post('/api/productos', {
    preHandler: requireRol('admin', 'vendedor'),
    schema: {
      body: {
        type: 'object',
        required: ['precio', 'stock', 'id_album', 'id_album_tipo', 'id_categoria', 'id_proveedor'],
        properties: {
          precio:        { type: 'number',  minimum: 0.01 },
          stock:         { type: 'integer', minimum: 0    },
          id_album:      { type: 'integer', minimum: 1    },
          id_album_tipo: { type: 'integer', minimum: 1    },
          id_categoria:  { type: 'integer', minimum: 1    },
          id_proveedor:  { type: 'integer', minimum: 1    }
        },
        additionalProperties: false
      }
    }
  }, async (req, reply) => {
    const { precio, stock, id_album, id_album_tipo, id_categoria, id_proveedor } = req.body

    // Validar FKs con EXISTS
    const [[fks]] = await pool.execute(`
      SELECT
        EXISTS(SELECT 1 FROM Album      WHERE id = ?) AS album_ok,
        EXISTS(SELECT 1 FROM Album_Tipo WHERE id = ?) AS tipo_ok,
        EXISTS(SELECT 1 FROM Categoria  WHERE id = ?) AS cat_ok,
        EXISTS(SELECT 1 FROM Proveedor  WHERE id = ?) AS prov_ok
    `, [id_album, id_album_tipo, id_categoria, id_proveedor])

    if (!fks.album_ok)  return reply.code(422).send({ error: `No existe el álbum id ${id_album}` })
    if (!fks.tipo_ok)   return reply.code(422).send({ error: `No existe el formato id ${id_album_tipo}` })
    if (!fks.cat_ok)    return reply.code(422).send({ error: `No existe la categoría id ${id_categoria}` })
    if (!fks.prov_ok)   return reply.code(422).send({ error: `No existe el proveedor id ${id_proveedor}` })

    // Verificar UNIQUE(id_album, id_album_tipo)
    const [[dup]] = await pool.execute(
      'SELECT EXISTS(SELECT 1 FROM Producto WHERE id_album = ? AND id_album_tipo = ?) AS existe',
      [id_album, id_album_tipo]
    )
    if (dup.existe) return reply.code(409).send({ error: 'Ya existe un producto con ese álbum y formato' })

    const [result] = await pool.execute(
      `INSERT INTO Producto (precio, stock, id_album, id_album_tipo, id_categoria, id_proveedor)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [precio, stock, id_album, id_album_tipo, id_categoria, id_proveedor]
    )

    const [[nuevo]] = await pool.execute(SQL_PRODUCTO + `WHERE p.id = ?`, [result.insertId])
    return reply.code(201).send(nuevo)
  })


  // ── PATCH /api/productos/:id ───────────────────────────────────────────────
  // Actualiza precio y/o stock de un producto.
  fastify.patch('/api/productos/:id', {
    preHandler: requireRol('admin', 'vendedor'),
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'integer', minimum: 1 } }
      },
      body: {
        type: 'object',
        properties: {
          precio:       { type: 'number',  minimum: 0.01 },
          stock:        { type: 'integer', minimum: 0    },
          id_categoria: { type: 'integer', minimum: 1    },
          id_proveedor: { type: 'integer', minimum: 1    }
        },
        additionalProperties: false
      }
    }
  }, async (req, reply) => {
    const { id } = req.params
    const [[existe]] = await pool.execute(
      'SELECT EXISTS(SELECT 1 FROM Producto WHERE id = ?) AS ok', [id]
    )
    if (!existe.ok) return reply.code(404).send({ error: 'Producto no encontrado' })

    const sets   = []
    const params = []
    if (req.body.precio       !== undefined) { sets.push('precio = ?');       params.push(req.body.precio) }
    if (req.body.stock        !== undefined) { sets.push('stock = ?');        params.push(req.body.stock) }
    if (req.body.id_categoria !== undefined) { sets.push('id_categoria = ?'); params.push(req.body.id_categoria) }
    if (req.body.id_proveedor !== undefined) { sets.push('id_proveedor = ?'); params.push(req.body.id_proveedor) }

    if (!sets.length) return reply.code(400).send({ error: 'Ningún campo para actualizar' })

    params.push(id)
    await pool.execute(`UPDATE Producto SET ${sets.join(', ')} WHERE id = ?`, params)

    const [[updated]] = await pool.execute(SQL_PRODUCTO + `WHERE p.id = ?`, [id])
    return updated
  })


  // ── DELETE /api/productos/:id ──────────────────────────────────────────────
  // Solo admin. Falla si el producto tiene ventas registradas.
  fastify.delete('/api/productos/:id', {
    preHandler: requireRol('admin'),
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'integer', minimum: 1 } }
      }
    }
  }, async (req, reply) => {
    const { id } = req.params

    const [[existe]] = await pool.execute(
      'SELECT EXISTS(SELECT 1 FROM Producto WHERE id = ?) AS ok', [id]
    )
    if (!existe.ok) return reply.code(404).send({ error: 'Producto no encontrado' })

    const [[tieneVentas]] = await pool.execute(
      'SELECT EXISTS(SELECT 1 FROM DetalleVenta WHERE id_producto = ?) AS tiene', [id]
    )
    if (tieneVentas.tiene) {
      return reply.code(409).send({
        error: 'No se puede eliminar: el producto tiene ventas registradas'
      })
    }

    await pool.execute('DELETE FROM Producto WHERE id = ?', [id])
    return reply.code(204).send()
  })

}

module.exports = productosRoutes
