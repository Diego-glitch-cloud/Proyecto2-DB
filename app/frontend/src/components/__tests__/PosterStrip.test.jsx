import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PosterStrip } from '../PosterStrip';

describe('PosterStrip component', () => {
  it('renders both left and right texts', () => {
    render(<PosterStrip left="Left Content" right="Right Content" />);
    expect(screen.getByText('Left Content')).toBeDefined();
    expect(screen.getByText('Right Content')).toBeDefined();
  });
});
