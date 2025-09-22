import { vi, describe, it, expect, beforeEach } from 'vitest';
import PrivateLayout from '@/app/(private)/layout';

vi.mock('next/navigation', () => {
    return {
        redirect: vi.fn(),
        useRouter: () => ({
            push: vi.fn(),
            replace: vi.fn(),
            refresh: vi.fn(),
            prefetch: vi.fn(),
        }),
        usePathname: () => '/test',
        useSearchParams: () => new URLSearchParams(),
    };
});

const mockGetUser = vi.fn();
vi.mock('@/utils/supabase/server', () => {
    return {
        createClient: () => ({
            auth: { getUser: mockGetUser },
        }),
    };
});

describe('PrivateLayout', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('redirects to /login if no user', async () => {
        const { redirect } = await import('next/navigation');
        mockGetUser.mockResolvedValueOnce({ data: { user: null } });

        await PrivateLayout({ children: <div>Protected Content</div> });

        expect(redirect).toHaveBeenCalledWith('/login');
    });
});
