'use strict'

const pool = require('../db')
const requireRol = require('../hooks/authorize')

// Query base reutilizable: JOIN de 6 tablas.
// Se usa tanto en el listado como para devolver el producto recién creado.
//
// Las 6 tablas:
//   Producto → Album (título, año, portada)
//   Album    → Artista (nombre del artista)
//   Producto → Album_Tipo (formato: Vinilo, CD…)
//   Producto → Categoria (condición comercial)
//   Producto → Proveedor (distribuidor)
//
// CONCAT construye el nombre del producto desde sus partes
// evitando almacenar un campo derivado
const SQL_PRODUCTO = `
  SELECT
    p.id,
    p.precio,
    p.stock,
    alb.id          AS id_album,
    alb.titulo      AS titulo_album,
    alb.anio        AS anio_album,
    alb.url_portada,
    art.id          AS id_artista,
    art.nombre      AS artista,
    at.id           AS id_album_tipo,
    at.detalle      AS tipo_formato,
    cat.id          AS id_categoria,
    cat.detalle     AS categoria,
    prov.id         AS id_proveedor,
    prov.nombre     AS proveedor,
    CONCAT(art.nombre, ' - ', alb.titulo, ' (', at.detalle, ')') AS nombre_producto
  FROM      Producto  p
  JOIN      Album     alb  ON alb.id  = p.id_album
  JOIN      Artista   art  ON art.id  = alb.id_artista
  JOIN      Album_Tipo at  ON at.id   = p.id_album_tipo
  JOIN      Categoria  cat ON cat.id  = p.id_categoria
  JOIN      Proveedor  prov ON prov.id = p.id_proveedor
`

async function productosRoutes(fastify) {

  // ── GET /api/productos ─────────────────────────────────────────────────────
  // Catálogo completo. Público: cualquier visitante puede ver el inventario.
  fastify.get('/api/productos', async (request, reply) => {
    const [rows] = await pool.execute(
      SQL_PRODUCTO + `ORDER BY art.nombre ASC, alb.titulo ASC, at.detalle ASC`
    )
    return rows
  })


  // ── POST /api/productos ────────────────────────────────────────────────────
  // Crear un nuevo producto. Solo admin o vendedor.
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
  }, async (request, reply) => {
    const { precio, stock, id_album, id_album_tipo, id_categoria, id_proveedor } = request.body

    // ── Validación de FKs con EXISTS ──────────────────────────────────────
    const [[fks]] = await pool.execute(`
      SELECT
        EXISTS(SELECT 1 FROM Album      WHERE id = ?) AS album_ok,
        EXISTS(SELECT 1 FROM Album_Tipo WHERE id = ?) AS tipo_ok,
        EXISTS(SELECT 1 FROM Categoria  WHERE id = ?) AS cat_ok,
        EXISTS(SELECT 1 FROM Proveedor  WHERE id = ?) AS prov_ok
    `, [id_album, id_album_tipo, id_categoria, id_proveedor])

    if (!fks.album_ok)
      return reply.code(422).send({ error: `No existe ningún álbum con id ${id_album}` })
    if (!fks.tipo_ok)
      return reply.code(422).send({ error: `No existe ningún tipo de álbum con id ${id_album_tipo}` })
    if (!fks.cat_ok)
      return reply.code(422).send({ error: `No existe ninguna categoría con id ${id_categoria}` })
    if (!fks.prov_ok)
      return reply.code(422).send({ error: `No existe ningún proveedor con id ${id_proveedor}` })

    // ── Verificar unicidad del par (id_album, id_album_tipo) ──────────────
    const [[dup]] = await pool.execute(`
      SELECT EXISTS(
        SELECT 1 FROM Producto WHERE id_album = ? AND id_album_tipo = ?
      ) AS existe
    `, [id_album, id_album_tipo])

    if (dup.existe) {
      return reply.code(409).send({ error: 'Ya existe un producto con ese álbum y formato' })
    }

    // ── INSERT ────────────────────────────────────────────────────────────
    const [result] = await pool.execute(
      `INSERT INTO Producto (precio, stock, id_album, id_album_tipo, id_categoria, id_proveedor)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [precio, stock, id_album, id_album_tipo, id_categoria, id_proveedor]
    )

    // Devolver el producto completo recién creado
    const [[nuevo]] = await pool.execute(
      SQL_PRODUCTO + `WHERE p.id = ?`,
      [result.insertId]
    )

    return reply.code(201).send(nuevo)
  })

}

module.exports = productosRoutes
