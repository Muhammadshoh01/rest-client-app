import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import HistoryPage from '@/app/(private)/history/page';
import { User } from '@supabase/supabase-js';
import type { ReactElement } from 'react';

vi.mock('next/navigation', async (importOriginal) => {
    const actual = await importOriginal<typeof import('next/navigation')>();
    return {
        ...actual,
        redirect: vi.fn(),
        useRouter: vi.fn(() => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() })),
    };
});

vi.mock('@/utils/supabase/server', () => ({
    createClient: vi.fn(),
}));

vi.mock('@/app/(private)/history/HistoryPageClient', () => ({
    default: (user: User) => <div>Mocked HistoryPageClient for {user?.email}</div>,
}));

describe('HistoryPage', () => {
    it('renders HistoryPageClient if user exists', async () => {
        const { createClient } = await import('@/utils/supabase/server');

        (createClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
            auth: {
                getUser: vi.fn().mockResolvedValue({
                    data: { user: { email: 'test@example.com' } },
                    error: null,
                }),
            },
        });

        const ui: ReactElement = await HistoryPage();
        render(ui);

        expect(
            screen.getByText(/Mocked HistoryPageClient/)
        ).toBeInTheDocument();
    });
});
