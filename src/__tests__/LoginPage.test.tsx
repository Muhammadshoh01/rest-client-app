import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, it, expect, describe, beforeEach } from 'vitest';

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => {
        const messages: Record<string, string> = {
            title: 'Login Title',
            subtitle: 'Please sign in',
            email: 'Email',
            email_placeholder: 'Enter your email',
            password: 'Password',
            password_placeholder: 'Enter your password',
            submit: 'Sign In',
            submit_loading: 'Signing In...',
            error: 'An error occurred',
            no_account: "Don't have an account?",
            signup: 'Sign Up',
        };
        return messages[key] ?? key;
    },
}));

const mockLogin = vi.fn();
vi.mock('@/app/(auth)/login/actions', () => ({
    login: (formData: FormData) => mockLogin(formData),
}));

import LoginForm from '@/app/(auth)/login/page';

describe('LoginForm', () => {
    beforeEach(() => {
        mockLogin.mockReset();
    });

    it('renders inputs, button and texts', () => {
        render(<LoginForm />);

        expect(screen.getByText('Login Title')).toBeInTheDocument();
        expect(screen.getByText('Please sign in')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
        expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
        expect(screen.getByText('Sign Up')).toBeInTheDocument();
    });

    it('calls login action on submit', async () => {
        render(<LoginForm />);
        const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
        const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
        const submitBtn = screen.getByRole('button', { name: 'Sign In' });

        fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        fireEvent.submit(submitBtn.closest('form')!);

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalled();
        });
    });
});
