import React from 'react';
import { Link } from 'react-router-dom';
import './NotFoundView.css';

export default function NotFoundView() {
  return (
    <div className="nf-root">
      <div className="nf-inner">
        <span className="nf-code f-display">404</span>
        <h1 className="f-display nf-title">Pagina <em className="accent">no encontrada.</em></h1>
        <p className="f-serif nf-sub">Esta pista no existe en nuestro catálogo.</p>
        <Link to="/" className="btn btn-primary" style={{ height: '52px', marginTop: '32px' }}>
          ← VOLVER AL CATÁLOGO
        </Link>
      </div>
    </div>
  );
}
