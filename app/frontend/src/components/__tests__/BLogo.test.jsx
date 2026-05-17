import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BLogo } from '../BLogo';

describe('BLogo component', () => {
  it('renders the M4U logo text', () => {
    render(<BLogo />);
    expect(screen.getByText('M')).toBeDefined();
    expect(screen.getByText('4')).toBeDefined();
    expect(screen.getByText('U')).toBeDefined();
  });

  it('renders the caption when provided', () => {
    render(<BLogo caption="Test Caption" />);
    expect(screen.getByText('Test Caption')).toBeDefined();
  });

  it('applies the specified font size', () => {
    const { container } = render(<BLogo size={32} />);
    expect(container.firstChild.style.fontSize).toBe('32px');
  });
});
