import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/history/analytics/route';
import { createClient } from '@/utils/supabase/server';

type FakeSupabaseClient = {
    auth: {
        getUser: () => Promise<{ data: { user: null }; error: null }>;
    };
};

const jsonMock = vi.fn();
vi.mock('next/server', async (importOriginal) => {
    const actual = await importOriginal<typeof import('next/server')>();
    return {
        ...actual,
        NextResponse: {
            ...actual.NextResponse,
            json: (body: unknown, init?: ResponseInit) => jsonMock(body, init),
        },
    };
});

vi.mock('@/utils/supabase/server', () => ({
    createClient: vi.fn(),
}));

describe('analytics API GET', () => {
    beforeEach(() => {
        jsonMock.mockReset();
    });

    it('returns 401 if unauthorized', async () => {
        const { createClient } = await import('@/utils/supabase/server');
        (createClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
            auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }) },
        });

        await GET();

        expect(jsonMock).toHaveBeenCalledWith({ error: 'Unauthorized' }, { status: 401 });
    });

    it('returns 500 if DB error', async () => {
        const { createClient } = await import('@/utils/supabase/server');
        (createClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
            auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } }, error: null }) },
            from: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockResolvedValue({ data: null, error: { message: 'db fail' } }),
            }),
        });

        await GET();

        expect(jsonMock).toHaveBeenCalledWith(
            { error: 'Failed to fetch analytics' },
            { status: 500 }
        );
    });

    it('returns analytics data when history exists', async () => {
        const { createClient } = await import('@/utils/supabase/server');

        const history = [
            { method: 'GET', status: 200, duration: 100, endpoint: '/users' },
            { method: 'POST', status: 500, duration: 200, endpoint: '/users' },
            { method: 'GET', status: 201, duration: 50, endpoint: '/posts' },
        ];

        (createClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
            auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } }, error: null }) },
            from: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockResolvedValue({ data: history, error: null }),
            }),
        });

        await GET();

        const call = jsonMock.mock.calls[0][0];
        expect(call.analytics.totalRequests).toBe(3);
        expect(call.analytics.errorCount).toBe(1);
        expect(call.analytics.mostUsedMethods).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ method: 'GET' }),
                expect.objectContaining({ method: 'POST' }),
            ])
        );
        expect(call.analytics.mostUsedEndpoints).toEqual(
            expect.arrayContaining([expect.objectContaining({ endpoint: '/users' })])
        );
        expect(call.analytics.statusCodeDistribution).toEqual(
            expect.arrayContaining([expect.objectContaining({ status: 200 })])
        );
    });

    it('returns 500 if unexpected error is thrown', async () => {
        const { createClient } = await import('@/utils/supabase/server');
        (createClient as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => {
            throw new Error('boom');
        });

        await GET();

        expect(jsonMock).toHaveBeenCalledWith(
            { error: 'Internal server error' },
            { status: 500 }
        );
    });
});
