import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AlbumCard } from '../AlbumCard';

describe('AlbumCard component', () => {
  const mockProducto = {
    titulo_album: 'Dark Side of the Moon',
    artista: 'Pink Floyd',
    anio_album: 1973,
    precio: 250,
    tipo_formato: 'Vinilo'
  };

  it('renders product data correctly', () => {
    render(<AlbumCard producto={mockProducto} />);
    expect(screen.getByText('Dark Side of the Moon')).toBeDefined();
    expect(screen.getByText(/Pink Floyd/i)).toBeDefined();
    expect(screen.getAllByText(/1973/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Q 250/)).toBeDefined();
  });

  it('renders a NEW badge when isNew is true', () => {
    render(<AlbumCard producto={mockProducto} isNew={true} />);
    expect(screen.getByText('NUEVO')).toBeDefined();
  });

  it('calls onAdd when the cover is clicked', () => {
    const handleAdd = vi.fn();
    const { container } = render(<AlbumCard producto={mockProducto} onAdd={handleAdd} />);
    
    const cover = container.querySelector('.card-cover');
    fireEvent.click(cover);
    
    expect(handleAdd).toHaveBeenCalledTimes(1);
    expect(handleAdd).toHaveBeenCalledWith(mockProducto);
  });
});
