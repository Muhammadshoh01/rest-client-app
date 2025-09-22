import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import HistoryPageClient from '@/app/(private)/history/HistoryPageClient';
import type { User } from '@supabase/supabase-js';
type HistoryAndAnalyticsProps = {
    user: User;
    onNavigateToRequest: (request: {
        method: string;
        url: string;
        body?: string;
        headers?: { enabled: boolean; key: string; value: string }[];
    }) => void;
};
const mockReplace = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({ replace: mockReplace }),
}));
const mockOnNavigateToRequest = vi.fn();
vi.mock('@/components/history/HistoryAndAnalytics', () => ({
    default: ({ user, onNavigateToRequest }: HistoryAndAnalyticsProps) => (
        <div>
            Mocked HistoryAndAnalytics for {user.email}
            <button onClick={() => onNavigateToRequest({
                method: 'POST',
                url: 'https://api.example.com',
                body: '{"foo":"bar"}',
                headers: [
                    { enabled: true, key: 'Authorization', value: 'Bearer token' },
                    { enabled: false, key: 'X-Ignored', value: 'nope' },
                ],
            })}>
                Trigger Navigate
            </button>
        </div>
    ),
}));

describe('HistoryPageClient', () => {
    it('renders HistoryAndAnalytics with user email', () => {
        const fakeUser = { email: 'test@example.com' } as User;

        render(<HistoryPageClient user={fakeUser} />);

        expect(
            screen.getByText(/Mocked HistoryAndAnalytics for test@example.com/)
        ).toBeInTheDocument();
    });

    it('calls router.replace with correct encoded URL and query params', () => {
        const fakeUser = { email: 'test@example.com' } as User;

        render(<HistoryPageClient user={fakeUser} />);

        screen.getByText('Trigger Navigate').click();

        const encodedUrl = Buffer.from('https://api.example.com').toString('base64');
        const encodedBody = Buffer.from('{"foo":"bar"}').toString('base64');

        const expectedUrl =
            `/rest-client/POST/${encodedUrl}/${encodedBody}?Authorization=Bearer+token`;

        expect(mockReplace).toHaveBeenCalledWith(expectedUrl);
    });
});
