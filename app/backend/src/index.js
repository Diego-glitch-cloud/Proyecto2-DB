'use strict'

require('dotenv').config()

const Fastify = require('fastify')
const cors    = require('@fastify/cors')
const jwt     = require('@fastify/jwt')

const authRoutes      = require('./routes/auth')
const catalogosRoutes = require('./routes/catalogos')
const albumsRoutes    = require('./routes/albums')
const productosRoutes = require('./routes/productos')
const ventasRoutes    = require('./routes/ventas')
const statsRoutes     = require('./routes/stats')
const clientesRoutes  = require('./routes/clientes')
const pool = require('./db')

const fastify = Fastify({ logger: true })

fastify.register(cors, { origin: true })
fastify.register(jwt,  { secret: process.env.JWT_SECRET })

fastify.register(authRoutes)
fastify.register(catalogosRoutes)
fastify.register(albumsRoutes)
fastify.register(productosRoutes)
fastify.register(ventasRoutes)
fastify.register(statsRoutes)
fastify.register(clientesRoutes)

// ── Error handler global ───────────────────────────────────────────────────
fastify.setErrorHandler((error, request, reply) => {
  const statusCode = error.statusCode ?? 500
  fastify.log.error({ err: error, method: request.method, url: request.url }, 'Request error')
  if (statusCode >= 500) return reply.code(statusCode).send({ error: 'Error interno del servidor' })
  return reply.code(statusCode).send({ error: error.message })
})

fastify.get('/api/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }))

fastify.get('/api/health-db', async (request, reply) => {
  try {
    const connection = await pool.getConnection()
    const [[row]] = await connection.execute('SELECT 1 AS connected')
    connection.release()
    return { status: 'ok', db_connected: row.connected === 1 }
  } catch (err) {
    fastify.log.error(err)
    return reply.code(503).send({ status: 'error', message: 'No se pudo conectar a la base de datos' })
  }
})

const PORT = parseInt(process.env.PORT ?? '3000', 10)

fastify.listen({ port: PORT, host: '0.0.0.0' }, (err) => {
  if (err) { fastify.log.error(err); process.exit(1) }
})
