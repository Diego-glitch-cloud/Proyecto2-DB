import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { ThemeProvider } from './ThemeContext.jsx'
import { AuthProvider } from './AuthContext.jsx'
import './assets/main.css'

createRoot(document.getElementById('app')).render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>,
)
