import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, beforeEach, expect } from 'vitest';

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => {
        const messages: Record<string, string> = {
            'Signup.title': 'Sign Up',
            'Signup.subtitle': 'Create an account',
            'Signup.email_label': 'Email',
            'Signup.email_placeholder': 'Enter your email',
            'Signup.password_label': 'Password',
            'Signup.password_placeholder': 'Enter your password',
            'Signup.password_hint': '8+ chars, letters, numbers, symbols',
            'Signup.password_error': 'Password is invalid',
            'Signup.submit': 'Sign Up',
            'Signup.submit_creating': 'Creating...',
            'Signup.error_generic': 'An error occurred',
            'Signup.already_have': 'Already have an account?',
            'Signup.signin_link': 'Sign in',
        };
        return messages[key] ?? key;
    },
}));

const mockSignup = vi.fn();
vi.mock('../login/actions', () => ({
    signup: (formData: FormData) => mockSignup(formData),
}));

import SignupForm from '@/app/(auth)/signup/page';

describe('SignupForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders all fields and button', () => {
        render(<SignupForm />);
        expect(screen.getByRole('heading')).toBeInTheDocument();
        expect(screen.getByText('Create an account')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument();
        expect(screen.getByText('Already have an account?')).toBeInTheDocument();
        expect(screen.getByText('Sign in')).toBeInTheDocument();
    });

    it('shows password error for invalid password', async () => {
        render(<SignupForm />);
        const form = screen.getByTestId('signup-form');
        const passwordInput = screen.getByLabelText('Password');

        fireEvent.change(passwordInput, { target: { value: 'short' } });
        fireEvent.submit(form);

        await waitFor(() => {
            expect(screen.getByText('Password is invalid')).toBeInTheDocument();
            expect(mockSignup).not.toHaveBeenCalled();
        });
    });

});
