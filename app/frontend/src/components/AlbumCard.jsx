import React from 'react';
import { AlbumCover } from './AlbumCover';
import { FormatChip } from './FormatChip';
import './AlbumCard.css';

export function AlbumCard({ producto, compact = false, isNew = false, onAdd }) {
  const albumData = {
    titulo:      producto.titulo_album || producto.titulo,
    artista:     producto.artista,
    anio:        producto.anio_album   || producto.anio,
    url_portada: producto.url_portada
  };

  return (
    <div className={`card ${compact ? 'compact' : ''}`}>
      <div className="card-cover" onClick={() => onAdd && onAdd(producto)}>
        <AlbumCover album={albumData} size={compact ? 130 : 220} />
        {isNew && <span className="badge-new eyebrow">NUEVO</span>}
        <button className="btn-plus" title="Agregar a la bolsa">+</button>
      </div>
      <div className="card-body">
        <p className={`card-title ${compact ? 'ct-sm' : 'ct-md'}`}>
          {producto.titulo_album || producto.titulo}
        </p>
        <p className="card-meta eyebrow">{producto.artista} · {producto.anio_album || producto.anio}</p>
        <div className="card-footer">
          <FormatChip formato={producto.tipo_formato || producto.formato || 'Vinilo'} />
          <span className={`card-price ${compact ? 'cp-sm' : 'cp-md'}`}>
            Q {Number(producto.precio).toLocaleString('es-GT')}
          </span>
        </div>
      </div>
    </div>
  );
}
