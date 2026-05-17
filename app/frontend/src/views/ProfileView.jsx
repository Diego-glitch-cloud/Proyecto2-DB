import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useWishlist } from '../WishlistContext';
import { useCart } from '../CartContext';
import api from '../api';
import { PosterStrip } from '../components/PosterStrip';
import { BLogo } from '../components/BLogo';
import { AlbumCover } from '../components/AlbumCover';
import { FormatChip } from '../components/FormatChip';
import './ProfileView.css';

export default function ProfileView() {
  const navigate = useNavigate();
  const auth = useAuth();
  const wishlist = useWishlist();
  const cart = useCart();

  const [wishSelected, setWishSelected] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [compras, setCompras] = useState([]);
  const [loadingCompras, setLoadingCompras] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editNit, setEditNit] = useState('');
  const [editDireccion, setEditDireccion] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const formatDate = (iso) => new Date(iso).toLocaleDateString('es-GT', { day: '2-digit', month: 'long', year: 'numeric' });

  const addWishToCart = (item) => {
    cart.add(item);
    alert('Agregado a la bolsa');
    setWishSelected(null);
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaveError(''); setSaving(true);
    try {
      const { data } = await api.patch('/clientes/mi-perfil', { NIT: editNit || undefined, direccion: editDireccion || null });
      setPerfil(data);
      setEditMode(false);
    } catch (e) {
      setSaveError(e.response?.data?.error || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    api.get('/clientes/mi-perfil').then(({ data }) => {
      setPerfil(data); setEditNit(data.NIT || ''); setEditDireccion(data.direccion || '');
    }).catch(() => {});
    api.get('/ventas/mis-compras').then(({ data }) => {
      setCompras(data);
    }).finally(() => setLoadingCompras(false));
  }, []);

  return (
    <div className="profile-root">
      <PosterStrip left="MI CUENTA · PERFIL DE CLIENTE" right="MUSIC4U" />

      <nav className="p-nav hairline-b">
        <Link to="/" className="back eyebrow">← CATÁLOGO</Link>
        <BLogo size={20} />
        <button className="eyebrow" style={{ color: 'var(--velvet)', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => { auth.logout(); navigate('/login'); }}>CERRAR SESIÓN →</button>
      </nav>

      <div className="profile-grid">
        <div className="card hairline">
          <div className="card-head hairline-b">
            <p className="eyebrow brass">DATOS PERSONALES</p>
            <button className="eyebrow" style={{ color: 'var(--brass)', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setEditMode(!editMode)}>
              {editMode ? 'CANCELAR' : 'EDITAR →'}
            </button>
          </div>
          <div className="card-body">
            {perfil ? (
              <>
                <div className="data-row"><span className="eyebrow">NOMBRE</span><span className="f-display" style={{ fontSize: '18px' }}>{perfil.nombre}</span></div>
                <div className="data-row dashed-b"><span className="eyebrow">CORREO</span><span className="f-serif" style={{ fontSize: '16px' }}>{perfil.correo}</span></div>
                {!editMode ? (
                  <>
                    <div className="data-row"><span className="eyebrow">NIT</span><span className="f-display" style={{ fontSize: '18px' }}>{perfil.NIT || 'CF'}</span></div>
                    <div className="data-row"><span className="eyebrow">DIRECCIÓN</span><span className="f-serif" style={{ fontSize: '16px' }}>{perfil.direccion || 'Sin dirección'}</span></div>
                  </>
                ) : (
                  <form className="edit-form" onSubmit={saveProfile}>
                    <div className="field"><label>NIT de facturación</label><input value={editNit} onChange={e => setEditNit(e.target.value)} placeholder={perfil.NIT || 'CF'} /></div>
                    <div className="field"><label>Dirección de entrega</label><input value={editDireccion} onChange={e => setEditDireccion(e.target.value)} placeholder={perfil.direccion || 'Tu dirección'} /></div>
                    {saveError && <p className="eyebrow" style={{ color: 'var(--velvet)', fontSize: '9px' }}>{saveError}</p>}
                    <button className="btn btn-primary" style={{ height: '44px', width: '100%' }} disabled={saving}>{saving ? 'GUARDANDO…' : 'GUARDAR CAMBIOS →'}</button>
                  </form>
                )}
              </>
            ) : <p className="eyebrow" style={{ padding: '24px', color: 'var(--mute)' }}>CARGANDO…</p>}
          </div>
        </div>

        <div className="card hairline">
          <div className="card-head hairline-b">
            <p className="eyebrow brass">♡ WISHLIST</p><span className="eyebrow">{wishlist.items.length} ÍTEMS</span>
          </div>
          <div className="card-body">
            {!wishlist.items.length && <p className="eyebrow" style={{ color: 'var(--mute)', padding: '16px 0' }}>TU WISHLIST ESTÁ VACÍA</p>}
            {wishlist.items.map(item => (
              <div key={item.id} className="wish-row dashed-b" style={{ cursor: 'pointer' }} onClick={() => setWishSelected(item)}>
                <AlbumCover album={{ titulo: item.titulo_album, artista: item.artista, url_portada: item.url_portada }} size={48} />
                <div style={{ flex: 1 }}><p className="f-display" style={{ fontSize: '14px', lineHeight: 1.1 }}>{item.titulo_album}</p><p className="eyebrow" style={{ marginTop: '3px' }}>{item.artista}</p></div>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}><span className="f-display brass" style={{ fontSize: '16px' }}>Q {Number(item.precio).toLocaleString('es-GT')}</span><span className="eyebrow mute" style={{ fontSize: '9px' }}>VER DETALLES →</span></div>
              </div>
            ))}
          </div>
        </div>

        <div className="card hairline full-width">
          <div className="card-head hairline-b">
            <p className="eyebrow brass">MIS COMPRAS</p><span className="eyebrow">{compras.length} PEDIDOS</span>
          </div>
          <div className="card-body">
            {loadingCompras ? <p className="eyebrow" style={{ color: 'var(--mute)', padding: '16px 0' }}>CARGANDO…</p> :
             !compras.length ? <p className="eyebrow" style={{ color: 'var(--mute)', padding: '16px 0' }}>AÚN NO TIENES COMPRAS</p> :
             compras.map(compra => (
               <div key={compra.id_compra} className="compra-block dashed-b">
                 <div className="compra-head">
                   <div><p className="eyebrow velvet">PEDIDO #{String(compra.id_compra).padStart(4, '0')}</p><p className="eyebrow" style={{ color: 'var(--mute)', marginTop: '2px' }}>{formatDate(compra.fecha)}</p></div>
                   <p className="f-display brass" style={{ fontSize: '20px' }}>Q {compra.total}</p>
                 </div>
                 <div className="compra-items">
                   {compra.items.map(item => (
                     <div key={item.id_producto} className="compra-item">
                       <FormatChip formato={item.tipo_formato} /><span className="f-display" style={{ fontSize: '14px' }}>{item.titulo_album}</span><span className="eyebrow">× {item.cantidad}</span><span className="eyebrow brass">Q {Number(item.subtotal).toLocaleString('es-GT')}</span>
                     </div>
                   ))}
                 </div>
               </div>
             ))}
          </div>
        </div>
      </div>

      {wishSelected && (
        <div className="wdetail-overlay" onClick={(e) => { if (e.target === e.currentTarget) setWishSelected(null); }}>
          <div className="wdetail-panel hairline">
            <button className="eyebrow" style={{ alignSelf: 'flex-end', color: 'var(--mute)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '10px' }} onClick={() => setWishSelected(null)}>✕ CERRAR</button>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}><AlbumCover album={{ titulo: wishSelected.titulo_album, artista: wishSelected.artista, url_portada: wishSelected.url_portada }} size={220} /></div>
            <p className="eyebrow velvet">{wishSelected.tipo_formato}</p>
            <h2 className="f-display" style={{ fontSize: '28px', lineHeight: 1.1, marginTop: '6px' }}>{wishSelected.titulo_album}</h2>
            <p className="f-serif" style={{ fontSize: '18px', color: 'var(--mute)', marginTop: '4px' }}>{wishSelected.artista}</p>
            <p className="f-display" style={{ fontSize: '38px', color: 'var(--brass)', marginTop: '14px' }}>Q {Number(wishSelected.precio).toLocaleString('es-GT')}</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button className="btn btn-primary" style={{ flex: 1, height: '52px' }} onClick={() => addWishToCart(wishSelected)}>+ AGREGAR A LA BOLSA</button>
              <button className="btn btn-outline" style={{ height: '52px', width: '52px', padding: 0, color: 'var(--velvet)', borderColor: 'var(--velvet)' }} onClick={() => { wishlist.toggle(wishSelected); setWishSelected(null); }}>♥</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
