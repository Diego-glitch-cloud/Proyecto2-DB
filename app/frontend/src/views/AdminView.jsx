import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BarChart2, Package, ShoppingBag, Eye, Users, LogOut, X } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip } from 'chart.js';
import { useAuth } from '../AuthContext';
import api from '../api';
import { PosterStrip } from '../components/PosterStrip';
import { ThemeToggle } from '../components/ThemeToggle';
import { AlbumCover } from '../components/AlbumCover';
import './AdminView.css';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip);

export default function AdminView() {
  const navigate = useNavigate();
  const auth = useAuth();

  const [stats, setStats] = useState({});
  const [ventas, setVentas] = useState([]);
  const [productos, setProductos] = useState([]);

  // Empleado Modal
  const [showEmpModal, setShowEmpModal] = useState(false);
  const [empForm, setEmpForm] = useState({ nombre: '', correo: '', contrasena: '', DPI: '', rol: 'vendedor' });
  const [empLoading, setEmpLoading] = useState(false);
  const [empError, setEmpError] = useState('');
  const [empExito, setEmpExito] = useState(null);

  // Venta Modal
  const [showVentaModal, setShowVentaModal] = useState(false);
  const [tipoCliente, setTipoCliente] = useState('cuenta');
  const [correoBusqueda, setCorreoBusqueda] = useState('');
  const [clienteEncontrado, setClienteEncontrado] = useState(null);
  const [correoError, setCorreoError] = useState('');
  const [usarNitDistinto, setUsarNitDistinto] = useState(false);
  const [nombreCF, setNombreCF] = useState('');
  const [nitCF, setNitCF] = useState('CF');
  const [productoBusqueda, setProductoBusqueda] = useState('');
  const [ventaItems, setVentaItems] = useState([]);
  const [ventaLoading, setVentaLoading] = useState(false);
  const [ventaError, setVentaError] = useState('');
  const [ventaExito, setVentaExito] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/stats/publico').then(r => r.data),
      api.get('/ventas').then(r => r.data),
      api.get('/productos').then(r => r.data)
    ]).then(([s, v, p]) => {
      setStats(s); setVentas(v); setProductos(p);
    }).catch(() => {});
  }, []);

  const kpis = useMemo(() => [
    { label: 'PRODUCTOS EN CATÁLOGO', value: stats.total_productos ?? '—', sub: 'TÍTULOS DISPONIBLES', color: 'var(--brass)' },
    { label: 'CLIENTES REGISTRADOS', value: stats.total_clientes ?? '—', sub: 'CUENTAS ACTIVAS', color: 'var(--brass)' },
    { label: 'VENTAS TOTALES', value: stats.total_ventas ?? '—', sub: 'PEDIDOS REGISTRADOS', color: 'var(--brass)' },
    { label: 'PRODUCTOS STOCK BAJO', value: stats.alertas_stock ?? '—', sub: 'STOCK < 5 UNIDADES', color: stats.alertas_stock > 0 ? 'var(--velvet)' : 'var(--mute)' }
  ], [stats]);

  const stockAlerts = useMemo(() => productos.filter(p => p.stock < 5).slice(0, 6), [productos]);
  const recentSales = useMemo(() => ventas.slice(0, 8), [ventas]);

  const productosFiltrados = useMemo(() => {
    const q = productoBusqueda.toLowerCase().trim();
    const yaId = new Set(ventaItems.map(i => i.producto.id));
    const base = q ? productos.filter(p => p.titulo_album?.toLowerCase().includes(q) || p.artista?.toLowerCase().includes(q)) : productos.slice(0, 20);
    return base.filter(p => !yaId.has(p.id)).slice(0, 10);
  }, [productoBusqueda, productos, ventaItems]);

  const totalVenta = useMemo(() => ventaItems.reduce((s, i) => s + i.cantidad * Number(i.producto.precio), 0).toFixed(2), [ventaItems]);
  const puedeConfirmar = useMemo(() => {
    if (!ventaItems.length) return false;
    if (tipoCliente === 'cuenta') return !!correoBusqueda.trim() && !!clienteEncontrado;
    return !!nombreCF.trim();
  }, [ventaItems, tipoCliente, correoBusqueda, clienteEncontrado, nombreCF]);

  const chartData = useMemo(() => {
    if (!ventas.length) return null;
    const byMonth = {};
    ventas.forEach(v => {
      const d = new Date(v.fecha);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const lbl = d.toLocaleDateString('es-GT', { month: 'short', year: '2-digit' }).toUpperCase();
      if (!byMonth[key]) byMonth[key] = { label: lbl, total: 0 };
      byMonth[key].total += Number(v.total);
    });
    const months = Object.values(byMonth).slice(-8);
    return {
      labels: months.map(m => m.label),
      datasets: [{ data: months.map(m => m.total), backgroundColor: 'rgba(201,168,106,0.35)', borderColor: 'rgba(201,168,106,0.9)', borderWidth: 1 }]
    };
  }, [ventas]);

  const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#8E7E70', font: { family: 'JetBrains Mono', size: 9 } } }, y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#8E7E70', font: { family: 'JetBrains Mono', size: 9 } } } } };

  const formatDate = (iso) => new Date(iso).toLocaleDateString('es-GT', { day: '2-digit', month: 'short' }).toUpperCase();

  const registrarEmpleado = async () => {
    setEmpError(''); setEmpLoading(true);
    try {
      const { data } = await api.post('/admin/empleados', empForm);
      setEmpExito(data);
      const s = await api.get('/stats/publico').then(r => r.data);
      setStats(s);
    } catch (err) {
      setEmpError(err.response?.data?.error ?? 'Error al registrar empleado');
    } finally {
      setEmpLoading(false);
    }
  };

  const cerrarVentaModal = () => {
    setShowVentaModal(false); setTipoCliente('cuenta'); setCorreoBusqueda(''); setClienteEncontrado(null); setCorreoError(''); setUsarNitDistinto(false); setNombreCF(''); setNitCF('CF'); setProductoBusqueda(''); setVentaItems([]); setVentaLoading(false); setVentaError(''); setVentaExito(null);
  };

  const buscarClientePorCorreo = async () => {
    setCorreoError(''); setClienteEncontrado(null);
    const correo = correoBusqueda.trim();
    if (!correo) return;
    try {
      const { data } = await api.get(`/admin/buscar-cliente?correo=${encodeURIComponent(correo)}`);
      setClienteEncontrado(data);
    } catch (err) {
      setCorreoError(err.response?.data?.error ?? 'Cliente no encontrado');
    }
  };

  const agregarItem = (producto) => {
    const existe = ventaItems.find(i => i.producto.id === producto.id);
    if (existe) { if (existe.cantidad < producto.stock) setVentaItems(prev => prev.map(i => i.producto.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i)); }
    else setVentaItems([...ventaItems, { producto, cantidad: 1 }]);
  };

  const quitarItem = (idx) => setVentaItems(prev => prev.filter((_, i) => i !== idx));
  const updateCantidad = (idx, by) => {
    setVentaItems(prev => prev.map((item, i) => {
      if (i !== idx) return item;
      const newCant = item.cantidad + by;
      if (newCant < 1) return null;
      if (newCant > item.producto.stock) return item;
      return { ...item, cantidad: newCant };
    }).filter(Boolean));
  };

  const confirmarVenta = async () => {
    setVentaError(''); setVentaLoading(true);
    try {
      const body = { items: ventaItems.map(i => ({ id_producto: i.producto.id, cantidad: i.cantidad })) };
      if (tipoCliente === 'cuenta') {
        body.correo = correoBusqueda.trim();
        if (usarNitDistinto && nitCF.trim()) body.nit_cf = nitCF.trim();
      } else {
        body.nombre_cf = nombreCF.trim();
        body.nit_cf = nitCF.trim() || 'CF';
      }
      const { data } = await api.post('/ventas/presencial', body);
      setVentaExito(data);
      const [s, v, p] = await Promise.all([api.get('/stats/publico').then(r => r.data), api.get('/ventas').then(r => r.data), api.get('/productos').then(r => r.data)]);
      setStats(s); setVentas(v); setProductos(p);
    } catch (err) {
      setVentaError(err.response?.data?.error ?? 'Error al registrar la venta');
    } finally {
      setVentaLoading(false);
    }
  };

  return (
    <div className="admin-root">
      <PosterStrip left={`BACKSTAGE · ADMIN ✦ ${auth.user?.nombre?.split(' ')[0]?.toUpperCase()}`} right="MariaDB · CONECTADA ✦ ● ONLINE" />

      <div className="layout">
        <aside className="rail hairline-r">
          <div className="rail-logo"><span className="f-display" style={{ fontSize: '22px', fontStyle: 'italic', color: 'var(--velvet)' }}>4</span></div>
          <div className="rail-div" />
          <Link className="rail-btn active" to="/admin" title="Dashboard"><BarChart2 size={18} strokeWidth={1.4} /></Link>
          <Link className="rail-btn" to="/admin/inventario" title="Inventario"><Package size={18} strokeWidth={1.4} /></Link>
          <Link className="rail-btn" to="/admin/ventas" title="Ventas"><ShoppingBag size={18} strokeWidth={1.4} /></Link>
          <Link className="rail-btn" to="/" title="Ver catálogo cliente"><Eye size={18} strokeWidth={1.4} /></Link>
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <Link className="rail-btn" to="/admin/inventario" title="Clientes"><Users size={18} strokeWidth={1.4} /></Link>
            <button className="rail-btn" onClick={() => { auth.logout(); navigate('/login'); }}><LogOut size={18} strokeWidth={1.4} /></button>
          </div>
        </aside>

        <div className="content">
          <div className="content-header hairline-b">
            <div>
              <p className="eyebrow brass">HEADLINER</p>
              <h1 className="f-display page-title">Resumen <em className="accent">general.</em></h1>
              <p className="f-serif page-sub">Estado actual del sistema — datos en tiempo real.</p>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {auth.user?.rol === 'admin' && <button className="btn btn-ghost" style={{ height: '40px' }} onClick={() => { setShowEmpModal(true); setEmpExito(null); setEmpError(''); }}>+ EMPLEADO</button>}
              <button className="btn btn-primary" style={{ height: '40px' }} onClick={() => setShowVentaModal(true)}>+ VENTA PRESENCIAL</button>
              <Link to="/admin/ventas" className="btn btn-ghost" style={{ height: '40px', textDecoration: 'none' }}>REPORTE VENTAS →</Link>
              <Link to="/admin/inventario" className="btn btn-ghost" style={{ height: '40px', textDecoration: 'none' }}>+ AGREGAR PRODUCTO</Link>
              <ThemeToggle />
            </div>
          </div>

          <div className="admin-main">
            <div className="kpi-strip hairline">
              {kpis.map(kpi => (
                <div key={kpi.label} className="kpi-cell hairline-r">
                  <p className="eyebrow">{kpi.label}</p>
                  <p className="f-display kpi-value">{kpi.value}</p>
                  <p className="eyebrow kpi-sub" style={{ color: kpi.color }}>{kpi.sub}</p>
                </div>
              ))}
            </div>

            <div className="row-2">
              <div className="card hairline">
                <div className="card-head hairline-b">
                  <div>
                    <p className="eyebrow velvet">● STOCK &lt; 5 UNIDADES</p>
                    <h3 className="f-display card-title">Alertas de <em className="accent">stock</em></h3>
                  </div>
                  <Link to="/admin/inventario" className="eyebrow brass" style={{ fontSize: '9px', textDecoration: 'none' }}>VER INVENTARIO →</Link>
                </div>
                <div className="alerts-list">
                  {!stockAlerts.length && <p className="eyebrow" style={{ padding: '20px', color: 'var(--mute)' }}>✓ TODOS LOS PRODUCTOS TIENEN STOCK SUFICIENTE</p>}
                  {stockAlerts.map((p, i) => (
                    <div key={p.id} className={`alert-row ${i < stockAlerts.length - 1 ? 'dashed-b' : ''}`}>
                      <AlbumCover album={{ titulo: p.titulo_album, artista: p.artista, url_portada: p.url_portada }} size={44} />
                      <div className="alert-info">
                        <p className="f-display" style={{ fontSize: '13px', lineHeight: 1.1 }}>{p.titulo_album}</p>
                        <p className="eyebrow" style={{ color: 'var(--mute)', marginTop: '2px' }}>{p.artista} · {p.tipo_formato}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p className="f-display velvet" style={{ fontSize: '22px' }}>{String(p.stock).padStart(2, '0')}</p>
                        <p className="eyebrow" style={{ color: 'var(--mute)' }}>UD.</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card hairline">
                <div className="card-head hairline-b">
                  <div>
                    <p className="eyebrow mute">● VW_RESUMEN_VENTAS</p>
                    <h3 className="f-display card-title">Ventas por <em className="accent">mes</em></h3>
                  </div>
                </div>
                <div className="chart-wrap">
                  {chartData ? <Bar data={chartData} options={chartOptions} /> : <p className="eyebrow" style={{ padding: '20px', color: 'var(--mute)' }}>CARGANDO…</p>}
                </div>
              </div>
            </div>

            <div className="card hairline">
              <div className="table-header hairline-b">
                <div>
                  <p className="eyebrow mute">ÚLTIMAS COMPRAS REGISTRADAS</p>
                  <h3 className="f-display card-title">Ventas <em className="accent">recientes</em></h3>
                </div>
                <Link to="/admin/ventas" className="eyebrow brass" style={{ fontSize: '9px', textDecoration: 'none' }}>VER REPORTE COMPLETO →</Link>
              </div>
              <table className="sales-table">
                <thead><tr>{['#', 'FECHA', 'CLIENTE', 'PRODUCTO', 'VENDEDOR', 'TOTAL'].map(h => <th key={h} className="eyebrow">{h}</th>)}</tr></thead>
                <tbody>
                  {recentSales.map((v, i) => (
                    <tr key={v.id_compra} className={i < recentSales.length - 1 ? 'dashed-b' : ''}>
                      <td className="eyebrow mute">{String(v.id_compra).padStart(4, '0')}</td>
                      <td className="eyebrow">{formatDate(v.fecha)}</td>
                      <td><p style={{ fontSize: '13px' }}>{v.nombre_cliente}</p><p className="eyebrow mute">{v.nit_cliente}</p></td>
                      <td><p className="f-display" style={{ fontSize: '14px', fontStyle: 'italic' }}>{v.items?.[0]?.titulo_album || '—'}</p></td>
                      <td className="eyebrow mute">{v.nombre_empleado || 'Online'}</td>
                      <td className="f-display brass" style={{ fontSize: '15px', textAlign: 'right' }}>Q {Number(v.total).toLocaleString('es-GT')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {showEmpModal && (
        <div className="vp-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowEmpModal(false); }}>
          <div className="vp-modal">
            {empExito ? (
              <div className="vp-success">
                <p className="eyebrow brass" style={{ marginBottom: '8px' }}>✓ EMPLEADO REGISTRADO</p>
                <p className="f-display" style={{ fontSize: '28px' }}>{empExito.nombre}</p>
                <p className="eyebrow mute" style={{ marginTop: '6px' }}>{empExito.correo}</p>
                <p className="eyebrow" style={{ marginTop: '4px', color: 'var(--brass)' }}>{empExito.rol.toUpperCase()} · DPI {empExito.DPI}</p>
                <button className="btn btn-primary" style={{ width: '100%', height: '44px', marginTop: '24px' }} onClick={() => setShowEmpModal(false)}>CERRAR</button>
              </div>
            ) : (
              <>
                <div className="vp-header hairline-b">
                  <div><p className="eyebrow brass">● NUEVO EMPLEADO</p><h2 className="f-display" style={{ fontSize: '22px', marginTop: '2px' }}>Registrar <em className="accent">staff</em></h2></div>
                  <button className="rail-btn" onClick={() => setShowEmpModal(false)}><X size={18} strokeWidth={1.4} /></button>
                </div>
                <div className="vp-body">
                  <div className="vp-section">
                    <div className="vp-tabs" style={{ marginBottom: '16px' }}>
                      <button className={`vp-tab ${empForm.rol === 'vendedor' ? 'active' : ''}`} onClick={() => setEmpForm({ ...empForm, rol: 'vendedor' })}>VENDEDOR</button>
                      <button className={`vp-tab ${empForm.rol === 'admin' ? 'active' : ''}`} onClick={() => setEmpForm({ ...empForm, rol: 'admin' })}>ADMIN</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div><p className="eyebrow mute" style={{ fontSize: '9px', marginBottom: '4px' }}>NOMBRE COMPLETO</p><input value={empForm.nombre} onChange={e => setEmpForm({ ...empForm, nombre: e.target.value })} className="vp-field" placeholder="Nombre del empleado" /></div>
                      <div><p className="eyebrow mute" style={{ fontSize: '9px', marginBottom: '4px' }}>CORREO ELECTRÓNICO</p><input value={empForm.correo} onChange={e => setEmpForm({ ...empForm, correo: e.target.value })} className="vp-field" placeholder="correo@tienda.com" type="email" /></div>
                      <div><p className="eyebrow mute" style={{ fontSize: '9px', marginBottom: '4px' }}>CONTRASEÑA INICIAL</p><input value={empForm.contrasena} onChange={e => setEmpForm({ ...empForm, contrasena: e.target.value })} className="vp-field" placeholder="Mín. 6 caracteres" type="password" /></div>
                      <div><p className="eyebrow mute" style={{ fontSize: '9px', marginBottom: '4px' }}>DPI (13 dígitos)</p><input value={empForm.DPI} onChange={e => setEmpForm({ ...empForm, DPI: e.target.value })} className="vp-field" placeholder="1234567890123" maxLength="13" /></div>
                    </div>
                    {empError && <p className="eyebrow velvet" style={{ marginTop: '12px' }}>✗ {empError}</p>}
                    <button className="btn btn-primary" style={{ width: '100%', height: '46px', marginTop: '18px' }} disabled={empLoading || !empForm.nombre || !empForm.correo || !empForm.contrasena || empForm.DPI.length !== 13} onClick={registrarEmpleado}>
                      {empLoading ? 'REGISTRANDO…' : 'REGISTRAR EMPLEADO →'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showVentaModal && (
        <div className="vp-overlay" onClick={(e) => { if (e.target === e.currentTarget) cerrarVentaModal(); }}>
          <div className="vp-modal">
            {ventaExito ? (
              <div className="vp-success">
                <p className="eyebrow brass" style={{ marginBottom: '8px' }}>✓ VENTA REGISTRADA</p>
                <p className="f-display" style={{ fontSize: '36px', letterSpacing: '-0.02em' }}>#{String(ventaExito.id_compra).padStart(4, '0')}</p>
                <p className="eyebrow mute" style={{ marginTop: '6px' }}>{ventaExito.nombre_cliente} · {ventaExito.nit_cliente}</p>
                <div style={{ width: '100%', marginTop: '20px' }}>
                  {ventaExito.items.map(it => (
                    <div key={it.id_producto} className="vp-item-row hairline-b">
                      <span style={{ flex: 1, fontSize: '12px' }}>{it.nombre_producto}</span><span className="eyebrow" style={{ padding: '0 12px' }}>×{it.cantidad}</span><span className="eyebrow brass">Q {Number(it.subtotal).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <p className="f-display brass" style={{ fontSize: '26px', textAlign: 'right', width: '100%', marginTop: '14px' }}>TOTAL Q {ventaExito.total}</p>
                <button className="btn btn-primary" style={{ width: '100%', height: '46px', marginTop: '20px' }} onClick={cerrarVentaModal}>CERRAR</button>
              </div>
            ) : (
              <>
                <div className="vp-header hairline-b">
                  <div><p className="eyebrow brass">● NUEVA VENTA PRESENCIAL</p><h2 className="f-display" style={{ fontSize: '22px', marginTop: '2px' }}>Venta <em className="accent">en tienda</em></h2></div>
                  <button className="rail-btn" onClick={cerrarVentaModal}><X size={18} strokeWidth={1.4} /></button>
                </div>
                <div className="vp-body">
                  <div className="vp-section hairline-b">
                    <p className="eyebrow mute" style={{ marginBottom: '10px' }}>01 · CLIENTE</p>
                    <div className="vp-tabs">
                      <button className={`vp-tab ${tipoCliente === 'cuenta' ? 'active' : ''}`} onClick={() => { setTipoCliente('cuenta'); setClienteEncontrado(null); setCorreoError(''); }}>CON CUENTA</button>
                      <button className={`vp-tab ${tipoCliente === 'cf' ? 'active' : ''}`} onClick={() => setTipoCliente('cf')}>CONSUMIDOR FINAL</button>
                    </div>
                    {tipoCliente === 'cuenta' ? (
                      <div style={{ marginTop: '10px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input value={correoBusqueda} onChange={e => setCorreoBusqueda(e.target.value)} onKeyDown={e => e.key === 'Enter' && buscarClientePorCorreo()} className="vp-field" placeholder="correo@ejemplo.com" style={{ flex: 1 }} />
                          <button className="btn btn-ghost" style={{ height: '38px', fontSize: '9px', padding: '0 12px', flexShrink: 0 }} onClick={buscarClientePorCorreo}>VERIFICAR</button>
                        </div>
                        {clienteEncontrado && (
                          <div style={{ marginTop: '8px' }}>
                            <p className="eyebrow brass">✓ {clienteEncontrado.nombre} · NIT {clienteEncontrado.NIT}</p>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', cursor: 'pointer' }}>
                              <input type="checkbox" checked={usarNitDistinto} onChange={e => setUsarNitDistinto(e.target.checked)} style={{ accentColor: 'var(--brass)', width: '14px', height: '14px' }} />
                              <span className="eyebrow mute" style={{ fontSize: '9px' }}>FACTURAR A NIT DIFERENTE PARA ESTA VENTA</span>
                            </label>
                            {usarNitDistinto && <input value={nitCF} onChange={e => setNitCF(e.target.value)} className="vp-field" placeholder="NIT de facturación" style={{ marginTop: '8px' }} />}
                          </div>
                        )}
                        {correoError && <p className="eyebrow velvet" style={{ marginTop: '6px' }}>✗ {correoError}</p>}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <input value={nombreCF} onChange={e => setNombreCF(e.target.value)} className="vp-field" placeholder="Nombre del cliente" style={{ flex: 1 }} />
                        <input value={nitCF} onChange={e => setNitCF(e.target.value)} className="vp-field" placeholder="NIT o CF" style={{ width: '100px' }} />
                      </div>
                    )}
                  </div>
                  <div className="vp-section hairline-b">
                    <p className="eyebrow mute" style={{ marginBottom: '10px' }}>02 · PRODUCTOS</p>
                    <input value={productoBusqueda} onChange={e => setProductoBusqueda(e.target.value)} className="vp-field" placeholder="Buscar álbum o artista…" />
                    <div className="vp-prod-list">
                      {!productosFiltrados.length && <p className="eyebrow mute" style={{ padding: '10px 12px' }}>Sin resultados</p>}
                      {productosFiltrados.map(p => (
                        <div key={p.id} className="vp-prod-row">
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: '12px', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.titulo_album} ({p.tipo_formato})</p>
                            <p className="eyebrow mute" style={{ fontSize: '8px', marginTop: '2px' }}>{p.artista} · Q{p.precio} · Stock: {p.stock}</p>
                          </div>
                          <button className="vp-add-btn" disabled={p.stock === 0} onClick={() => agregarItem(p)}>+</button>
                        </div>
                      ))}
                    </div>
                    {ventaItems.length > 0 && (
                      <div style={{ marginTop: '12px', borderTop: '1px solid var(--line)', paddingTop: '12px' }}>
                        <p className="eyebrow mute" style={{ marginBottom: '8px' }}>ÍTEMS AÑADIDOS</p>
                        {ventaItems.map((item, i) => (
                          <div key={item.producto.id} className="vp-item-row">
                            <span style={{ flex: 1, fontSize: '12px' }}>{item.producto.titulo_album} ({item.producto.tipo_formato})</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <button className="vp-qty-btn" onClick={() => updateCantidad(i, -1)}>−</button>
                              <span className="eyebrow" style={{ minWidth: '20px', textAlign: 'center' }}>{item.cantidad}</span>
                              <button className="vp-qty-btn" onClick={() => updateCantidad(i, 1)}>+</button>
                              <span className="eyebrow brass" style={{ minWidth: '64px', textAlign: 'right' }}>Q {(item.cantidad * Number(item.producto.precio)).toFixed(2)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="vp-section">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
                      <p className="eyebrow mute">03 · TOTAL</p><p className="f-display brass" style={{ fontSize: '28px' }}>Q {totalVenta}</p>
                    </div>
                    {ventaError && <p className="eyebrow velvet" style={{ marginBottom: '10px' }}>✗ {ventaError}</p>}
                    <button className="btn btn-primary" style={{ width: '100%', height: '46px' }} disabled={!puedeConfirmar || ventaLoading} onClick={confirmarVenta}>
                      {ventaLoading ? 'PROCESANDO…' : 'REGISTRAR VENTA'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
