import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { User } from '@supabase/supabase-js';
import type { ComponentType, ReactElement } from 'react';

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => key,
}));
const mockUser: User = {
    id: '123',
    email: 'test@example.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: '',
};

vi.mock('@/components/RestClient/ResClient', () => ({
    default: ({ user }: { user: User }) => (
        <div data-testid="rest-client">RestClient: {user?.email}</div>
    ),
}));

describe('RestClientWrapper', () => {
    beforeEach(() => {
        vi.resetModules();
    });

    it('renders loading state when RestClient is loading', async () => {
        vi.doMock('next/dynamic', () => ({
            __esModule: true,
            default: <T = unknown>(
                _importFn: () => Promise<{ default: ComponentType<T> }>,
                opts?: { ssr?: boolean; loading?: () => ReactElement }
            ): ComponentType<T> =>
                () => opts?.loading ? opts.loading() : null,
        }));

        const { default: RestClientWrapper } = await import(
            '@/components/RestClient/RestClientWrapper'
        );

        render(<RestClientWrapper user={mockUser} />);

        expect(screen.getByText('loading')).toBeInTheDocument();
        expect(screen.getByRole('status')).toBeInTheDocument();
    });
});
