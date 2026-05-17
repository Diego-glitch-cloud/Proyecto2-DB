import React from 'react';
import './PosterStrip.css';

export function PosterStrip({ left, right = '' }) {
  return (
    <div className="strip hairline-b">
      <span className="strip-left eyebrow brass">{left}</span>
      <span className="strip-right eyebrow">{right}</span>
    </div>
  );
}
