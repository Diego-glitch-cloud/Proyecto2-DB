'use strict'

// Fábrica de preHandlers para control de acceso por rol.
// Si el token es inválido 401
// Si el rol no está permitido 403
function requireRol(...rolesPermitidos) {
  return async function (request, reply) {
    try {
      await request.jwtVerify()
    } catch {
      return reply.code(401).send({ error: 'Token inválido o expirado' })
    }

    if (!rolesPermitidos.includes(request.user.rol)) {
      return reply.code(403).send({ error: 'No tienes permisos para esta acción' })
    }
  }
}

module.exports = requireRol
