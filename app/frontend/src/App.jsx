import React, { useEffect, useState } from 'react'
import api from './api'
import { useTheme } from './ThemeContext'
import { useCart } from './CartContext'
import { useAuth } from './AuthContext'
import { useWishlist } from './WishlistContext'

function App() {
  const [status, setStatus] = useState('Probando conexión con el backend...')
  const { mode, toggle: toggleTheme } = useTheme()
  const { add, count, total } = useCart()
  const { isAuthenticated, logout, user } = useAuth()
  const { items: wlItems, toggle: toggleWishlist } = useWishlist()

  useEffect(() => {
    // Probamos el endpoint público
    api.get('/stats/publico')
      .then(res => {
        setStatus('¡Conexión exitosa! Productos en base de datos: ' + res.data.total_productos)
      })
      .catch(err => {
        setStatus('Error de conexión: ' + err.message)
      })
  }, [])

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Hola Mundo (Modo: {mode})</h1>
      <p>{status}</p>
      
      <div style={{ border: '1px solid #ccc', padding: '1rem', marginTop: '1rem' }}>
        <h3>Estado Global</h3>
        <p>Usuario Autenticado: {isAuthenticated ? `Sí (${user?.nombre})` : 'No'}</p>
        <p>Items en Carrito: {count} | Total: Q{total}</p>
        <p>Items en Wishlist: {wlItems.length}</p>
      </div>

      <div style={{ marginTop: '1rem', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button onClick={toggleTheme} style={{ padding: '10px' }}>
          Alternar Tema
        </button>
        <button onClick={() => add({ id: 1, precio: 15.5, nombre: 'Disco Test' })} style={{ padding: '10px' }}>
          Agregar al Carrito
        </button>
        <button onClick={() => toggleWishlist({ id: 1, titulo_album: 'Disco Test', artista: 'Artist', precio: 15.5 })} style={{ padding: '10px' }}>
          Alternar Wishlist (Disco Test)
        </button>
        {isAuthenticated && (
          <button onClick={logout} style={{ padding: '10px' }}>
            Cerrar Sesión
          </button>
        )}
      </div>
    </div>
  )
}

export default App
