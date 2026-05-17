import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, ShoppingBag } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useCart } from '../CartContext';
import { useWishlist } from '../WishlistContext';
import api from '../api';
import { PosterStrip } from '../components/PosterStrip';
import { BLogo } from '../components/BLogo';
import { ThemeToggle } from '../components/ThemeToggle';
import { AlbumCover } from '../components/AlbumCover';
import { AlbumCard } from '../components/AlbumCard';
import { FormatChip } from '../components/FormatChip';
import { FeaturedCarousel } from '../components/FeaturedCarousel';
import './CatalogView.css';

export default function CatalogView() {
  const navigate = useNavigate();
  const auth = useAuth();
  const cart = useCart();
  const wishlist = useWishlist();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchRaw, setSearchRaw] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFormat, setActiveFormat] = useState('');
  const [activeGenre, setActiveGenre] = useState('');
  const [showGenres, setShowGenres] = useState(false);
  const [selected, setSelected] = useState(null);
  const [detailQty, setDetailQty] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(searchRaw), 300);
    return () => clearTimeout(t);
  }, [searchRaw]);

  useEffect(() => {
    api.get('/productos')
      .then(res => setProducts(res.data))
      .finally(() => setLoading(false));
  }, []);

  const initials = useMemo(() => {
    const n = auth.user?.nombre || '';
    return n.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }, [auth.user]);

  const dateStr = useMemo(() => 
    new Date().toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()
  , []);

  const allGenres = useMemo(() => {
    const set = new Set();
    products.forEach(p => (p.generos || '').split(',').forEach(g => { if (g.trim()) set.add(g.trim()) }));
    return Array.from(set).sort();
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter(p => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || p.titulo_album?.toLowerCase().includes(q) || p.artista?.toLowerCase().includes(q) || (p.generos || '').toLowerCase().includes(q);
      const matchFormat = !activeFormat || p.tipo_formato === activeFormat;
      const matchGenre = !activeGenre || (p.generos || '').includes(activeGenre);
      return matchSearch && matchFormat && matchGenre;
    });
  }, [products, searchQuery, activeFormat, activeGenre]);

  const setFormat = (f) => { setActiveFormat(activeFormat === f ? '' : f); setActiveGenre(''); setShowGenres(false); };
  const setGenre = (g) => { setActiveGenre(activeGenre === g ? '' : g); setActiveFormat(''); };
  const clearFilters = () => { setActiveFormat(''); setActiveGenre(''); setSearchRaw(''); setShowGenres(false); };
  const selectProduct = (p) => { setSelected(p); setDetailQty(1); };

  const addToCart = (producto, qty = 1) => {
    if (producto.stock === 0) { alert('Sin stock'); return; }
    for (let i = 0; i < qty; i++) cart.add(producto);
    alert(`${qty} unidad(es) agregada(s)`);
  };

  return (
    <div className="catalog-root">
      <PosterStrip left="MEMBER LOUNGE ✦ CATÁLOGO COMPLETO ✦ NUEVA PRENSA ESTA SEMANA" right={dateStr} />

      {auth.isStaff && (
        <div className="admin-back-bar">
          <span className="eyebrow" style={{ color: 'rgba(242,233,218,.6)' }}>VISTA DE CLIENTE</span>
          <Link to="/admin" className="eyebrow" style={{ color: '#F2E9DA', textDecoration: 'none' }}>← VOLVER AL PANEL DE ADMIN</Link>
        </div>
      )}

      <nav className="nav hairline-b">
        <BLogo size={20} />
        <div className="nav-links">
          <button className={`nav-link ${!activeFormat && !activeGenre ? 'active' : ''}`} onClick={clearFilters}>Catálogo</button>
          <button className={`nav-link ${activeFormat === 'Vinilo' ? 'active' : ''}`} onClick={() => setFormat('Vinilo')}>Vinilos</button>
          <button className={`nav-link ${activeFormat === 'CD' ? 'active' : ''}`} onClick={() => setFormat('CD')}>CDs</button>
          <button className={`nav-link ${activeFormat === 'Cassette' ? 'active' : ''}`} onClick={() => setFormat('Cassette')}>Cassettes</button>
          <button className={`nav-link ${showGenres ? 'active' : ''}`} onClick={() => setShowGenres(!showGenres)}>Géneros</button>
          <Link className="nav-link" to="/perfil">Mi cuenta</Link>
        </div>
        <div className="nav-right">
          <div className="search-box">
            <Search size={13} color="var(--mute)" />
            <input value={searchRaw} onChange={e => setSearchRaw(e.target.value)} placeholder="Buscar álbum, artista…" className="search-input" />
          </div>
          <ThemeToggle />
          <Link to="/carrito" className="bag-btn">
            <ShoppingBag size={18} />
            {cart.count > 0 && <span className="bag-badge eyebrow">{cart.count}</span>}
          </Link>
          <div className="avatar" onClick={() => navigate('/perfil')}>{initials}</div>
        </div>
      </nav>

      {showGenres && (
        <div className="genre-bar hairline-b">
          {allGenres.map(g => (
            <button key={g} className={`genre-pill eyebrow ${activeGenre === g ? 'active' : ''}`} onClick={() => setGenre(g)}>{g}</button>
          ))}
        </div>
      )}

      <div className="main">
        <FeaturedCarousel onSelect={selectProduct} onAdd={p => addToCart(p)} />

        {filtered.length > 0 ? (
          <section className="section">
            <div className="section-head">
              <div>
                <h3 className="section-title f-display">
                  {activeGenre || activeFormat || 'Todo el'}
                  <em className="accent">{activeGenre || activeFormat ? '.' : 'catálogo.'}</em>
                </h3>
              </div>
              <span className="eyebrow">{filtered.length} TÍTULOS</span>
            </div>
            <div className="grid-catalog">
              {filtered.map(p => (
                <div key={p.id} className="card-wrap" onClick={() => selectProduct(p)}>
                  <AlbumCard producto={p} onAdd={(p) => { addToCart(p); }} />
                </div>
              ))}
            </div>
          </section>
        ) : (!loading && (
          <p className="eyebrow" style={{ padding: '40px', color: 'var(--mute)', textAlign: 'center' }}>
            SIN RESULTADOS PARA "{searchQuery}"
          </p>
        ))}
      </div>

      {selected && (
        <div className="detail-overlay" onClick={(e) => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div className="detail-panel hairline">
            <button className="detail-close eyebrow" onClick={() => setSelected(null)}>✕ CERRAR</button>
            <div className="detail-cover">
              <AlbumCover album={{titulo: selected.titulo_album, artista: selected.artista, anio: selected.anio_album, url_portada: selected.url_portada}} size={240} />
            </div>
            <div className="detail-info">
              <p className="eyebrow velvet">{selected.generos?.split(',')[0]?.trim()}</p>
              <h2 className="f-display" style={{ fontSize: '32px', lineHeight: 1.1, marginTop: '6px' }}>{selected.titulo_album}</h2>
              <p className="f-serif" style={{ fontSize: '20px', color: 'var(--mute)', marginTop: '4px' }}>{selected.artista}, {selected.anio_album}</p>
              
              <div className="detail-meta hairline-t" style={{ marginTop: '16px', paddingTop: '14px' }}>
                <div className="meta-row"><span className="eyebrow">FORMATO</span><FormatChip formato={selected.tipo_formato} /></div>
                <div className="meta-row"><span className="eyebrow">STOCK</span><span className="eyebrow" style={{ color: selected.stock < 5 ? 'var(--velvet)' : 'var(--brass)' }}>{selected.stock} UNIDADES</span></div>
              </div>
              
              <p className="f-display" style={{ fontSize: '42px', color: 'var(--brass)', marginTop: '14px' }}>
                Q {Number(selected.precio).toLocaleString('es-GT')}
              </p>

              {selected.stock > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', marginTop: '18px', border: '1px solid var(--line)', width: 'fit-content' }}>
                  <button className="detail-qty-btn" onClick={() => setDetailQty(Math.max(1, detailQty - 1))}>−</button>
                  <span className="eyebrow" style={{ minWidth: '44px', textAlign: 'center', color: 'var(--ink)' }}>{detailQty}</span>
                  <button className="detail-qty-btn" onClick={() => setDetailQty(Math.min(selected.stock, detailQty + 1))}>+</button>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                <button className="btn btn-primary" style={{ flex: 1, height: '56px' }} disabled={selected.stock === 0} onClick={() => { addToCart(selected, detailQty); setSelected(null); }}>
                  {selected.stock === 0 ? 'SIN STOCK' : `+ AGREGAR (${detailQty})`}
                </button>
                <button className="btn btn-outline" style={{ height: '56px', width: '56px', padding: 0, borderColor: wishlist.has(selected.id) ? 'var(--velvet)' : '', color: wishlist.has(selected.id) ? 'var(--velvet)' : '' }} onClick={() => wishlist.toggle(selected)}>
                  {wishlist.has(selected.id) ? '♥' : '♡'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
