import React from 'react';
import './FormatChip.css';

export function FormatChip({ formato, size = 'sm' }) {
  return (
    <span className={`format-chip ${size}`}>
      {formato === 'Vinilo' && <span className="format-dot" />}
      {formato}
    </span>
  );
}
