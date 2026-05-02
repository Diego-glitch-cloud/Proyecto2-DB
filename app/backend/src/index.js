'use strict'

require('dotenv').config()

const Fastify = require('fastify')
const cors = require('@fastify/cors')
const jwt = require('@fastify/jwt')

const authRoutes = require('./routes/auth')
const pool = require('./db')

const fastify = Fastify({ logger: true })

// CORS permite que el frontend hable con esta API.
fastify.register(cors, { origin: true })

// El plugin JWT expone fastify.jwt.sign() y fastify.jwt.verify().
fastify.register(jwt, { secret: process.env.JWT_SECRET })

// Rutas de autenticación
fastify.register(authRoutes)

// Verifica que el proceso del servidor responde
fastify.get('/api/health', async () => ({
  status: 'ok',
  timestamp: new Date().toISOString()
}))

// Verifica conectividad real con la DB en runtime
fastify.get('/api/health-db', async (request, reply) => {
  try {
    const [[row]] = await pool.execute('SELECT 1 AS connected')
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