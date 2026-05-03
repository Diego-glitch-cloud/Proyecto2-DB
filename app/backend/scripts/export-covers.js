#!/usr/bin/env node
'use strict'

// Lee las url_portada actuales de la DB y las imprime como SQL UPDATE.
// Redirige la salida a 03_covers.sql:
//   docker compose exec backend node scripts/export-covers.js > app/database/init/03_covers.sql
//
// O desde fuera del contenedor (recomendado):
//   docker compose exec backend node scripts/export-covers.js

const mysql = require('mysql2/promise')

async function main() {
  const pool = await mysql.createPool({
    host:     process.env.DB_HOST     || 'db',
    port:     parseInt(process.env.DB_PORT || '3306'),
    database: process.env.DB_NAME     || 'tienda_db',
    user:     process.env.DB_USER     || 'proy2',
    password: process.env.DB_PASSWORD || 'secret',
  })

  const [rows] = await pool.query(
    'SELECT id, titulo, url_portada FROM Album ORDER BY id'
  )

  await pool.end()

  // Imprimir a stdout para que el llamador redirija donde quiera
  const lines = rows.map(r =>
    r.url_portada
      ? `UPDATE Album SET url_portada = '${r.url_portada}' WHERE id = ${r.id};  -- ${r.titulo}`
      : `-- id ${r.id} (${r.titulo}): sin portada en iTunes`
  )

  console.log(lines.join('\n'))
}

main().catch(err => { console.error(err); process.exit(1) })
