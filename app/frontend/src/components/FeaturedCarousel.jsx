import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import { AlbumCover } from './AlbumCover';
import { FormatChip } from './FormatChip';
import './FeaturedCarousel.css';

export function FeaturedCarousel({ onSelect, onAdd }) {
  const [items, setItems] = useState([]);
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);

  const fetchItems = async () => {
    try {
      const { data } = await api.get('/productos/mas-vendidos', { params: { limit: 8 } });
      setItems(data);
    } catch { /* silencioso */ }
  };

  const next = () => setCurrent((c) => (items.length ? (c + 1) % items.length : 0));
  const prev = () => setCurrent((c) => (items.length ? (c - 1 + items.length) % items.length : 0));
  const goTo = (i) => setCurrent(i);

  const pause = () => clearInterval(timerRef.current);
  const resume = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(next, 4000);
  };

  useEffect(() => {
    fetchItems();
    resume();
    return () => clearInterval(timerRef.current);
  }, []);

  if (!items.length) return null;

  const currentItem = items[current] || {};
  const bgStyle = currentItem.url_portada
    ? { backgroundImage: `url(${currentItem.url_portada})` }
    : { background: 'var(--velvet)' };

  return (
    <section 
      className="carousel hairline"
      onMouseEnter={pause} 
      onMouseLeave={resume}
    >
      <div className="carousel-bg" style={bgStyle} />
      <div className="carousel-overlay" />

      <div className="carousel-cover-col">
        <div key={current} className="cover-wrap fade-in">
          <AlbumCover album={currentItem} size={260} />
        </div>
      </div>

      <div className="carousel-info-col">
        <p className="eyebrow carousel-label">
          ● MÁS VENDIDOS · #{current + 1} DE {items.length}
        </p>
        <div key={current} className="info-inner fade-in-up">
          <p className="eyebrow" style={{ color: 'rgba(242,233,218,.6)', marginBottom: '6px' }}>
            {currentItem.generos?.split(',')[0]?.trim() || 'ESPECIAL'}
          </p>
          <h2 className="carousel-title f-display">{currentItem.titulo_album}</h2>
          <p className="f-serif carousel-artist">{currentItem.artista}, {currentItem.anio_album}</p>
          <div className="carousel-price-row">
            <span className="f-display carousel-price">Q {Number(currentItem.precio).toLocaleString('es-GT')}</span>
            <FormatChip formato={currentItem.tipo_formato || 'Vinilo'} size="lg" />
          </div>
          <p className="eyebrow" style={{ color: 'rgba(242,233,218,.5)' }}>
            {currentItem.total_vendido} UNIDADES VENDIDAS
          </p>
          <div className="carousel-actions">
            <button className="btn btn-primary" style={{ height: '48px' }} onClick={() => onSelect && onSelect(currentItem)}>
              VER DETALLES →
            </button>
            <button 
              className="btn btn-outline" 
              style={{ height: '48px' }}
              onClick={() => onAdd && onAdd(currentItem)}
              disabled={currentItem.stock === 0}
            >
              {currentItem.stock === 0 ? 'SIN STOCK' : '+ BOLSA'}
            </button>
          </div>
        </div>
      </div>

      <button className="carousel-nav carousel-prev" onClick={prev}>‹</button>
      <button className="carousel-nav carousel-next" onClick={next}>›</button>

      <div className="carousel-dots">
        {items.map((_, i) => (
          <button 
            key={i}
            className={`dot ${i === current ? 'active' : ''}`}
            onClick={() => goTo(i)} 
          />
        ))}
      </div>
    </section>
  );
}
