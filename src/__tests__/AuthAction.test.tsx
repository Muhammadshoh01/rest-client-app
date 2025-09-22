import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AuthLayout from '@/app/(auth)/layout';

vi.mock('@/components/layout/Header', () => ({
    default: ({ isAuthenticated }: { isAuthenticated: boolean }) => (
        <div>Mocked Header - Authenticated: {String(isAuthenticated)}</div>
    ),
}));

vi.mock('@/components/layout/Footer', () => ({
    default: () => <div>Mocked Footer</div>,
}));

describe('AuthLayout', () => {
    it('renders Header, children, and Footer', () => {
        render(
            <AuthLayout>
                <div>Test Child</div>
            </AuthLayout>
        );

        expect(
            screen.getByText(/Mocked Header - Authenticated: false/)
        ).toBeInTheDocument();

        expect(screen.getByText(/Test Child/)).toBeInTheDocument();

        expect(screen.getByText(/Mocked Footer/)).toBeInTheDocument();
    });
});
