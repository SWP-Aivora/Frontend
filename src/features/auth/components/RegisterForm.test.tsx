import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Role } from '@/shared/types/enums';
import { authService } from '../services';
import { RegisterForm } from './RegisterForm';

vi.mock('../services', () => ({
  authService: {
    register: vi.fn(),
  },
}));

describe('RegisterForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('hides password and confirm password by default', () => {
    render(
      <BrowserRouter>
        <RegisterForm selectedRole={Role.CLIENT} />
      </BrowserRouter>
    );

    expect(screen.getByLabelText(/^password/i)).toHaveAttribute('type', 'password');
    expect(screen.getByLabelText(/^confirm password/i)).toHaveAttribute('type', 'password');
    expect(screen.getByRole('button', { name: /^show password$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^show confirm password$/i })).toBeInTheDocument();
  });

  it('toggles password and confirm password visibility independently', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <RegisterForm selectedRole={Role.CLIENT} />
      </BrowserRouter>
    );

    const passwordInput = screen.getByLabelText(/^password/i);
    const confirmPasswordInput = screen.getByLabelText(/^confirm password/i);

    await user.click(screen.getByRole('button', { name: /^show password$/i }));
    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');

    await user.click(screen.getByRole('button', { name: /^show confirm password$/i }));
    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(confirmPasswordInput).toHaveAttribute('type', 'text');

    await user.click(screen.getByRole('button', { name: /^hide password$/i }));
    await user.click(screen.getByRole('button', { name: /^hide confirm password$/i }));
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');
  });

  it('keeps both visibility controls working after blur and refocus without clearing values', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <RegisterForm selectedRole={Role.CLIENT} />
      </BrowserRouter>
    );

    const passwordInput = screen.getByLabelText(/^password/i);
    const confirmPasswordInput = screen.getByLabelText(/^confirm password/i);

    await user.type(passwordInput, 'Password1');
    await user.type(confirmPasswordInput, 'Password1');
    await user.tab();
    await user.click(passwordInput);

    await user.click(screen.getByRole('button', { name: /^show password$/i }));
    await user.click(screen.getByRole('button', { name: /^show confirm password$/i }));
    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(confirmPasswordInput).toHaveAttribute('type', 'text');
    expect(passwordInput).toHaveValue('Password1');
    expect(confirmPasswordInput).toHaveValue('Password1');

    await user.click(screen.getByRole('button', { name: /^hide password$/i }));
    await user.click(screen.getByRole('button', { name: /^hide confirm password$/i }));
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    expect(passwordInput).toHaveValue('Password1');
    expect(confirmPasswordInput).toHaveValue('Password1');
  });

  it('does not submit the form when toggling password visibility', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <RegisterForm selectedRole={Role.CLIENT} />
      </BrowserRouter>
    );

    await user.type(screen.getByLabelText(/^password/i), 'Password1');
    await user.click(screen.getByRole('button', { name: /^show password$/i }));
    await user.click(screen.getByRole('button', { name: /^show confirm password$/i }));

    expect(authService.register).not.toHaveBeenCalled();
  });

  it('shows and clears the terms validation error styles', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <RegisterForm selectedRole={Role.CLIENT} />
      </BrowserRouter>
    );

    const termsCheckbox = screen.getByLabelText(/i agree to the/i);
    const termsButton = screen.getByRole('button', { name: /terms of service/i });
    const privacyButton = screen.getByRole('button', { name: /privacy policy/i });

    await user.type(screen.getByLabelText(/full name/i), 'Client QA');
    await user.type(screen.getByLabelText(/email address/i), 'client@example.com');
    await user.type(screen.getByLabelText(/^password/i), 'Password1');
    await user.type(screen.getByLabelText(/^confirm password/i), 'Password1');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    const termsError = await screen.findByRole('alert');
    const checkboxFrame = termsCheckbox.parentElement;
    const termsContainer = checkboxFrame?.parentElement?.parentElement;

    expect(termsError).toHaveTextContent('Please agree to the Terms of Service and Privacy Policy.');
    expect(termsError).toHaveClass('text-red-500');
    expect(termsCheckbox).toHaveAttribute('aria-invalid', 'true');
    expect(termsButton).toHaveClass('text-primary');
    expect(privacyButton).toHaveClass('text-primary');
    expect(checkboxFrame).toHaveClass('border-red-500');
    expect(termsContainer).toHaveClass('border-red-500');

    await user.click(termsCheckbox);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(termsCheckbox).toHaveAttribute('aria-invalid', 'false');
    expect(checkboxFrame).not.toHaveClass('border-red-500');
    expect(termsContainer).not.toHaveClass('border-red-500');
  });
});
