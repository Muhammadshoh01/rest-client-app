import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { POST, GET } from '@/app/api/history/route';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

const jsonMock = vi.fn();
vi.mock('next/server', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next/server')>();
  return {
    ...actual,
    NextResponse: {
      ...actual.NextResponse,
      json: (...args: []) => jsonMock(...args),
    },
  };
});

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(),
}));

const mockedCreateClient = createClient as unknown as Mock;

describe('request-history API', () => {
  beforeEach(() => {
    jsonMock.mockReset();
  });

  describe('POST', () => {
    it('returns 401 if not authenticated', async () => {
      const { createClient } = await import('@/utils/supabase/server');
      mockedCreateClient.mockResolvedValue({
        auth: {
          getUser: vi
            .fn()
            .mockResolvedValue({ data: { user: null }, error: null }),
        },
      });

      const req = {
        json: vi.fn(),
      } as unknown as NextRequest;

      await POST(req);

      expect(jsonMock).toHaveBeenCalledWith(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    });

    it('inserts request and returns success', async () => {
      const { createClient } = await import('@/utils/supabase/server');
      const mockInsert = vi.fn().mockResolvedValue({ error: null });

      mockedCreateClient.mockResolvedValue({
        auth: {
          getUser: vi
            .fn()
            .mockResolvedValue({ data: { user: { id: 'u1' } }, error: null }),
        },
        from: vi.fn().mockReturnValue({
          insert: mockInsert,
        }),
      });

      const reqData = {
        method: 'GET',
        url: 'https://api.com',
        endpoint: '/endpoint',
        status: 200,
        duration: 123,
        requestSize: 10,
        responseSize: 20,
        errorDetails: null,
        headers: [],
        body: '{}',
        timestamp: Date.now(),
      };

      const req = {
        json: vi.fn().mockResolvedValue(reqData),
      } as unknown as NextRequest;

      await POST(req);

      expect(mockInsert).toHaveBeenCalledWith([
        expect.objectContaining({
          user_id: 'u1',
          method: 'GET',
          url: 'https://api.com',
        }),
      ]);
      expect(jsonMock).toHaveBeenCalledWith({ success: true });
    });

    it('returns 500 if insert fails', async () => {
      const { createClient } = await import('@/utils/supabase/server');
      const mockInsert = vi
        .fn()
        .mockResolvedValue({ error: { message: 'db fail' } });

      mockedCreateClient.mockResolvedValue({
        auth: {
          getUser: vi
            .fn()
            .mockResolvedValue({ data: { user: { id: 'u1' } }, error: null }),
        },
        from: vi.fn().mockReturnValue({ insert: mockInsert }),
      });

      const req = {
        json: vi.fn().mockResolvedValue({ method: 'POST' }),
      } as unknown as NextRequest;

      await POST(req);

      expect(jsonMock).toHaveBeenCalledWith(
        { error: 'Failed to save request' },
        { status: 500 }
      );
    });
  });

  describe('GET', () => {
    it('returns 401 if not authenticated', async () => {
      const { createClient } = await import('@/utils/supabase/server');
      mockedCreateClient.mockResolvedValue({
        auth: {
          getUser: vi
            .fn()
            .mockResolvedValue({ data: { user: null }, error: null }),
        },
      });

      await GET();

      expect(jsonMock).toHaveBeenCalledWith(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    });

    it('returns history data', async () => {
      const { createClient } = await import('@/utils/supabase/server');
      const history = [{ id: 1, method: 'GET' }];

      mockedCreateClient.mockResolvedValue({
        auth: {
          getUser: vi
            .fn()
            .mockResolvedValue({ data: { user: { id: 'u1' } }, error: null }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue({ data: history, error: null }),
        }),
      });

      await GET();

      expect(jsonMock).toHaveBeenCalledWith({ history });
    });

    it('returns 500 if select fails', async () => {
      const { createClient } = await import('@/utils/supabase/server');
      mockedCreateClient.mockResolvedValue({
        auth: {
          getUser: vi
            .fn()
            .mockResolvedValue({ data: { user: { id: 'u1' } }, error: null }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          limit: vi
            .fn()
            .mockResolvedValue({ data: null, error: { message: 'db fail' } }),
        }),
      });

      await GET();

      expect(jsonMock).toHaveBeenCalledWith(
        { error: 'Failed to fetch history' },
        { status: 500 }
      );
    });
  });
});
