import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

const getStorageKey = (userId) => (userId ? `wishlist_${userId}` : 'wishlist');

export const WishlistProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);

  // Cargar wishlist cuando cambia el usuario autenticado
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      const stored = localStorage.getItem(getStorageKey(user.id));
      setItems(JSON.parse(stored || '[]'));
    } else {
      setItems([]);
    }
  }, [user, isAuthenticated]);

  const clearForCurrentUser = useCallback(() => {
    if (user?.id) {
      localStorage.removeItem(getStorageKey(user.id));
    }
    setItems([]);
  }, [user]);

  const toggle = useCallback((producto) => {
    setItems(prevItems => {
      const idx = prevItems.findIndex(i => i.id === producto.id);
      let newItems;
      if (idx >= 0) {
        newItems = prevItems.filter(i => i.id !== producto.id);
      } else {
        newItems = [...prevItems, {
          id:           producto.id,
          titulo_album: producto.titulo_album,
          artista:      producto.artista,
          precio:       producto.precio,
          url_portada:  producto.url_portada,
          tipo_formato: producto.tipo_formato
        }];
      }
      
      const userIdToSave = user?.id;
      localStorage.setItem(getStorageKey(userIdToSave), JSON.stringify(newItems));
      return newItems;
    });
  }, [user]);

  const has = useCallback((id) => {
    return items.some(i => i.id === id);
  }, [items]);

  const value = useMemo(() => ({
    items,
    toggle,
    has,
    clearForCurrentUser
  }), [items, toggle, has, clearForCurrentUser]);

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};
