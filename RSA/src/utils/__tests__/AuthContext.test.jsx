import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AuthProvider from '../AuthContext';

describe('AuthProvider', () => {
  it('renders children', () => {
    render(
      <AuthProvider>
        <div data-testid="child">Hello</div>
      </AuthProvider>
    );
    expect(screen.getByTestId('child')).toBeDefined();
  });
});
