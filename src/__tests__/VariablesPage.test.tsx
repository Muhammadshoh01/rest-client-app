
import { render } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import Variables from '@/app/(private)/variables/page';
import { User } from '@supabase/supabase-js';

vi.mock('next/navigation', () => ({
    redirect: vi.fn(),
}));

vi.mock('@/utils/supabase/server', () => ({
    createClient: vi.fn(),
}));

vi.mock('@/components/variable/VariablePage', () => ({
    default: (user: User) => <div>Mocked VariablePage with {user?.email}</div>,
}));

describe('Variables page', () => {
    it('redirects to login if no user', async () => {
        const { createClient } = await import('@/utils/supabase/server');
        const { redirect } = await import('next/navigation');

        (createClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
            auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
        });

        await Variables();

        expect(redirect).toHaveBeenCalledWith('/login');
    });

    it('renders VariablesPage if user exists', async () => {
        const { createClient } = await import('@/utils/supabase/server');

        (createClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
            auth: {
                getUser: vi.fn().mockResolvedValue({
                    data: { user: { email: 'test@example.com' } },
                }),
            },
        });

        const result = await Variables();

        const { getByText } = render(result);
        expect(getByText(/Mocked VariablePage with/)).toBeInTheDocument();
    });
});
