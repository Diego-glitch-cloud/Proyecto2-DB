'use strict'

require('dotenv').config()

const Fastify = require('fastify')
const cors = require('@fastify/cors')

const fastify = Fastify({ logger: true })

fastify.register(cors, { origin: true })

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