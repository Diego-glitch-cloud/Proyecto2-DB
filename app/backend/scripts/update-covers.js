#!/usr/bin/env node
'use strict'

// Actualiza url_portada de todos los álbumes consultando la iTunes Search API.
// Uso: docker compose exec backend node scripts/update-covers.js

const mysql = require('mysql2/promise')

async function main() {
  const pool = await mysql.createPool({
    host:     process.env.DB_HOST     || 'db',
    port:     parseInt(process.env.DB_PORT || '3306'),
    database: process.env.DB_NAME     || 'tienda_db',
    user:     process.env.DB_USER     || 'proy2',
    password: process.env.DB_PASSWORD || 'secret',
  })

  const [albums] = await pool.query(`
    SELECT a.id, a.titulo, ar.nombre AS artista
    FROM   Album a
    JOIN   Artista ar ON ar.id = a.id_artista
    ORDER  BY a.id
  `)

  console.log(`\n🎵 Actualizando portadas de ${albums.length} álbumes...\n`)

  let ok = 0, fail = 0

  for (const album of albums) {
    try {
      const q   = encodeURIComponent(`${album.artista} ${album.titulo}`)
      const url = `https://itunes.apple.com/search?term=${q}&media=music&entity=album&limit=5&country=us`

      const resp = await fetch(url)
      const data = await resp.json()

      if (!data.results?.length) {
        console.log(`  ✗ Sin resultado: ${album.artista} — ${album.titulo}`)
        fail++
        continue
      }

      // Intentar coincidir por título exacto primero, si no el primer resultado
      const titulo_lower = album.titulo.toLowerCase()
      const match = data.results.find(r =>
        r.collectionName?.toLowerCase() === titulo_lower
      ) || data.results.find(r =>
        r.collectionName?.toLowerCase().includes(titulo_lower.split(' ')[0])
      ) || data.results[0]

      const artwork = match.artworkUrl100?.replace('100x100bb', '500x500bb')
      if (!artwork) { fail++; continue }

      await pool.query('UPDATE Album SET url_portada = ? WHERE id = ?', [artwork, album.id])
      console.log(`  ✓ ${album.artista} — ${album.titulo}`)
      ok++

    } catch (e) {
      console.error(`  ✗ Error en "${album.titulo}": ${e.message}`)
      fail++
    }

    // Rate limiting: iTunes permite ~20 req/min
    await new Promise(r => setTimeout(r, 350))
  }

  await pool.end()
  console.log(`\n✅ Completado: ${ok} actualizados, ${fail} sin resultado\n`)
}

main().catch(err => { console.error(err); process.exit(1) })
