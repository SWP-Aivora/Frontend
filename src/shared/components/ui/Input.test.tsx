import { render, screen } from '@testing-library/react';
import { Input } from './Input';
import { describe, it, expect } from 'vitest';

describe('Input Component', () => {
  it('renders correctly', () => {
    render(<Input placeholder="Test input" />);
    expect(screen.getByPlaceholderText('Test input')).toBeInTheDocument();
  });

  it('is enabled by default', () => {
    render(<Input placeholder="Test input" />);
    expect(screen.getByPlaceholderText('Test input')).not.toBeDisabled();
  });

  it('can be disabled', () => {
    render(<Input placeholder="Test input" disabled />);
    expect(screen.getByPlaceholderText('Test input')).toBeDisabled();
  });
});
