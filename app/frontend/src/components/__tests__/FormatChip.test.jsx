import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FormatChip } from '../FormatChip';

describe('FormatChip component', () => {
  it('renders the format text correctly', () => {
    render(<FormatChip formato="CD" />);
    expect(screen.getByText('CD')).toBeDefined();
  });

  it('renders a dot span when format is Vinilo', () => {
    const { container } = render(<FormatChip formato="Vinilo" />);
    expect(container.querySelector('.format-dot')).not.toBeNull();
  });

  it('applies the correct size class', () => {
    const { container } = render(<FormatChip formato="Cassette" size="lg" />);
    expect(container.firstChild.classList.contains('lg')).toBe(true);
  });
});
