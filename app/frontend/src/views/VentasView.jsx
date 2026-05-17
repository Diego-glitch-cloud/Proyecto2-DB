import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BarChart2, Package, ShoppingBag, Eye, LogOut } from 'lucide-react';
import { useAuth } from '../AuthContext';
import api from '../api';
import { PosterStrip } from '../components/PosterStrip';
import { ThemeToggle } from '../components/ThemeToggle';
import { FormatChip } from '../components/FormatChip';
import './VentasView.css';

export default function VentasView() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVenta, setSelectedVenta] = useState(null);
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  const totalUds = (v) => v.items?.reduce((s, i) => s + i.cantidad, 0) || 1;
  const formatDate = (iso) => new Date(iso).toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();

  const totalIngresos = useMemo(() => ventas.reduce((s, v) => s + Number(v.total), 0).toLocaleString('es-GT'), [ventas]);
  const totalItems = useMemo(() => ventas.reduce((s, v) => s + totalUds(v), 0), [ventas]);

  const loadVentas = async (params = {}) => {
    setLoading(true);
    try {
      const { data } = await api.get('/ventas', { params });
      setVentas(data);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    const params = {};
    if (fechaDesde) params.fecha_desde = fechaDesde;
    if (fechaHasta) params.fecha_hasta = fechaHasta;
    loadVentas(params);
  };

  const clearFilter = () => { setFechaDesde(''); setFechaHasta(''); loadVentas(); };

  const exportCSV = () => {
    const headers = ['ID', 'Fecha', 'Cliente', 'NIT', 'Empleado', 'Producto', 'Formato', 'Cantidad', 'Total'];
    const rows = ventas.flatMap(v =>
      (v.items || [{ titulo_album: '—', tipo_formato: '—', cantidad: 1, subtotal: v.total }]).map(item => [
        v.id_compra, formatDate(v.fecha), v.nombre_cliente, v.nit_cliente,
        v.nombre_empleado || 'Online', item.titulo_album, item.tipo_formato,
        item.cantidad, item.subtotal
      ])
    );
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), { href: url, download: `ventas_${new Date().toISOString().split('T')[0]}.csv` });
    a.click(); URL.revokeObjectURL(url);
  };

  useEffect(() => { loadVentas(); }, []);

  return (
    <div className="ventas-root">
      <PosterStrip left="BACKSTAGE · REPORTE DE VENTAS" right={`${ventas.length} VENTAS REGISTRADAS`} />

      <div className="layout">
        <aside className="rail hairline-r">
          <div className="rail-logo"><span className="f-display" style={{ fontSize: '20px', fontStyle: 'italic', color: 'var(--velvet)' }}>4</span></div>
          <div className="rail-div" />
          <Link className="rail-btn" to="/admin" title="Dashboard"><BarChart2 size={18} strokeWidth={1.4} /></Link>
          <Link className="rail-btn" to="/admin/inventario" title="Inventario"><Package size={18} strokeWidth={1.4} /></Link>
          <Link className="rail-btn active" to="/admin/ventas" title="Ventas"><ShoppingBag size={18} strokeWidth={1.4} /></Link>
          <Link className="rail-btn" to="/" title="Ver catálogo"><Eye size={18} strokeWidth={1.4} /></Link>
          <div style={{ marginTop: 'auto' }}>
            <button className="rail-btn" onClick={() => { auth.logout(); navigate('/login'); }}><LogOut size={18} strokeWidth={1.4} /></button>
          </div>
        </aside>

        <div className="content">
          <div className="content-header hairline-b">
            <div>
              <p className="eyebrow brass">REPORTE</p>
              <h1 className="f-display page-title">Registro de <em className="accent">ventas.</em></h1>
              <p className="f-serif" style={{ fontSize: '14px', color: 'var(--mute)', marginTop: '4px' }}>Datos reales desde <span className="eyebrow" style={{ color: 'var(--brass)' }}>vw_resumen_ventas</span></p>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button className="btn btn-ghost" onClick={exportCSV}>EXPORTAR · CSV</button>
              <ThemeToggle />
            </div>
          </div>

          <div className="filters hairline-b">
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              <div className="field-inline"><label className="eyebrow">DESDE</label><input type="date" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)} className="date-input eyebrow" /></div>
              <div className="field-inline"><label className="eyebrow">HASTA</label><input type="date" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)} className="date-input eyebrow" /></div>
              <button className="btn btn-outline" style={{ height: '36px' }} onClick={applyFilter}>FILTRAR</button>
              <button className="eyebrow act-btn" onClick={clearFilter}>LIMPIAR</button>
            </div>
            <div className="summary">
              <div className="sum-item"><span className="eyebrow">TOTAL VENTAS</span><span className="f-display brass" style={{ fontSize: '24px' }}>{ventas.length}</span></div>
              <div className="sum-item"><span className="eyebrow">INGRESOS</span><span className="f-display brass" style={{ fontSize: '24px' }}>Q {totalIngresos}</span></div>
              <div className="sum-item"><span className="eyebrow">ÍTEMS VENDIDOS</span><span className="f-display brass" style={{ fontSize: '24px' }}>{totalItems}</span></div>
            </div>
          </div>

          <div className="table-wrap">
            {loading ? <p className="eyebrow" style={{ color: 'var(--mute)', padding: '24px' }}>CARGANDO…</p> : (
              <>
                <table className="sales-table">
                  <thead><tr>{['#', 'FECHA', 'CLIENTE', 'NIT', 'PRODUCTO', 'VENDEDOR', 'FMT', 'UD.', 'TOTAL'].map(h => <th key={h} className="eyebrow">{h}</th>)}</tr></thead>
                  <tbody>
                    {ventas.map((v, i) => (
                      <tr key={v.id_compra} className={`${i < ventas.length - 1 ? 'dashed-b' : ''} row-clickable`} onClick={() => setSelectedVenta(v)}>
                        <td className="eyebrow mute">{String(v.id_compra).padStart(4, '0')}</td>
                        <td className="eyebrow">{formatDate(v.fecha)}</td>
                        <td><p style={{ fontSize: '13px' }}>{v.nombre_cliente}</p></td>
                        <td className="eyebrow mute">{v.nit_cliente}</td>
                        <td>
                          <p className="f-display" style={{ fontSize: '14px', fontStyle: 'italic' }}>{v.items?.[0]?.titulo_album || '—'}</p>
                          {v.items?.length > 1 && <p className="eyebrow" style={{ color: 'var(--brass)' }}>+{v.items.length - 1} más · VER →</p>}
                        </td>
                        <td className="eyebrow mute">{v.nombre_empleado || 'Online'}</td>
                        <td><FormatChip formato={v.items?.[0]?.tipo_formato || 'Vinilo'} /></td>
                        <td className="eyebrow" style={{ textAlign: 'center' }}>{totalUds(v)}</td>
                        <td className="f-display brass" style={{ fontSize: '15px', textAlign: 'right' }}>Q {Number(v.total).toLocaleString('es-GT')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!ventas.length && <p className="eyebrow" style={{ color: 'var(--mute)', padding: '24px', textAlign: 'center' }}>SIN VENTAS EN EL PERÍODO SELECCIONADO</p>}
              </>
            )}
          </div>
        </div>
      </div>

      {selectedVenta && (
        <div className="vdetail-overlay" onClick={(e) => { if (e.target === e.currentTarget) setSelectedVenta(null); }}>
          <div className="vdetail-panel hairline">
            <div className="vdetail-head hairline-b">
              <div>
                <p className="eyebrow brass">PEDIDO #{String(selectedVenta.id_compra).padStart(4, '0')}</p>
                <p className="eyebrow" style={{ color: 'var(--mute)', marginTop: '4px' }}>{formatDate(selectedVenta.fecha)}</p>
              </div>
              <button className="eyebrow" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--mute)' }} onClick={() => setSelectedVenta(null)}>✕ CERRAR</button>
            </div>
            <div className="vdetail-section hairline-b">
              <p className="eyebrow mute" style={{ marginBottom: '10px' }}>CLIENTE</p>
              <div className="vdetail-row"><span className="eyebrow">NOMBRE</span><span style={{ fontSize: '14px' }}>{selectedVenta.nombre_cliente}</span></div>
              <div className="vdetail-row"><span className="eyebrow">NIT</span><span className="eyebrow" style={{ color: 'var(--ink)' }}>{selectedVenta.nit_cliente}</span></div>
              <div className="vdetail-row"><span className="eyebrow">VENDEDOR</span><span className="eyebrow" style={{ color: 'var(--ink)' }}>{selectedVenta.nombre_empleado || 'ONLINE'}</span></div>
            </div>
            <div className="vdetail-section">
              <p className="eyebrow mute" style={{ marginBottom: '12px' }}>{selectedVenta.items?.length} PRODUCTO{selectedVenta.items?.length > 1 ? 'S' : ''}</p>
              {selectedVenta.items?.map(item => (
                <div key={item.id_producto} className="vdetail-item hairline-b">
                  <div style={{ flex: 1 }}>
                    <p className="f-display" style={{ fontSize: '16px', lineHeight: 1.1 }}>{item.titulo_album}</p>
                    <p className="eyebrow" style={{ marginTop: '4px', color: 'var(--mute)' }}>{item.nombre_artista}</p>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '6px', alignItems: 'center' }}>
                      <FormatChip formato={item.tipo_formato} />
                      <span className="eyebrow" style={{ color: 'var(--mute)' }}>{item.categoria}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p className="eyebrow" style={{ color: 'var(--mute)' }}>× {item.cantidad}</p>
                    <p className="eyebrow" style={{ color: 'var(--mute)', marginTop: '2px' }}>Q {Number(item.precio_unitario).toLocaleString('es-GT')} c/u</p>
                    <p className="f-display brass" style={{ fontSize: '18px', marginTop: '4px' }}>Q {Number(item.subtotal).toLocaleString('es-GT')}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="vdetail-total hairline-t">
              <span className="eyebrow">TOTAL PEDIDO</span>
              <span className="f-display brass" style={{ fontSize: '28px' }}>Q {Number(selectedVenta.total).toLocaleString('es-GT')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
