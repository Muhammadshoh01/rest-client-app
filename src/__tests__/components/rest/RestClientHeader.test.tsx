import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RestClientHeader from '@/components/RestClient/RestClientHeader';
import type { User } from '@supabase/supabase-js';


vi.mock('next-intl', () => ({
    useTranslations: () => (key: string, values?: Record<string, string>) => {
        if (key === 'welcome') return `Welcome ${values?.email}`;
        return key;
    },
}));


vi.mock('@/app/(auth)/login/actions', () => ({
    logout: vi.fn(),
}));

describe('RestClientHeader', () => {
    const mockUser: User = {
        id: '123',
        email: 'test@example.com',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: '',
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders title', () => {
        render(<RestClientHeader user={mockUser} currentMethod="GET" />);
        expect(screen.getByText('title')).toBeInTheDocument();
    });

    it('renders current method', () => {
        render(<RestClientHeader user={mockUser} currentMethod="POST" />);
        expect(screen.getByText('POST')).toBeInTheDocument();
    });

    it('displays the user email in welcome text', () => {
        render(<RestClientHeader user={mockUser} currentMethod="GET" />);
        expect(screen.getByText(/Welcome test@example.com/)).toBeInTheDocument();
    });

    it('renders the sign out button', () => {
        render(<RestClientHeader user={mockUser} currentMethod="GET" />);
        expect(screen.getByRole('button', { name: 'signOut' })).toBeInTheDocument();
    });
});
