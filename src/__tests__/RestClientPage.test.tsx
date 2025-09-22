
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RestClientPage, { generateMetadata } from '@/app/(private)/rest-client/[[...params]]/page';
import { User } from '@supabase/supabase-js';

vi.mock('next/navigation', () => ({
    redirect: vi.fn(),
}));

vi.mock('@/utils/supabase/server', () => ({
    createClient: vi.fn(),
}));

vi.mock('@/components/RestClient/RestClientWrapper', () => ({
    default: (user: User) => <div>Mocked RestClientWrapper for {user?.email}</div>,
}));

describe('RestClientPage', () => {
    it('redirects to login if no user', async () => {
        const { createClient } = await import('@/utils/supabase/server');
        const { redirect } = await import('next/navigation');

        (createClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
            auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
        });

        await RestClientPage();

        expect(redirect).toHaveBeenCalledWith('/login');
    });

    it('renders RestClientWrapper if user exists', async () => {
        const { createClient } = await import('@/utils/supabase/server');

        (createClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
            auth: {
                getUser: vi.fn().mockResolvedValue({
                    data: { user: { email: 'test@example.com' } },
                }),
            },
        });

        const result = await RestClientPage();

        const { getByText } = render(result);
        expect(getByText(/Mocked RestClientWrapper for/)).toBeInTheDocument();
    });
});

describe('generateMetadata', () => {
    it('returns REST as default title if no params', async () => {
        const metadata = await generateMetadata({ params: Promise.resolve({}) });
        expect(metadata.title).toBe('REST Request - REST Client');
    });

    it('returns custom method in title if param exists', async () => {
        const metadata = await generateMetadata({
            params: Promise.resolve({ params: ['get'] }),
        });
        expect(metadata.title).toBe('GET Request - REST Client');
    });
});
