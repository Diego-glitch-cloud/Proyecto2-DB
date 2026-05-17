import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ThemeToggle } from '../ThemeToggle';

// Mocking useTheme hook directly
vi.mock('../../ThemeContext', () => ({
  useTheme: vi.fn(() => ({
    mode: 'dark',
    toggle: vi.fn()
  }))
}));

import { useTheme } from '../../ThemeContext';

describe('ThemeToggle component', () => {
  it('renders DARK and LIGHT options', () => {
    render(<ThemeToggle />);
    expect(screen.getByText('DARK')).toBeDefined();
    expect(screen.getByText('LIGHT')).toBeDefined();
  });

  it('calls toggle function when button is clicked', () => {
    // We get the mocked function reference to assert on it
    const mockedUseTheme = vi.mocked(useTheme);
    const toggleMock = vi.fn();
    mockedUseTheme.mockReturnValue({ mode: 'dark', toggle: toggleMock });

    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(toggleMock).toHaveBeenCalledTimes(1);
  });
});
