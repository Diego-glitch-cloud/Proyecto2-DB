import React, { createContext, useContext, useState, useMemo } from 'react';
import api from './api/index.js';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

function _decodeJwt(t) {
  try { return JSON.parse(atob(t.split('.')[1])) } catch { return {} }
}

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));

  const isAuthenticated = !!token;
  const isStaff = ['admin', 'vendedor'].includes(user?.rol);

  const login = async (correo, contrasena) => {
    const { data } = await api.post('/auth/login', { correo, contrasena });
    const payload = _decodeJwt(data.token);
    
    setToken(data.token);
    const userData = { nombre: data.nombre, rol: data.rol, id: payload.id };
    setUser(userData);
    
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(userData));
    
    return data.rol;
  };

  const register = async (nombre, correo, contrasena) => {
    await api.post('/auth/register', { nombre, correo, contrasena });
  };

  const logout = () => {
    
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value = useMemo(() => ({
    token,
    user,
    isAuthenticated,
    isStaff,
    login,
    register,
    logout
  }), [token, user, isAuthenticated, isStaff]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
