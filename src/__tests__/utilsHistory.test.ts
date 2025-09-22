import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HistoryAPI } from '@/utils/api/history';
import type { RequestHistoryRecord, AnalyticsData } from '@/types/history';

interface MockResponse {
  ok: boolean;
  statusText?: string;
  json?: () => Promise<unknown>;
}

interface MockFetchCall {
  body: string;
}

interface HistoryAPIWithPrivateMethods {
  extractEndpoint(url: string): string;
}

describe('HistoryAPI', () => {
  let api: HistoryAPI;

  beforeEach(() => {
    api = new HistoryAPI('/api');
    vi.restoreAllMocks();
  });

  describe('saveRequest', () => {
    it('should POST request data with endpoint and timestamp', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
      } as MockResponse);
      global.fetch = mockFetch as typeof fetch;

      const requestData = {
        method: 'GET',
        url: 'https://example.com/users/123',
        headers: [{ key: 'Accept', value: 'application/json', enabled: true }],
        body: '',
        status: 200,
        duration: 50,
        requestSize: 100,
        responseSize: 500,
      };

      await api.saveRequest(requestData);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/history',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const body = JSON.parse(
        (mockFetch.mock.calls[0][1] as RequestInit & MockFetchCall).body
      );
      expect(body.endpoint).toBe('/users/{id}');
      expect(body.timestamp).toBeDefined();
    });

    it('should handle fetch failure gracefully', async () => {
      const networkError = new Error('Network error');
      global.fetch = vi.fn().mockRejectedValue(networkError) as typeof fetch;

      await expect(
        api.saveRequest({
          method: 'GET',
          url: 'https://example.com/users/1',
          headers: [],
          body: '',
          status: 500,
          duration: 10,
          requestSize: 0,
          responseSize: 0,
        })
      ).resolves.not.toThrow();

      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('getHistory', () => {
    it('should return parsed history records', async () => {
      const fakeHistory: RequestHistoryRecord[] = [
        {
          id: '1',
          user_id: 'u1',
          timestamp: '2025-09-22T10:00:00Z',
          method: 'GET',
          url: 'https://example.com/users/1',
          endpoint: '/users/{id}',
          status: 200,
          duration: 30,
          request_size: 100,
          response_size: 200,
          headers: [],
          body: '',
          created_at: '2025-09-22T10:00:00Z',
          updated_at: '2025-09-22T10:00:00Z',
        },
      ];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ history: fakeHistory }),
      } as MockResponse) as typeof fetch;

      const result = await api.getHistory();
      expect(result).toEqual(fakeHistory);
    });

    it('should throw on fetch error', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        statusText: 'Internal Server Error',
      } as MockResponse) as typeof fetch;

      await expect(api.getHistory()).rejects.toThrow('Failed to fetch history');
    });
  });

  describe('getAnalytics', () => {
    it('should return analytics data', async () => {
      const fakeAnalytics: AnalyticsData = {
        totalRequests: 10,
        averageResponseTime: 50,
        successRate: 0.9,
        errorCount: 1,
        mostUsedMethods: [{ method: 'GET', count: 5 }],
        mostUsedEndpoints: [{ endpoint: '/users/{id}', count: 5 }],
        statusCodeDistribution: [{ status: 200, count: 8 }],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ analytics: fakeAnalytics }),
      } as MockResponse) as typeof fetch;

      const result = await api.getAnalytics();
      expect(result).toEqual(fakeAnalytics);
    });

    it('should throw on fetch error', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        statusText: 'Not Found',
      } as MockResponse) as typeof fetch;

      await expect(api.getAnalytics()).rejects.toThrow(
        'Failed to fetch analytics'
      );
    });
  });

  describe('extractEndpoint', () => {
    it('should normalize numeric IDs to {id}', () => {
      const result = (
        api as unknown as HistoryAPIWithPrivateMethods
      ).extractEndpoint('https://example.com/users/123');
      expect(result).toBe('/users/{id}');
    });

    it('should return original URL if parsing fails', () => {
      const result = (
        api as unknown as HistoryAPIWithPrivateMethods
      ).extractEndpoint('not-a-valid-url');
      expect(result).toBe('not-a-valid-url');
    });
  });
});
