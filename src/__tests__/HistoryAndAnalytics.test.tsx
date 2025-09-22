import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HistoryAndAnalytics from '../components/history/HistoryAndAnalytics';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { HistoryAPI } from '@/utils/api/history';
import type { User } from '@supabase/supabase-js';
import type { Mock } from 'vitest';

vi.mock('@/utils/api/history', () => {
    return {
        HistoryAPI: vi.fn().mockImplementation(() => ({
            getHistory: vi.fn(),
            getAnalytics: vi.fn(),
        })),
    };
});

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => key,
}));

describe('HistoryAndAnalytics', () => {
    const mockUser: User = {
        id: '123',
        email: 'test@example.com',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: '',
    };
    const mockNavigate = vi.fn();
    let mockGetHistory: ReturnType<typeof vi.fn>;
    let mockGetAnalytics: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        vi.clearAllMocks();
        mockGetHistory = vi.fn();
        mockGetAnalytics = vi.fn();
        (HistoryAPI as Mock).mockImplementation(() => ({
            getHistory: mockGetHistory,
            getAnalytics: mockGetAnalytics,
        }));
    });

    it('shows loading spinner initially', async () => {
        mockGetHistory.mockResolvedValue([]);
        mockGetAnalytics.mockResolvedValue({});

        render(<HistoryAndAnalytics user={mockUser} onNavigateToRequest={mockNavigate} />);
        expect(screen.getByTestId('spinner')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
        });
    });

    it('shows error state if API fails', async () => {
        mockGetHistory.mockRejectedValue(new Error('fail'));
        mockGetAnalytics.mockRejectedValue(new Error('fail'));

        render(<HistoryAndAnalytics user={mockUser} onNavigateToRequest={mockNavigate} />);

        await waitFor(() => {
            expect(screen.getByTestId('alert-circle-icon')).toBeInTheDocument();
            expect(screen.getByText('Failed to load history and analytics')).toBeInTheDocument();
        });
    });

    it('shows empty history message when no requests', async () => {
        mockGetHistory.mockResolvedValue([]);
        mockGetAnalytics.mockResolvedValue(null);

        render(<HistoryAndAnalytics user={mockUser} onNavigateToRequest={mockNavigate} />);

        await waitFor(() => {
            expect(screen.getByText('empty.title')).toBeInTheDocument();
            expect(screen.getByText('empty.description')).toBeInTheDocument();
        });
    });

    it('calls onNavigateToRequest when a request is clicked', async () => {
        mockGetHistory.mockResolvedValue([
            {
                id: '1',
                method: 'POST',
                url: 'https://api.test.com/post',
                headers: [],
                body: '{}',
                status: 201,
                timestamp: new Date().toISOString(),
                duration: 200,
                request_size: 100,
                response_size: 200,
            },
        ]);
        mockGetAnalytics.mockResolvedValue(null);

        render(<HistoryAndAnalytics user={mockUser} onNavigateToRequest={mockNavigate} />);

        await waitFor(() => {
            expect(screen.getByText('https://api.test.com/post')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('https://api.test.com/post'));

        expect(mockNavigate).toHaveBeenCalledWith(
            expect.objectContaining({
                method: 'POST',
                url: 'https://api.test.com/post',
            })
        );
    });
});
