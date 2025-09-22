import { describe, it, expect, vi } from 'vitest';
import { login, signup, logout } from '@/app/(auth)/login/actions';

vi.mock('next/navigation', () => ({
    redirect: vi.fn(),
}));
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}));

vi.mock('@/utils/supabase/server', () => ({
    createClient: vi.fn(),
}));

describe('auth actions', () => {
    it('login redirects to /error on failure', async () => {
        const { createClient } = await import('@/utils/supabase/server');
        const { redirect } = await import('next/navigation');

        (createClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
            auth: { signInWithPassword: vi.fn().mockResolvedValue({ error: { message: 'bad' } }) },
        });

        const formData = new FormData();
        formData.set('email', 'test@example.com');
        formData.set('password', 'secret');

        await login(formData);

        expect(redirect).toHaveBeenCalledWith('/error');
    });

    it('login redirects to / on success', async () => {
        const { createClient } = await import('@/utils/supabase/server');
        const { redirect } = await import('next/navigation');
        const { revalidatePath } = await import('next/cache');

        (createClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
            auth: { signInWithPassword: vi.fn().mockResolvedValue({ error: null }) },
        });

        const formData = new FormData();
        formData.set('email', 'test@example.com');
        formData.set('password', 'secret');

        await login(formData);

        expect(revalidatePath).toHaveBeenCalledWith('/', 'layout');
        expect(redirect).toHaveBeenCalledWith('/');
    });

    it('signup redirects to /error on failure', async () => {
        const { createClient } = await import('@/utils/supabase/server');
        const { redirect } = await import('next/navigation');

        (createClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
            auth: { signUp: vi.fn().mockResolvedValue({ error: { message: 'bad' } }) },
        });

        const formData = new FormData();
        formData.set('email', 'new@example.com');
        formData.set('password', 'secret');

        await signup(formData);

        expect(redirect).toHaveBeenCalledWith('/error');
    });

    it('signup redirects to /login on success', async () => {
        const { createClient } = await import('@/utils/supabase/server');
        const { redirect } = await import('next/navigation');
        const { revalidatePath } = await import('next/cache');

        (createClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
            auth: { signUp: vi.fn().mockResolvedValue({ error: null }) },
        });

        const formData = new FormData();
        formData.set('email', 'new@example.com');
        formData.set('password', 'secret');

        await signup(formData);

        expect(revalidatePath).toHaveBeenCalledWith('/', 'layout');
        expect(redirect).toHaveBeenCalledWith('/login');
    });

    it('logout redirects to /error on failure', async () => {
        const { createClient } = await import('@/utils/supabase/server');
        const { redirect } = await import('next/navigation');

        (createClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
            auth: { signOut: vi.fn().mockResolvedValue({ error: { message: 'bad' } }) },
        });

        await logout();

        expect(redirect).toHaveBeenCalledWith('/error');
    });

    it('logout redirects to /login on success', async () => {
        const { createClient } = await import('@/utils/supabase/server');
        const { redirect } = await import('next/navigation');
        const { revalidatePath } = await import('next/cache');

        (createClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
            auth: { signOut: vi.fn().mockResolvedValue({ error: null }) },
        });

        await logout();

        expect(revalidatePath).toHaveBeenCalledWith('/', 'layout');
        expect(redirect).toHaveBeenCalledWith('/login');
    });
});

