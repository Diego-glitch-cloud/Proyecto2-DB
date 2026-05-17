import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AlbumCover } from '../AlbumCover';

describe('AlbumCover component', () => {
  it('renders a fallback div when no image url is provided', () => {
    const { container } = render(<AlbumCover />);
    expect(container.querySelector('.cover-fallback')).not.toBeNull();
    expect(screen.getByText('?')).toBeDefined();
  });

  it('renders an image when url_portada is provided', () => {
    const album = { url_portada: 'http://example.com/image.jpg', artista: 'Artist', titulo: 'Title' };
    const { container } = render(<AlbumCover album={album} />);
    const img = container.querySelector('.cover-img');
    expect(img).not.toBeNull();
    expect(img.src).toBe('http://example.com/image.jpg');
    expect(img.alt).toBe('Artist — Title');
  });

  it('generates a label fallback correctly based on album data', () => {
    const album = { artista: 'Pink Floyd', anio: '1973' };
    render(<AlbumCover album={album} />);
    expect(screen.getByText('PIN / 1973')).toBeDefined();
  });
});
