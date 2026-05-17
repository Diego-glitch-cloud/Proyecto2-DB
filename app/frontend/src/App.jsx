import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { useAuth } from './AuthContext'

import LoginView from './views/LoginView'
import CatalogView from './views/CatalogView'
import NotFoundView from './views/NotFoundView'
import CartView from './views/CartView'
import ProfileView from './views/ProfileView'
import AdminView from './views/AdminView'
import InventarioView from './views/InventarioView'
import VentasView from './views/VentasView'

function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  )
}

export default App
