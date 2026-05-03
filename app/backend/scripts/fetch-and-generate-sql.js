
const albums = [
  { id: 1,  titulo: 'Master of Puppets',         artista: 'Metallica' },
  { id: 2,  titulo: '...And Justice for All',    artista: 'Metallica' },
  { id: 3,  titulo: 'The Dark Side of the Moon', artista: 'Pink Floyd' },
  { id: 4,  titulo: 'Wish You Were Here',        artista: 'Pink Floyd' },
  { id: 5,  titulo: 'Animals',                   artista: 'Pink Floyd' },
  { id: 6,  titulo: 'Is This It',                artista: 'The Strokes' },
  { id: 7,  titulo: 'Room on Fire',              artista: 'The Strokes' },
  { id: 8,  titulo: 'Dirt',                      artista: 'Alice in Chains' },
  { id: 9,  titulo: 'Siamese Dream',             artista: 'The Smashing Pumpkins' },
  { id: 10, titulo: 'Souvlaki',                  artista: 'Slowdive' },
  { id: 11, titulo: 'Loveless',                  artista: 'My Bloody Valentine' },
  { id: 12, titulo: 'Isn\'t Anything',           artista: 'My Bloody Valentine' },
  { id: 13, titulo: 'Moving Pictures',           artista: 'Rush' },
  { id: 14, titulo: '2112',                      artista: 'Rush' },
  { id: 15, titulo: 'The Queen Is Dead',         artista: 'The Smiths' },
  { id: 16, titulo: 'White Pony',                artista: 'Deftones' },
  { id: 17, titulo: 'OK Computer',               artista: 'Radiohead' },
  { id: 18, titulo: 'Kid A',                     artista: 'Radiohead' },
  { id: 19, titulo: 'The Bends',                 artista: 'Radiohead' },
  { id: 20, titulo: 'Paranoid',                  artista: 'Black Sabbath' },
  { id: 21, titulo: 'Lateralus',                 artista: 'Tool' },
  { id: 22, titulo: 'Ænima',                     artista: 'Tool' },
  { id: 23, titulo: 'Superunknown',              artista: 'Soundgarden' },
  { id: 24, titulo: 'Nevermind',                 artista: 'Nirvana' },
  { id: 25, titulo: 'In Utero',                  artista: 'Nirvana' },
  { id: 26, titulo: 'Disintegration',            artista: 'The Cure' },
  { id: 27, titulo: 'Heaven or Las Vegas',       artista: 'Cocteau Twins' },
  { id: 28, titulo: 'Sunbather',                 artista: 'Deafheaven' },
  { id: 29, titulo: 'American Football LP1',     artista: 'American Football' },
  { id: 30, titulo: 'Ants from Up There',        artista: 'Black Country, New Road' }
];

const artistCache = new Map();

function normalize(str) {
  return (str || '')
    .toLowerCase()
    .replace(/æ/g, 'ae').replace(/œ/g, 'oe').replace(/ß/g, 'ss')
    .replace(/[''ʼ`‘’“”]/g, '') // All types of quotes
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
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

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    const resp = await fetch(url);
    if (resp.status === 403 || resp.status === 429) {
      await new Promise(r => setTimeout(r, 2000 * (i + 1)));
      continue;
    }
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return await resp.json();
  }
  throw new Error('Rate limit exceeded');
}

async function getArtistId(artistName, store = 'us') {
  const cacheKey = `${artistName}:${store}`;
  if (artistCache.has(cacheKey)) return artistCache.get(cacheKey);
  
  const q = encodeURIComponent(artistName);
  const url = `https://itunes.apple.com/search?term=${q}&entity=musicArtist&limit=1&country=${store}`;
  const data = await fetchWithRetry(url);
  
  if (data.results?.length > 0) {
    const id = data.results[0].artistId;
    artistCache.set(cacheKey, id);
    return id;
  }
  return null;
}

async function getAlbumCover(album) {
  const stores = ['us', 'gb', 'ca'];
  
  for (const store of stores) {
    try {
      const artistId = await getArtistId(album.artista, store);
      if (artistId) {
        const url = `https://itunes.apple.com/lookup?id=${artistId}&entity=album&limit=200&country=${store}`;
        const data = await fetchWithRetry(url);
        
        let best = { r: null, total: 0 };
        for (const r of data.results) {
          if (r.collectionType !== 'Album') continue;
          const tScore = score(album.titulo, r.collectionName);
          if (tScore > best.total) best = { r, total: tScore };
        }
        
        if (best.r && best.total >= 0.5) {
          return {
            url: best.r.artworkUrl100.replace('100x100bb', '600x600bb'),
            score: best.total,
            method: `lookup (${store})`
          };
        }
      }
    } catch (e) {
      console.error(`Error for ${album.artista} in store ${store}: ${e.message}`);
    }
  }
  
  // Fallback: Combined search
  const q = encodeURIComponent(`${album.artista} ${album.titulo}`);
  const url = `https://itunes.apple.com/search?term=${q}&media=music&entity=album&limit=15&country=us`;
  const data = await fetchWithRetry(url);
  
  let best = { r: null, total: 0 };
  for (const r of data.results || []) {
    const aScore = score(album.artista, r.artistName);
    if (aScore < 0.7) continue; 
    
    const tScore = score(album.titulo, r.collectionName);
    const total = tScore * 0.8 + aScore * 0.2;
    if (total > best.total) best = { r, total };
  }
  
  if (best.r && best.total >= 0.5) {
    return {
      url: best.r.artworkUrl100.replace('100x100bb', '600x600bb'),
      score: best.total,
      method: 'search (us)'
    };
  }
  
  return null;
}

async function run() {
  const updates = [];
  const skips = [];

  for (const album of albums) {
    const cover = await getAlbumCover(album);
    if (cover) {
      updates.push(`UPDATE Album SET url_portada = '${cover.url}' WHERE id = ${album.id};  -- ${album.artista} - ${album.titulo} (score: ${cover.score.toFixed(2)}, via ${cover.method})`);
    } else {
      skips.push(`-- id ${album.id} (${album.artista} - ${album.titulo}): no match found`);
    }
    await new Promise(r => setTimeout(r, 600)); // Be gentle with the API
  }

  console.log('-- ============================================================');
  console.log('-- 03_covers.sql - URLs de portadas oficiales desde iTunes');
  console.log('-- Generado con estrategia Multi-Store Lookup para precisión global');
  console.log('-- ============================================================');
  console.log('\nUSE tienda_db;\n');
  console.log(updates.join('\n'));
  console.log('\n-- SIN COINCIDENCIA SEGURA:');
  console.log(skips.join('\n'));
}

run();
