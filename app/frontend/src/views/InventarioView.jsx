import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BarChart2, Package, ShoppingBag, Eye, LogOut, X } from 'lucide-react';
import { useAuth } from '../AuthContext';
import api from '../api';
import { PosterStrip } from '../components/PosterStrip';
import { AlbumCover } from '../components/AlbumCover';
import { FormatChip } from '../components/FormatChip';
import './InventarioView.css';

export default function InventarioView() {
  const navigate = useNavigate();
  const auth = useAuth();

  const [products, setProducts] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [albumTipos, setAlbumTipos] = useState([]);
  const [filterQ, setFilterQ] = useState('');
  const [editing, setEditing] = useState(null);
  const [editPrecio, setEditPrecio] = useState(0);
  const [editStock, setEditStock] = useState(0);
  const [saving, setSaving] = useState(false);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [itunesQ, setItunesQ] = useState('');
  const [itunesResults, setItunesResults] = useState([]);
  const [itunesSelected, setItunesSelected] = useState(null);
  const [itunesNoResults, setItunesNoResults] = useState(false);
  const [buscando, setBuscando] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [addError, setAddError] = useState('');
  
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const [stockAdjTarget, setStockAdjTarget] = useState(null);
  const [stockAdjAmount, setStockAdjAmount] = useState(1);
  const [stockAdjError, setStockAdjError] = useState('');
  const [stockAdjSaving, setStockAdjSaving] = useState(false);

  const [newProducto, setNewProducto] = useState({ precio: 0, stock: 0, id_album_tipo: '', id_categoria: '', id_proveedor: '' });

  const loadProducts = () => api.get('/productos').then(({ data }) => setProducts(data));

  useEffect(() => {
    Promise.all([
      loadProducts(),
      api.get('/categorias').then(r => setCategorias(r.data)),
      api.get('/proveedores').then(r => setProveedores(r.data)),
      api.get('/album-tipos').then(r => setAlbumTipos(r.data))
    ]);
  }, []);

  const filteredProds = useMemo(() => {
    const q = filterQ.toLowerCase();
    if (!q) return products;
    return products.filter(p => p.titulo_album?.toLowerCase().includes(q) || p.artista?.toLowerCase().includes(q));
  }, [products, filterQ]);

  const saveEdit = async (id) => {
    setSaving(true);
    try {
      await api.patch(`/productos/${id}`, { precio: editPrecio, stock: editStock });
      setProducts(prev => prev.map(p => p.id === id ? { ...p, precio: editPrecio, stock: editStock } : p));
      setEditing(null);
    } catch (e) {
      alert(e.response?.data?.error || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const doStockAdj = async () => {
    const amt = stockAdjAmount;
    if (!amt || amt < 1) return;
    setStockAdjSaving(true); setStockAdjError('');
    const nuevoStock = Math.max(0, (stockAdjTarget.stock || 0) - amt);
    try {
      const { data } = await api.patch(`/productos/${stockAdjTarget.id}`, { stock: nuevoStock });
      setProducts(prev => prev.map(p => p.id === stockAdjTarget.id ? data : p));
      setStockAdjTarget(null);
    } catch (e) {
      setStockAdjError(e.response?.data?.error || 'No se pudo ajustar el stock');
    } finally {
      setStockAdjSaving(false);
    }
  };

  const doDelete = async () => {
    setDeleting(true); setDeleteError('');
    try {
      await api.delete(`/productos/${deleteTarget.id}`);
      setProducts(prev => prev.filter(p => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (e) {
      setDeleteError(e.response?.data?.error || 'No se pudo eliminar');
    } finally {
      setDeleting(false);
    }
  };

  const buscarItunes = async (e) => {
    e?.preventDefault();
    if (!itunesQ.trim()) return;
    setBuscando(true); setItunesResults([]); setItunesNoResults(false);
    try {
      const { data } = await api.get('/albums/buscar-portada', { params: { q: itunesQ, limit: 8 } });
      setItunesResults(data);
      setItunesNoResults(data.length === 0);
    } catch { } finally {
      setBuscando(false);
    }
  };

  const selectItunes = (r) => {
    setItunesSelected(r);
    setNewProducto({ precio: 0, stock: 0, id_album_tipo: '', id_categoria: '', id_proveedor: '' });
    setAddError('');
  };

  const submitProducto = async (e) => {
    e.preventDefault();
    setSubmitting(true); setAddError('');
    try {
      let id_album;
      try {
        const { data } = await api.post('/albums', {
          titulo: itunesSelected.titulo, anio: itunesSelected.anio || new Date().getFullYear(),
          track_count: itunesSelected.track_count || 1, url_portada: itunesSelected.url_500, nombre_artista: itunesSelected.artista
        });
        id_album = data.id;
      } catch (e) {
        if (e.response?.status === 409) id_album = e.response.data.id_album;
        else throw e;
      }

      await api.post('/productos', {
        precio: newProducto.precio, stock: newProducto.stock, id_album,
        id_album_tipo: newProducto.id_album_tipo, id_categoria: newProducto.id_categoria, id_proveedor: newProducto.id_proveedor
      });

      closeAddModal();
      await loadProducts();
    } catch (e) {
      setAddError(e.response?.data?.error || 'Error al agregar el producto');
    } finally {
      setSubmitting(false);
    }
  };

  const closeAddModal = () => {
    setShowAddModal(false); setItunesQ(''); setItunesResults([]); setItunesSelected(null); setItunesNoResults(false); setAddError('');
  };

  return (
    <div className="inv-root">
      <PosterStrip left="BACKSTAGE · INVENTARIO" right="CRUD DE PRODUCTOS" />

      <div className="layout">
        <aside className="rail hairline-r">
          <div className="rail-logo"><span className="f-display" style={{ fontSize: '20px', fontStyle: 'italic', color: 'var(--velvet)' }}>4</span></div>
          <div className="rail-div" />
          <Link className="rail-btn" to="/admin" title="Dashboard"><BarChart2 size={18} strokeWidth={1.4} /></Link>
          <Link className="rail-btn active" to="/admin/inventario" title="Inventario"><Package size={18} strokeWidth={1.4} /></Link>
          <Link className="rail-btn" to="/admin/ventas" title="Ventas"><ShoppingBag size={18} strokeWidth={1.4} /></Link>
          <Link className="rail-btn" to="/" title="Ver catálogo"><Eye size={18} strokeWidth={1.4} /></Link>
          <div style={{ marginTop: 'auto' }}>
            <button className="rail-btn" title="Cerrar sesión" onClick={() => { auth.logout(); navigate('/login'); }}><LogOut size={18} strokeWidth={1.4} /></button>
          </div>
        </aside>

        <div className="content">
          <div className="content-header hairline-b">
            <div><p className="eyebrow brass">INVENTARIO</p><h1 className="f-display page-title">Gestión de <em className="accent">productos.</em></h1></div>
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>+ AGREGAR PRODUCTO</button>
          </div>

          <div className="table-wrap">
            <div className="filter-bar">
              <input value={filterQ} onChange={e => setFilterQ(e.target.value)} placeholder="Filtrar por nombre, artista…" className="filter-input eyebrow" />
              <span className="eyebrow" style={{ color: 'var(--mute)' }}>{filteredProds.length} PRODUCTOS</span>
            </div>

            <table className="prod-table">
              <thead><tr>{['#', 'PORTADA', 'PRODUCTO', 'FORMATO', 'CATEGORÍA', 'PRECIO', 'STOCK', 'ACCIONES'].map(h => <th key={h} className="eyebrow">{h}</th>)}</tr></thead>
              <tbody>
                {filteredProds.map((p, i) => (
                  <tr key={p.id} className={i < filteredProds.length - 1 ? 'dashed-b' : ''}>
                    <td className="eyebrow mute">{p.id}</td>
                    <td><AlbumCover album={{ titulo: p.titulo_album, artista: p.artista, url_portada: p.url_portada }} size={44} /></td>
                    <td><p className="f-display" style={{ fontSize: '14px', lineHeight: 1.1 }}>{p.titulo_album}</p><p className="eyebrow" style={{ color: 'var(--mute)', marginTop: '2px' }}>{p.artista} · {p.anio_album}</p></td>
                    <td><FormatChip formato={p.tipo_formato} /></td>
                    <td className="eyebrow">{p.categoria}</td>
                    <td>
                      {editing !== p.id ? <span className="f-display brass" style={{ fontSize: '16px' }}>Q {Number(p.precio).toLocaleString('es-GT')}</span> : <input type="number" step="0.01" className="inline-input" style={{ width: '80px' }} value={editPrecio} onChange={e => setEditPrecio(Number(e.target.value))} />}
                    </td>
                    <td>
                      {editing !== p.id ? <span style={{ color: p.stock < 5 ? 'var(--velvet)' : 'var(--brass)', fontFamily: 'var(--f-display)', fontSize: '18px' }}>{String(p.stock).padStart(2, '0')}</span> : <input type="number" min="0" className="inline-input" style={{ width: '60px' }} value={editStock} onChange={e => setEditStock(Number(e.target.value))} />}
                    </td>
                    <td>
                      <div className="actions">
                        {editing !== p.id ? (
                          <>
                            <button className="eyebrow act-btn" onClick={() => { setEditing(p.id); setEditPrecio(Number(p.precio)); setEditStock(p.stock); }}>EDITAR</button>
                            <button className="eyebrow act-btn" style={{ color: 'var(--brass)' }} onClick={() => { setStockAdjTarget(p); setStockAdjAmount(1); setStockAdjError(''); }}>STOCK −</button>
                            <button className="eyebrow act-btn danger" onClick={() => { setDeleteTarget(p); setDeleteError(''); }} title="Elimina el registro completo">BORRAR</button>
                          </>
                        ) : (
                          <>
                            <button className="eyebrow act-btn" onClick={() => saveEdit(p.id)} disabled={saving}>GUARDAR</button>
                            <button className="eyebrow act-btn" onClick={() => setEditing(null)}>CANCELAR</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeAddModal(); }}>
          <div className="modal hairline">
            <div className="modal-head hairline-b">
              <p className="eyebrow brass">AGREGAR PRODUCTO VÍA ITUNES</p><button onClick={closeAddModal} style={{ background: 'none', border: 'none', color: 'var(--mute)', cursor: 'pointer' }}><X size={16} /></button>
            </div>
            <div className="modal-body">
              {!itunesSelected ? (
                <div>
                  <div className="field">
                    <label>Buscar álbum</label>
                    <form style={{ display: 'flex', gap: '8px' }} onSubmit={buscarItunes}>
                      <input value={itunesQ} onChange={e => setItunesQ(e.target.value)} placeholder="Ej: Jeff Buckley Grace" />
                      <button className="btn btn-primary" style={{ height: '40px', padding: '0 16px', flexShrink: 0 }} disabled={buscando} type="submit">{buscando ? '…' : 'BUSCAR'}</button>
                    </form>
                  </div>
                  {itunesResults.length > 0 && (
                    <div className="itunes-grid">
                      {itunesResults.map(r => (
                        <div key={r.itunes_id} className="itunes-card hairline" onClick={() => selectItunes(r)}>
                          {r.url_100 ? <img src={r.url_100} alt={r.titulo} style={{ width: '80px', height: '80px', objectFit: 'cover' }} /> : <div style={{ width: '80px', height: '80px', background: 'var(--line)' }} />}
                          <div className="itunes-info">
                            <p className="f-display" style={{ fontSize: '13px', lineHeight: 1.1 }}>{r.titulo}</p>
                            <p className="eyebrow" style={{ color: 'var(--mute)', marginTop: '3px' }}>{r.artista}</p>
                            <p className="eyebrow" style={{ color: 'var(--brass)', marginTop: '2px' }}>{r.anio}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {itunesNoResults && <p className="eyebrow" style={{ color: 'var(--mute)', padding: '12px 0' }}>SIN RESULTADOS</p>}
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '20px' }}>
                    {itunesSelected.url_500 && <img src={itunesSelected.url_500} style={{ width: '100px', height: '100px', objectFit: 'cover', border: '1px solid var(--line)' }} alt="" />}
                    <div>
                      <p className="f-display" style={{ fontSize: '18px' }}>{itunesSelected.titulo}</p>
                      <p className="eyebrow" style={{ color: 'var(--mute)', marginTop: '4px' }}>{itunesSelected.artista} · {itunesSelected.anio}</p>
                      <button className="eyebrow" style={{ color: 'var(--brass)', background: 'none', border: 'none', cursor: 'pointer', marginTop: '8px', fontSize: '9px' }} onClick={() => setItunesSelected(null)}>← CAMBIAR SELECCIÓN</button>
                    </div>
                  </div>
                  <form className="add-form" onSubmit={submitProducto}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <div className="field"><label>Precio (Q)</label><input type="number" step="0.01" min="1" required value={newProducto.precio} onChange={e => setNewProducto({ ...newProducto, precio: e.target.value })} /></div>
                      <div className="field"><label>Stock inicial</label><input type="number" min="0" required value={newProducto.stock} onChange={e => setNewProducto({ ...newProducto, stock: e.target.value })} /></div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                      <div className="field"><label>Formato</label><select required className="sel" value={newProducto.id_album_tipo} onChange={e => setNewProducto({ ...newProducto, id_album_tipo: e.target.value })}><option value="" disabled></option>{albumTipos.map(t => <option key={t.id} value={t.id}>{t.detalle}</option>)}</select></div>
                      <div className="field"><label>Categoría</label><select required className="sel" value={newProducto.id_categoria} onChange={e => setNewProducto({ ...newProducto, id_categoria: e.target.value })}><option value="" disabled></option>{categorias.map(c => <option key={c.id} value={c.id}>{c.detalle}</option>)}</select></div>
                      <div className="field"><label>Proveedor</label><select required className="sel" value={newProducto.id_proveedor} onChange={e => setNewProducto({ ...newProducto, id_proveedor: e.target.value })}><option value="" disabled></option>{proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}</select></div>
                    </div>
                    {addError && <p className="eyebrow" style={{ color: 'var(--velvet)', fontSize: '9px' }}>{addError}</p>}
                    <button className="btn btn-primary" style={{ width: '100%', height: '48px' }} disabled={submitting} type="submit">{submitting ? 'AGREGANDO…' : 'AGREGAR AL INVENTARIO →'}</button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {stockAdjTarget && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setStockAdjTarget(null); }}>
          <div className="modal hairline" style={{ maxWidth: '360px' }}>
            <div className="modal-head hairline-b"><p className="eyebrow brass">● AJUSTAR STOCK</p><button onClick={() => setStockAdjTarget(null)} style={{ background: 'none', border: 'none', color: 'var(--mute)', cursor: 'pointer' }}><X size={16} /></button></div>
            <div className="modal-body">
              <p className="f-serif" style={{ fontSize: '15px' }}><strong>{stockAdjTarget.titulo_album}</strong> — Stock actual: <span className="f-display brass" style={{ fontSize: '18px' }}>{stockAdjTarget.stock}</span></p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '16px' }}>
                <label className="eyebrow" style={{ color: 'var(--mute)' }}>REDUCIR EN</label>
                <input type="number" min="1" max={stockAdjTarget.stock} className="inline-input" style={{ width: '80px', textAlign: 'center' }} value={stockAdjAmount} onChange={e => setStockAdjAmount(Number(e.target.value))} />
                <span className="eyebrow mute">UNIDADES</span>
              </div>
              <p className="eyebrow" style={{ color: 'var(--mute)', fontSize: '9px', marginTop: '8px' }}>Nuevo stock: {Math.max(0, (stockAdjTarget.stock || 0) - (stockAdjAmount || 0))}</p>
              {stockAdjError && <p className="eyebrow" style={{ color: 'var(--velvet)', fontSize: '9px', marginTop: '6px' }}>{stockAdjError}</p>}
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button className="btn btn-outline" style={{ flex: 1, height: '44px' }} onClick={() => setStockAdjTarget(null)}>CANCELAR</button>
                <button className="btn btn-primary" style={{ flex: 1, height: '44px' }} onClick={doStockAdj} disabled={stockAdjSaving || stockAdjAmount < 1}>{stockAdjSaving ? 'GUARDANDO…' : 'APLICAR'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setDeleteTarget(null); }}>
          <div className="modal hairline" style={{ maxWidth: '400px' }}>
            <div className="modal-head hairline-b"><p className="eyebrow velvet">● ELIMINAR REGISTRO</p><button onClick={() => setDeleteTarget(null)} style={{ background: 'none', border: 'none', color: 'var(--mute)', cursor: 'pointer' }}><X size={16} /></button></div>
            <div className="modal-body">
              <p className="f-serif" style={{ fontSize: '16px' }}>¿Eliminar <strong>{deleteTarget.titulo_album}</strong> ({deleteTarget.tipo_formato}) del catálogo?</p>
              <p className="eyebrow" style={{ color: 'var(--mute)', marginTop: '8px' }}>Elimina el producto completo. Solo funciona si no tiene ventas registradas. Para reducir unidades usa el botón <strong style={{ color: 'var(--brass)' }}>STOCK −</strong>.</p>
              {deleteError && <p className="eyebrow" style={{ color: 'var(--velvet)', fontSize: '9px', marginTop: '8px' }}>{deleteError}</p>}
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button className="btn btn-outline" style={{ flex: 1, height: '44px' }} onClick={() => setDeleteTarget(null)}>CANCELAR</button>
                <button className="btn btn-primary" style={{ flex: 1, height: '44px', background: 'var(--velvet)' }} onClick={doDelete} disabled={deleting}>{deleting ? 'ELIMINANDO…' : 'ELIMINAR REGISTRO'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
