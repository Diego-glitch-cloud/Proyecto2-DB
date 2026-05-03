#!/usr/bin/env node
'use strict'

// Actualiza url_portada consultando iTunes con estrategia de Lookup por Artist ID.
// Mucho más preciso para evitar tributos, remixes o artistas con nombres similares.
// Uso: docker compose exec backend node scripts/update-covers.js

const mysql = require('mysql2/promise')

const artistCache = new Map();

function normalize(str) {
  return (str || '')
    .toLowerCase()
    .replace(/æ/g, 'ae').replace(/œ/g, 'oe').replace(/ß/g, 'ss')
    .replace(/[''ʼ`]/g, '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function score(search, candidate) {
  const s = normalize(search);
  const c = normalize(candidate);
  if (!s || !c) return 0;
  if (s === c) return 1.0;
  if (c.includes(s) || s.includes(c)) return 0.9;
  
  const sWords = s.split(' ').filter(w => w.length > 1);
  if (sWords.length === 0) return 0;
  
  let hits = 0;
  for (const sw of sWords) {
    if (c.includes(sw)) hits++;
  }
  
  return hits / sWords.length;
}

async function getArtistId(artistName, store = 'us') {
  const cacheKey = `${artistName}:${store}`;
  if (artistCache.has(cacheKey)) return artistCache.get(cacheKey);
  
  const q = encodeURIComponent(artistName);
  const url = `https://itunes.apple.com/search?term=${q}&entity=musicArtist&limit=1&country=${store}`;
  const resp = await fetch(url);
  if (!resp.ok) return null;
  const data = await resp.json();
  
  if (data.results?.length > 0) {
    const id = data.results[0].artistId;
    artistCache.set(cacheKey, id);
    return id;
  }
  return null;
}

async function findCover(artista, titulo) {
  const stores = ['us', 'gb', 'ca'];
  
  for (const store of stores) {
    try {
      const artistId = await getArtistId(artista, store);
      if (!artistId) continue;

      const url = `https://itunes.apple.com/lookup?id=${artistId}&entity=album&limit=200&country=${store}`;
      const resp = await fetch(url);
      if (!resp.ok) continue;
      const data = await resp.json();
      
      let best = { r: null, total: 0 };
      for (const r of data.results) {
        if (r.collectionType !== 'Album') continue;
        const tScore = score(titulo, r.collectionName);
        if (tScore > best.total) best = { r, total: tScore };
      }
      
      if (best.r && best.total >= 0.5) {
        return {
          url: best.r.artworkUrl100.replace('100x100bb', '600x600bb'),
          score: best.total,
          store
        };
      }
    } catch (e) {
      // Silencioso por cada tienda
    }
  }
  return null;
}

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

  console.log(`\n🎵 Actualizando portadas de ${albums.length} álbumes (Estrategia Precision Lookup)...\n`)

  let ok = 0, skip = 0

  for (const album of albums) {
    try {
      const cover = await findCover(album.artista, album.titulo);

      if (!cover) {
        console.log(`  ✗ Sin coincidencia:        ${album.artista} — ${album.titulo}`)
        skip++
        continue
      }

      await pool.query('UPDATE Album SET url_portada = ? WHERE id = ?', [cover.url, album.id])
      console.log(`  ✓ (${cover.score.toFixed(2)} [${cover.store}]) ${album.artista} — ${album.titulo}`)
      ok++

    } catch (e) {
      console.error(`  ✗ Error: ${album.artista} — ${album.titulo}: ${e.message}`)
      skip++
    }

    await new Promise(r => setTimeout(r, 600)) // rate limiting iTunes
  }

  await pool.end()
  console.log(`\n✅ ${ok} actualizados, ${skip} sin coincidencia segura.\n`)
}

main().catch(err => { console.error(err); process.exit(1) })
