import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { authService } from '../services';
import { toast } from 'sonner';
import { Role } from '@/shared/types/enums';

const authStoreMock = vi.hoisted(() => ({
  setAuth: vi.fn(),
}));

const navigateMock = vi.hoisted(() => vi.fn());

// Mock authService
vi.mock('../services', () => ({
  authService: {
    login: vi.fn(),
  },
}));

vi.mock('../store', () => ({
  useAuthStore: () => ({
    setAuth: authStoreMock.setAuth,
  }),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

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

  it('shows inline and toast feedback for invalid credentials without navigating', async () => {
    const user = userEvent.setup();
    vi.mocked(authService.login).mockResolvedValue({
      success: false,
      message: 'Invalid credentials',
      statusCode: 401,
      data: null,
    });

    render(
      <BrowserRouter>
        <LoginForm />
      </BrowserRouter>
    );

    await user.type(screen.getByLabelText(/email/i), 'client@example.com');
    await user.type(screen.getByPlaceholderText(/enter your password/i), 'wrong-password');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password.');
    expect(toast.error).toHaveBeenCalledWith('Invalid email or password.');
    expect(navigateMock).not.toHaveBeenCalled();
    expect(authStoreMock.setAuth).not.toHaveBeenCalled();
  });

  it('keeps successful login auth, toast, and role navigation behavior', async () => {
    const user = userEvent.setup();
    const authResponse = {
      id: 'client-1',
      email: 'client@example.com',
      fullName: 'Client User',
      role: Role.CLIENT,
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    };
    vi.mocked(authService.login).mockResolvedValue({
      success: true,
      message: 'OK',
      statusCode: 200,
      data: authResponse,
    });

    render(
      <BrowserRouter>
        <LoginForm />
      </BrowserRouter>
    );

    await user.type(screen.getByLabelText(/email/i), 'client@example.com');
    await user.type(screen.getByPlaceholderText(/enter your password/i), 'correct-password');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    expect(authStoreMock.setAuth).toHaveBeenCalledWith(authResponse, 'access-token', 'refresh-token');
    expect(toast.success).toHaveBeenCalledWith('Login successful!');
    expect(navigateMock).toHaveBeenCalledWith('/client');
    expect(screen.queryByText('Invalid email or password.')).not.toBeInTheDocument();
  });
});
