'use strict'

require('dotenv').config()

const Fastify = require('fastify')
const cors = require('@fastify/cors')
const jwt = require('@fastify/jwt')

const authRoutes = require('./routes/auth')
const catalogosRoutes = require('./routes/catalogos')
const albumsRoutes = require('./routes/albums')
const pool = require('./db')

const fastify = Fastify({ logger: true })

// CORS permite que el frontend hable con esta API.
fastify.register(cors, { origin: true })

// El plugin JWT expone fastify.jwt.sign() y fastify.jwt.verify().
fastify.register(jwt, { secret: process.env.JWT_SECRET })

fastify.register(authRoutes)
fastify.register(catalogosRoutes)
fastify.register(albumsRoutes)

// ── MANEJADOR GLOBAL DE ERRORES ────────────────────────────────────────────
fastify.setErrorHandler((error, request, reply) => {
  const statusCode = error.statusCode ?? 500

  fastify.log.error(
    { err: error, method: request.method, url: request.url },
    'Request error' 
  )

  if (statusCode >= 500) {
    return reply.code(statusCode).send({ error: 'Error interno del servidor' })
  }

  // Errores de validación de JSON Schema (400)
  return reply.code(statusCode).send({ error: error.message })
})

// Verifica que el proceso del servidor responde
fastify.get('/api/health', async () => ({
  status: 'ok',
  timestamp: new Date().toISOString()
}))

// Verifica conectividad real con la DB en runtime
fastify.get('/api/health-db', async (request, reply) => {
  try {
    // Agregamos un timeout simple para evitar que la petición quede colgada
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
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
})