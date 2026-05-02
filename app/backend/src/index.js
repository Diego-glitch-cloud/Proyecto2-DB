'use strict'

require('dotenv').config()

const Fastify = require('fastify')
const cors = require('@fastify/cors')
const jwt = require('@fastify/jwt')

const authRoutes = require('./routes/auth')

const fastify = Fastify({ logger: true })

// CORS permite que el frontend hable con esta API.
fastify.register(cors, { origin: true })

// El plugin JWT expone fastify.jwt.sign() y fastify.jwt.verify().
fastify.register(jwt, { secret: process.env.JWT_SECRET })

// Rutas de autenticación
fastify.register(authRoutes)

fastify.get('/api/health', async () => ({
  status: 'ok',
  timestamp: new Date().toISOString()
}))

const PORT = parseInt(process.env.PORT ?? '3000', 10)

fastify.listen({ port: PORT, host: '0.0.0.0' }, (err) => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
})