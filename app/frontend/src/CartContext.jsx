import React, { createContext, useContext, useReducer, useMemo } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

const initialState = {
  items: [],
  open: false
};

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { producto } = action.payload;
      const existing = state.items.find(i => i.id === producto.id);
      let newItems;
      if (existing) {
        newItems = state.items.map(i =>
          i.id === producto.id
            ? { ...i, cantidad: Math.min(i.cantidad + 1, producto.stock ?? Infinity) }
            : i
        );
      } else {
        newItems = [...state.items, { ...producto, cantidad: 1 }];
      }
      return { ...state, items: newItems, open: true };
    }
    case 'REMOVE_ITEM': {
      return {
        ...state,
        items: state.items.filter(i => i.id !== action.payload.id)
      };
    }
    case 'UPDATE_QTY': {
      const { id, qty } = action.payload;
      return {
        ...state,
        items: state.items.map(i =>
          i.id === id ? { ...i, cantidad: Math.max(1, qty) } : i
        )
      };
    }
    case 'CLEAR_CART': {
      return { ...state, items: [] };
    }
    case 'SET_OPEN': {
      return { ...state, open: action.payload.open };
    }
    default:
      return state;
  }
}

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const count = state.items.reduce((sum, item) => sum + item.cantidad, 0);
  const total = state.items
    .reduce((sum, item) => sum + Number(item.precio) * item.cantidad, 0)
    .toFixed(2);

  const add = (producto) => dispatch({ type: 'ADD_ITEM', payload: { producto } });
  const remove = (id) => dispatch({ type: 'REMOVE_ITEM', payload: { id } });
  const updateQty = (id, qty) => dispatch({ type: 'UPDATE_QTY', payload: { id, qty } });
  const clear = () => dispatch({ type: 'CLEAR_CART' });
  const setOpen = (open) => dispatch({ type: 'SET_OPEN', payload: { open } });

  const value = useMemo(() => ({
    items: state.items,
    open: state.open,
    count,
    total,
    add,
    remove,
    updateQty,
    clear,
    setOpen
  }), [state.items, state.open, count, total]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
