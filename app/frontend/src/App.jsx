import React, { useEffect, useState } from 'react'
import api from './api'
import { useTheme } from './ThemeContext'
import { useCart } from './CartContext'
import { useAuth } from './AuthContext'
import { useWishlist } from './WishlistContext'
import { ThemeToggle } from './components/ThemeToggle'
import { BLogo } from './components/BLogo'
import { FormatChip } from './components/FormatChip'
import { AlbumCard } from './components/AlbumCard'
import { PosterStrip } from './components/PosterStrip'
import { FeaturedCarousel } from './components/FeaturedCarousel'

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

      <div style={{ border: '1px solid #ccc', padding: '1rem', marginTop: '1rem' }}>
        <h3>Componentes Genéricos (Paso 9)</h3>
        <ThemeToggle />
        <div style={{ margin: '1rem 0' }}>
          <BLogo size={24} caption="TEST CAPTION" />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <FormatChip formato="Vinilo" />
          <FormatChip formato="CD" size="lg" />
        </div>
      </div>

      <div style={{ border: '1px solid #ccc', padding: '1rem', marginTop: '1rem' }}>
        <h3>Componentes Musicales (Paso 10)</h3>
        <PosterStrip left="LANZAMIENTOS" right="VER TODOS" />
        <div style={{ margin: '1rem 0' }}>
          <AlbumCard 
            producto={{ titulo_album: 'Random Access Memories', artista: 'Daft Punk', anio_album: 2013, precio: 250, tipo_formato: 'Vinilo' }} 
            isNew={true} 
            onAdd={(p) => add(p)} 
          />
        </div>
        <FeaturedCarousel onAdd={(p) => add(p)} />
      </div>
    </div>
  )
}

export default App
