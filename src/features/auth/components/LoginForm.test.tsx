import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { authService } from '../services';

// Mock authService
vi.mock('../services', () => ({
  authService: {
    login: vi.fn(),
  },
}));

describe('LoginForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form fields', () => {
    render(
      <BrowserRouter>
        <LoginForm />
      </BrowserRouter>
    );
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    render(
      <BrowserRouter>
        <LoginForm />
      </BrowserRouter>
    );
    
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    expect(await screen.findByText(/please enter your email/i)).toBeInTheDocument();
    expect(await screen.findByText(/please enter your password/i)).toBeInTheDocument();
  });

  it('hides password by default', () => {
    render(
      <BrowserRouter>
        <LoginForm />
      </BrowserRouter>
    );

    expect(screen.getByPlaceholderText(/enter your password/i)).toHaveAttribute('type', 'password');
    expect(screen.getByRole('button', { name: /show password/i })).toBeInTheDocument();
  });

  it('toggles password visibility on and off', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <LoginForm />
      </BrowserRouter>
    );

    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    const showButton = screen.getByRole('button', { name: /show password/i });

    await user.click(showButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: /hide password/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /hide password/i }));
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(screen.getByRole('button', { name: /show password/i })).toBeInTheDocument();
  });

  it('keeps visibility control working after blur and refocus', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <LoginForm />
      </BrowserRouter>
    );

    const passwordInput = screen.getByPlaceholderText(/enter your password/i);

    await user.type(passwordInput, 'secret123');
    await user.click(document.body);
    await user.click(passwordInput);

    await user.click(screen.getByRole('button', { name: /show password/i }));
    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(passwordInput).toHaveValue('secret123');

    await user.click(screen.getByRole('button', { name: /hide password/i }));
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(passwordInput).toHaveValue('secret123');
  });

  it('supports repeated visibility toggling after blur and refocus', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <LoginForm />
      </BrowserRouter>
    );

    const passwordInput = screen.getByPlaceholderText(/enter your password/i);

    await user.type(passwordInput, 'secret123');
    await user.tab();
    await user.click(passwordInput);

    await user.click(screen.getByRole('button', { name: /show password/i }));
    expect(passwordInput).toHaveAttribute('type', 'text');

    await user.click(screen.getByRole('button', { name: /hide password/i }));
    expect(passwordInput).toHaveAttribute('type', 'password');

    await user.click(screen.getByRole('button', { name: /show password/i }));
    expect(passwordInput).toHaveAttribute('type', 'text');
  });

  it('does not submit the form or clear the password when toggling visibility', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <LoginForm />
      </BrowserRouter>
    );

    const passwordInput = screen.getByPlaceholderText(/enter your password/i);

    await user.type(passwordInput, 'secret123');
    await user.click(screen.getByRole('button', { name: /show password/i }));

    expect(authService.login).not.toHaveBeenCalled();
    expect(passwordInput).toHaveValue('secret123');
    expect(passwordInput).toHaveAttribute('type', 'text');
  });
});
