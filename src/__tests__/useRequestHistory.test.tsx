import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useRequestHistory } from '../utils/hooks/useRequestHistory';
import { HistoryAPI } from '../utils/api/history';
import { User } from '@supabase/supabase-js';

const mockSaveRequest = vi.fn();

vi.mock('../utils/api/history', () => {
    return {
        HistoryAPI: vi.fn().mockImplementation(() => ({
            saveRequest: mockSaveRequest,
        })),
    };
});

describe('useRequestHistory', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const fakeRequest = {
        method: 'GET',
        url: 'https://example.com/api',
        headers: [{ key: 'Accept', value: 'application/json', enabled: true }],
        body: '',
        status: 200,
        duration: 123,
        requestSize: 50,
        responseSize: 150,
    };

    it('should handle errors gracefully', async () => {
        mockSaveRequest.mockRejectedValueOnce(new Error('Network error'));
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        const fakeUser: User = {
            id: '123',
            email: 'test@example.com',
            app_metadata: {},
            user_metadata: {},
            aud: 'authenticated',
            created_at: new Date().toISOString(),
            role: 'authenticated',
        };
        const { result } = renderHook(() => useRequestHistory(fakeUser));

        await act(async () => {
            await result.current.saveRequestToHistory(fakeRequest);
        });

        expect(consoleSpy).toHaveBeenCalledWith(
            'Failed to save request to history:',
            expect.any(Error)
        );
        expect(result.current.isSaving).toBe(false);

        consoleSpy.mockRestore();
    });
});
