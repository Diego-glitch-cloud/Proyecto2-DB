import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import api from '../api';
import { BLogo } from '../components/BLogo';
import { PosterStrip } from '../components/PosterStrip';
import { AlbumCover } from '../components/AlbumCover';
import { ThemeToggle } from '../components/ThemeToggle';
import './LoginView.css';

export default function LoginView() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [tab, setTab] = useState('ingresar');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [covers, setCovers] = useState([]);
  const [stats, setStats] = useState({});
  const [form, setForm] = useState({ nombre: '', correo: '', contrasena: '' });

  const rotations = [-8, -4, 0, 5, 9];
  const offsets = [
    { x: -28, y: 22 }, { x: -12, y: 10 },
    { x: 0, y: 0 },
    { x: 14, y: 12 }, { x: 28, y: 24 }
  ];

  useEffect(() => {
    Promise.all([api.get('/albums'), api.get('/stats/publico')])
      .then(([albumsRes, statsRes]) => {
        setCovers(albumsRes.data.slice(0, 5));
        setStats(statsRes.data);
      }).catch(() => {});
  }, []);

  const switchTab = (t) => {
    setTab(t); setError(''); setShowPass(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const rol = await auth.login(form.correo, form.contrasena);
      navigate(['admin', 'vendedor'].includes(rol) ? '/admin' : '/');
    } catch (e) {
      setError(e.response?.data?.error || 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      await auth.register(form.nombre, form.correo, form.contrasena);
      setSuccess('¡Cuenta creada! Ahora puedes ingresar.');
      switchTab('ingresar');
      setForm({ nombre: '', correo: '', contrasena: '' });
    } catch (e) {
      setError(e.response?.data?.error || 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      <PosterStrip left="NOW SPINNING ✦ SIDE A ✦ 33⅓ RPM ✦ MASTERED ANALOG" right="GUATEMALA · GT ✦ EST · MCMXCVIII" />

      <div className="login-grid">
        <div className="left-col">
          <div className="bleed-4">4</div>
          <div className="left-inner">
            <BLogo size={24} caption="TIENDA MUSICAL" />
            <p className="eyebrow brass vol-label">VOL. XII · MMXXV</p>
            <h1 className="headline">MUSIC<br /><em className="accent">4 U.</em></h1>
            <p className="pull-quote">
              Discos de primera, ediciones limitadas y vinilos que no encontrarás en otro lugar. Curaduría desde Guatemala.
            </p>

            <div className="cluster-wrap">
              {covers.map((album, i) => (
                <div key={album.id} className="cluster-item" style={{
                  transform: `rotate(${rotations[i]}deg) translate(${offsets[i].x}px, ${offsets[i].y}px)`,
                  zIndex: i === 2 ? 5 : 5 - Math.abs(i - 2),
                  position: 'absolute',
                  boxShadow: 'var(--card-shadow)'
                }}>
                  <AlbumCover album={album} size={130} />
                </div>
              ))}
            </div>

            <div className="stats-row">
              <div className="stat"><span className="stat-n">{stats.total_productos ?? '—'}</span><span className="eyebrow">EDICIONES</span></div>
              <div className="stat"><span className="stat-n">{stats.total_generos ?? '—'}</span><span className="eyebrow">GÉNEROS</span></div>
              <div className="stat"><span className="stat-n">{stats.total_proveedores ?? '—'}</span><span className="eyebrow">SELLOS</span></div>
            </div>
          </div>
        </div>

        <div className="right-col">
          <div className="right-inner">
            <div className="meta-bar">
              <span className="eyebrow velvet">● ACCESO · CLIENTES</span>
              <ThemeToggle />
            </div>

            <h2 className="form-headline">{tab === 'ingresar' ? 'Ingresa.' : 'Únete.'}</h2>
            <p className="form-sub">{tab === 'ingresar' ? 'Te esperan en cabina.' : 'Curaduría privada, primer prensa.'}</p>

            <div className="tabs">
              <button className={`tab eyebrow ${tab === 'ingresar' ? 'active' : ''}`} onClick={() => switchTab('ingresar')}>INGRESAR</button>
              <button className={`tab eyebrow ${tab === 'registro' ? 'active' : ''}`} onClick={() => switchTab('registro')}>CREAR CUENTA</button>
            </div>

            {error && <p className="msg-error eyebrow">{error}</p>}
            {success && <p className="msg-ok eyebrow">{success}</p>}

            {tab === 'ingresar' ? (
              <form className="form" onSubmit={handleLogin}>
                <div className="field">
                  <label>Correo electrónico</label>
                  <input type="email" placeholder="tu@correo.com" required value={form.correo} onChange={e => setForm({...form, correo: e.target.value})} />
                </div>
                <div className="field pass-field">
                  <label>Contraseña</label>
                  <div className="pass-wrap">
                    <input type={showPass ? 'text' : 'password'} placeholder="••••••••" required value={form.contrasena} onChange={e => setForm({...form, contrasena: e.target.value})} />
                    <button type="button" className="eye-btn eyebrow" onClick={() => setShowPass(!showPass)}>{showPass ? 'OCULTAR' : 'VER'}</button>
                  </div>
                </div>
                <button className="btn btn-primary btn-full" disabled={loading}>{loading ? 'VERIFICANDO…' : 'INGRESAR'} <span className="arr">→</span></button>
              </form>
            ) : (
              <form className="form" onSubmit={handleRegister}>
                <div className="field">
                  <label>Nombre completo</label>
                  <input type="text" placeholder="Tu nombre" required minLength="2" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
                </div>
                <div className="field">
                  <label>Correo electrónico</label>
                  <input type="email" placeholder="tu@correo.com" required value={form.correo} onChange={e => setForm({...form, correo: e.target.value})} />
                </div>
                <div className="field pass-field">
                  <label>Contraseña <span style={{color:'var(--mute)', fontSize:'9px'}}>(mín. 6 caracteres)</span></label>
                  <div className="pass-wrap">
                    <input type={showPass ? 'text' : 'password'} placeholder="••••••••" required minLength="6" value={form.contrasena} onChange={e => setForm({...form, contrasena: e.target.value})} />
                    <button type="button" className="eye-btn eyebrow" onClick={() => setShowPass(!showPass)}>{showPass ? 'OCULTAR' : 'VER'}</button>
                  </div>
                </div>
                <button className="btn btn-primary btn-full" disabled={loading}>{loading ? 'CREANDO…' : 'CREAR CUENTA'} <span className="arr">→</span></button>
              </form>
            )}

            <div className="form-footer hairline-t">
              <span className="eyebrow">STAFF · ACCESO INTERNO</span>
              <Link to="/admin" className="eyebrow brass">m4u.gt/staff →</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
