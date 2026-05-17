import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { useAuth } from './AuthContext'

// Componentes temporales (Views en Paso 12+)
const LoginView = () => <div>Vista Login (Test)</div>
const CatalogView = () => <div>Vista Catálogo (Test)</div>
const CartView = () => <div>Vista Carrito (Test)</div>
const ProfileView = () => <div>Vista Perfil (Test)</div>
const AdminView = () => <div>Vista Admin (Test)</div>
const InventarioView = () => <div>Vista Inventario (Test)</div>
const VentasView = () => <div>Vista Ventas (Test)</div>
const NotFoundView = () => <div>404 - No Encontrado</div>

function Navigation() {
  const { isAuthenticated, isStaff, logout } = useAuth();
  return (
    <nav style={{ display: 'flex', gap: '10px', padding: '1rem', background: '#222' }}>
      <Link to="/login">Login</Link>
      <Link to="/">Catálogo</Link>
      <Link to="/carrito">Carrito</Link>
      <Link to="/perfil">Perfil</Link>
      {isStaff && <Link to="/admin">Admin</Link>}
      {isStaff && <Link to="/admin/inventario">Inventario</Link>}
      {isStaff && <Link to="/admin/ventas">Ventas</Link>}
      {isAuthenticated && <button onClick={logout}>Salir</button>}
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Navigation />
      <div style={{ padding: '2rem' }}>
        <Routes>
          <Route path="/login" element={<ProtectedRoute guestOnly><LoginView /></ProtectedRoute>} />
          
          <Route path="/" element={<ProtectedRoute><CatalogView /></ProtectedRoute>} />
          <Route path="/carrito" element={<ProtectedRoute><CartView /></ProtectedRoute>} />
          <Route path="/perfil" element={<ProtectedRoute><ProfileView /></ProtectedRoute>} />
          
          <Route path="/admin" element={<ProtectedRoute roles={['admin', 'vendedor']}><AdminView /></ProtectedRoute>} />
          <Route path="/admin/inventario" element={<ProtectedRoute roles={['admin', 'vendedor']}><InventarioView /></ProtectedRoute>} />
          <Route path="/admin/ventas" element={<ProtectedRoute roles={['admin', 'vendedor']}><VentasView /></ProtectedRoute>} />
          
          <Route path="*" element={<NotFoundView />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
