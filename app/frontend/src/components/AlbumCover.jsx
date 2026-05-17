import React from 'react';
import './AlbumCover.css';

export function AlbumCover({ album = null, size = 140 }) {
  const url = album?.url_portada || null;
  const alt = album ? `${album.artista} — ${album.titulo}` : '';
  
  let label = '?';
  if (album) {
    label = `${album.artista?.slice(0,3).toUpperCase()} / ${album.anio || ''}`;
  }

  return (
    <div className="cover" style={{ width: size, height: size }}>
      {url ? (
        <img src={url} alt={alt} className="cover-img" />
      ) : (
        <div className="cover-fallback">
          <span className="cover-label">{label}</span>
        </div>
      )}
    </div>
  );
}
