import React, { useEffect, useState } from 'react'
import api from './api'
import { useTheme } from './ThemeContext'

function App() {
  const [status, setStatus] = useState('Probando conexión con el backend...')
  const { mode, toggle } = useTheme()

  useEffect(() => {
    // Probamos el endpoint público
    api.get('/stats/publico')
      .then(res => {
        setStatus('¡Conexión exitosa! Productos en base de datos: ' + res.data.totalProductos)
      })
      .catch(err => {
        setStatus('Error de conexión: ' + err.message)
      })
  }, [])

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Hola Mundo (Modo: {mode})</h1>
      <p>{status}</p>
      <button onClick={toggle} style={{ padding: '10px', marginTop: '10px' }}>
        Alternar Tema
      </button>
    </div>
  )
}

export default App
