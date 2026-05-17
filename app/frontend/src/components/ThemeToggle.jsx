import React from 'react';
import { useTheme } from '../ThemeContext';
import './ThemeToggle.css';

export function ThemeToggle() {
  const { mode, toggle } = useTheme();

  return (
    <button className="theme-toggle" onClick={toggle}>
      <span className={`theme-eyebrow ${mode === 'dark' ? 'theme-active' : ''}`}>DARK</span>
      <span className="theme-sep">/</span>
      <span className={`theme-eyebrow ${mode === 'light' ? 'theme-active' : ''}`}>LIGHT</span>
    </button>
  );
}
