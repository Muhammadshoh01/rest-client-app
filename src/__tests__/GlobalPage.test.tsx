import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';

vi.mock('@/utils/supabase/server', () => ({
    createClient: vi.fn(() =>
        Promise.resolve({
            auth: {
                getUser: vi.fn(() =>
                    Promise.resolve({
                        data: { user: { email: 'john@example.com' } },
                    })
                ),
            },
        })
    ),
}));

vi.mock('@/components/layout/Header', () => ({
    default: ({ username, isAuthenticated }: { username: string, isAuthenticated: boolean }) => (
        <div data-testid="header">{username}-{isAuthenticated ? 'auth' : 'guest'}</div>
    ),
}));
vi.mock('@/components/layout/MainPageContent', () => ({
    default: ({ username, isAuthenticated }: { username: string, isAuthenticated: boolean }) => (
        <div data-testid="main-content">{username}-{isAuthenticated ? 'auth' : 'guest'}</div>
    ),
}));
vi.mock('@/components/layout/Footer', () => ({
    default: () => <div data-testid="footer">Footer</div>,
}));

import HomePage from '@/app/page';

describe('HomePage', () => {
    it('renders correctly for authenticated user', async () => {
        render(await HomePage());

        expect(screen.getByTestId('header')).toHaveTextContent('john-auth');
        expect(screen.getByTestId('main-content')).toHaveTextContent('john-auth');
        expect(screen.getByTestId('footer')).toBeInTheDocument();
    });
});