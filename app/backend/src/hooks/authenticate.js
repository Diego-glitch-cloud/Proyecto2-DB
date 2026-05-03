'use strict'

// preHandler reutilizable para rutas protegidas.

async function authenticate(request, reply) {
  try {
    await request.jwtVerify()
  } catch (err) {
    return reply.code(401).send({ error: 'Token inválido o expirado' })
  }
}

module.exports = authenticate
