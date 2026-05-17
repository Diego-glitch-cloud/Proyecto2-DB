import React from 'react';
import './BLogo.css';

export function BLogo({ size = 20, caption = '' }) {
  return (
    <div className="b-logo" style={{ fontSize: `${size}px` }}>
      <span className="b-logo-m">M</span><span className="b-logo-4">4</span><span className="b-logo-u">U</span>
      {caption && <span className="b-logo-caption">{caption}</span>}
    </div>
  );
}
