import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useCart } from '../CartContext';
import api from '../api';
import { PosterStrip } from '../components/PosterStrip';
import { BLogo } from '../components/BLogo';
import { ThemeToggle } from '../components/ThemeToggle';
import { AlbumCover } from '../components/AlbumCover';
import { FormatChip } from '../components/FormatChip';
import './CartView.css';

export default function CartView() {
  const auth = useAuth();
  const cart = useCart();
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmacion, setConfirmacion] = useState(null);

  const [recogerEnTienda, setRecogerEnTienda] = useState(false);
  const [actualizarPerfil, setActualizarPerfil] = useState(false);
  const [datosSource, setDatosSource] = useState('saved');
  const [showConfirm, setShowConfirm] = useState(false);
  const [nit, setNit] = useState('');
  const [direccion, setDireccion] = useState('');

  useEffect(() => {
    if (auth.user?.rol === 'cliente') {
      api.get('/clientes/mi-perfil').then(({ data }) => {
        setPerfil(data);
        setNit(data.NIT || '');
        setDireccion(data.direccion || '');
      }).catch(() => {});
    }
  }, [auth.user]);

  const checkout = async () => {
    setErrorMsg(''); setLoading(true);
    try {
      if (datosSource === 'custom' && actualizarPerfil && !recogerEnTienda) {
        await api.patch('/clientes/mi-perfil', { NIT: nit || undefined, direccion: direccion || null });
      }
      const items = cart.items.map(i => ({ id_producto: i.id, cantidad: i.cantidad }));
      const { data } = await api.post('/ventas', { items });
      setShowConfirm(false);
      setConfirmacion(data);
      cart.clear();
    } catch (e) {
      setErrorMsg(e.response?.data?.error || 'Error al procesar el pedido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cart-root">
      <PosterStrip left="LA BOLSA · CONFIRMAR PEDIDO" right={`${cart.count} ÍTEMS`} />

      <nav className="cart-nav hairline-b">
        <Link to="/" className="back eyebrow">← CATÁLOGO</Link>
        <BLogo size={20} />
        <ThemeToggle />
      </nav>

      {!cart.items.length && !confirmacion ? (
        <div className="empty-state">
          <p className="f-display" style={{ fontSize: '32px' }}>Tu bolsa está <em className="accent">vacía.</em></p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: '24px', height: '48px', width: '220px' }}>
            VER CATÁLOGO →
          </Link>
        </div>
      ) : !confirmacion ? (
        <div className="cart-grid">
          <div className="items-col">
            <h2 className="f-display" style={{ fontSize: '36px', marginBottom: '24px' }}>Tu <em className="accent">bolsa.</em></h2>
            {cart.items.map(item => (
              <div key={item.id} className="item dashed-b">
                <AlbumCover album={{ titulo: item.titulo_album, artista: item.artista, url_portada: item.url_portada }} size={72} />
                <div className="item-info">
                  <p className="f-display" style={{ fontSize: '16px', lineHeight: 1.1 }}>{item.titulo_album}</p>
                  <p className="eyebrow" style={{ marginTop: '4px' }}>{item.artista}</p>
                  <FormatChip formato={item.tipo_formato || 'Vinilo'} style={{ marginTop: '6px' }} />
                </div>
                <div className="item-right">
                  <p className="f-display brass" style={{ fontSize: '18px' }}>Q {(Number(item.precio) * item.cantidad).toLocaleString('es-GT')}</p>
                  <div className="qty-ctrl">
                    <button onClick={() => cart.updateQty(item.id, item.cantidad - 1)}>−</button>
                    <span className="eyebrow">{item.cantidad}</span>
                    <button onClick={() => cart.updateQty(item.id, item.cantidad + 1)}>+</button>
                  </div>
                  <button className="remove-btn eyebrow" onClick={() => cart.remove(item.id)}>QUITAR</button>
                </div>
              </div>
            ))}
          </div>

          <div className="checkout-col hairline">
            <div className="checkout-header hairline-b"><p className="eyebrow brass">DATOS DE PEDIDO</p></div>
            <div className="checkout-body">
              {perfil && (
                <div className="perfil-info">
                  <p className="eyebrow">CLIENTE</p>
                  <p className="f-display" style={{ fontSize: '16px', marginTop: '4px' }}>{perfil.nombre}</p>
                  <p className="eyebrow" style={{ color: 'var(--mute)', marginTop: '2px' }}>{perfil.correo}</p>
                </div>
              )}

              <label className="option-row">
                <input type="checkbox" checked={recogerEnTienda} onChange={e => setRecogerEnTienda(e.target.checked)} className="checkbox" />
                <span className="eyebrow">RECOGER EN TIENDA (SIN ENVÍO)</span>
              </label>

              {!recogerEnTienda && (
                <>
                  <div className="datos-source">
                    <p className="eyebrow" style={{ color: 'var(--mute)', fontSize: '10px', marginBottom: '8px' }}>DATOS DE FACTURACIÓN Y ENTREGA</p>
                    <label className="option-row" style={{ padding: '10px 12px', border: `1px solid ${datosSource === 'saved' ? 'var(--brass)' : 'var(--line)'}`, marginBottom: '6px' }}>
                      <input type="radio" checked={datosSource === 'saved'} onChange={() => setDatosSource('saved')} className="checkbox" />
                      <div>
                        <span className="eyebrow" style={{ color: 'var(--ink)' }}>USAR DATOS GUARDADOS</span>
                        <span className="eyebrow" style={{ display: 'block', color: 'var(--mute)', fontSize: '9px', marginTop: '3px' }}>
                          NIT: {perfil?.NIT || 'CF'} · {perfil?.direccion || 'Sin dirección registrada'}
                        </span>
                      </div>
                    </label>
                    <label className="option-row" style={{ padding: '10px 12px', border: `1px solid ${datosSource === 'custom' ? 'var(--brass)' : 'var(--line)'}` }}>
                      <input type="radio" checked={datosSource === 'custom'} onChange={() => setDatosSource('custom')} className="checkbox" />
                      <span className="eyebrow" style={{ color: 'var(--ink)' }}>INGRESAR DATOS PARA ESTA COMPRA</span>
                    </label>
                  </div>

                  {datosSource === 'custom' && (
                    <>
                      <div className="field">
                        <label>NIT de facturación</label>
                        <input value={nit} onChange={e => setNit(e.target.value)} placeholder={perfil?.NIT || 'CF'} />
                      </div>
                      <div className="field">
                        <label>Dirección de entrega <span style={{ color: 'var(--mute)' }}>(opcional)</span></label>
                        <input value={direccion} onChange={e => setDireccion(e.target.value)} placeholder={perfil?.direccion || 'Sin dirección'} />
                      </div>
                      <label className="option-row" style={{ marginTop: 0 }}>
                        <input type="checkbox" checked={actualizarPerfil} onChange={e => setActualizarPerfil(e.target.checked)} className="checkbox" />
                        <span className="eyebrow">GUARDAR COMO NUEVOS PREDETERMINADOS</span>
                      </label>
                    </>
                  )}
                </>
              )}

              <div className="total-box hairline-t">
                <div className="total-row">
                  <span className="eyebrow">SUBTOTAL</span>
                  <span className="f-display" style={{ fontSize: '14px' }}>Q {cart.total}</span>
                </div>
                <div className="total-row">
                  <span className="eyebrow">ENVÍO</span>
                  <span className="eyebrow" style={{ color: 'var(--brass)' }}>{recogerEnTienda ? 'GRATIS' : 'A COORDINAR'}</span>
                </div>
                <div className="total-row total-final">
                  <span className="eyebrow">TOTAL</span>
                  <span className="f-display brass" style={{ fontSize: '28px' }}>Q {cart.total}</span>
                </div>
              </div>

              {errorMsg && <p className="eyebrow" style={{ color: 'var(--velvet)', fontSize: '10px' }}>{errorMsg}</p>}

              <button className="btn btn-primary" style={{ width: '100%', height: '52px' }} onClick={() => setShowConfirm(true)} disabled={loading || !cart.items.length}>
                REVISAR Y CONFIRMAR →
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showConfirm && (
        <div className="confirm-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowConfirm(false); }}>
          <div className="confirm-card hairline">
            <p className="eyebrow velvet" style={{ fontSize: '10px' }}>● CONFIRMAR PEDIDO</p>
            <h2 className="f-display" style={{ fontSize: '28px', marginTop: '10px' }}>¿Todo correcto?</h2>
            
            <div className="confirm-items" style={{ marginTop: '16px' }}>
              {cart.items.map(item => (
                <div key={item.id} className="eyebrow confirm-item">
                  {item.titulo_album} ({item.tipo_formato}) × {item.cantidad} — <span className="brass">Q {(Number(item.precio) * item.cantidad).toLocaleString('es-GT')}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '16px', borderTop: '1px solid var(--line)', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div className="eyebrow confirm-item"><span>CLIENTE</span><span style={{ color: 'var(--ink)' }}>{perfil?.nombre}</span></div>
              {!recogerEnTienda && <div className="eyebrow confirm-item"><span>NIT</span><span style={{ color: 'var(--ink)' }}>{datosSource === 'saved' ? (perfil?.NIT || 'CF') : (nit || 'CF')}</span></div>}
              {!recogerEnTienda && (datosSource === 'saved' ? perfil?.direccion : direccion) && <div className="eyebrow confirm-item"><span>DIRECCIÓN</span><span style={{ color: 'var(--ink)' }}>{datosSource === 'saved' ? perfil?.direccion : direccion}</span></div>}
              <div className="eyebrow confirm-item"><span>ENVÍO</span><span style={{ color: 'var(--brass)' }}>{recogerEnTienda ? 'RECOGER EN TIENDA' : 'A COORDINAR'}</span></div>
            </div>

            <p className="f-display brass" style={{ fontSize: '28px', textAlign: 'right', marginTop: '16px' }}>Total: Q {cart.total}</p>
            {errorMsg && <p className="eyebrow" style={{ color: 'var(--velvet)', fontSize: '10px', marginTop: '8px' }}>{errorMsg}</p>}

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button className="btn btn-outline" style={{ flex: 1, height: '44px' }} onClick={() => setShowConfirm(false)}>CANCELAR</button>
              <button className="btn btn-primary" style={{ flex: 1, height: '44px' }} onClick={checkout} disabled={loading}>{loading ? 'PROCESANDO…' : 'CONFIRMAR →'}</button>
            </div>
          </div>
        </div>
      )}

      {confirmacion && (
        <div className="confirm-overlay">
          <div className="confirm-card hairline">
            <p className="eyebrow velvet" style={{ fontSize: '10px' }}>● PEDIDO CONFIRMADO</p>
            <h2 className="f-display" style={{ fontSize: '36px', marginTop: '12px' }}>¡Listo, <em className="accent">{auth.user?.nombre?.split(' ')[0]}!</em></h2>
            <p className="f-serif" style={{ fontSize: '18px', color: 'var(--mute)', marginTop: '8px' }}>Tu pedido #{confirmacion.id_compra} ha sido registrado.</p>
            <div className="confirm-items">
              {confirmacion.items.map(item => (
                <div key={item.id_producto} className="eyebrow confirm-item">
                  {item.nombre_producto} × {item.cantidad} — Q {Number(item.subtotal).toLocaleString('es-GT')}
                </div>
              ))}
            </div>
            <p className="f-display brass" style={{ fontSize: '24px', marginTop: '16px' }}>Total: Q {confirmacion.total}</p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <Link to="/perfil" className="btn btn-outline" style={{ height: '44px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>VER MIS PEDIDOS</Link>
              <Link to="/" className="btn btn-primary" style={{ height: '44px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>SEGUIR COMPRANDO</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
