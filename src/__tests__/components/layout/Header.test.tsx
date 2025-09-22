
import { render, screen, fireEvent } from '@testing-library/react';
import Header from '@/components/layout/Header';
import LocaleSwitcher from '@/components/LocaleSwitcher';
import { vi, describe, it, expect } from 'vitest';


vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => key,
    useLocale: () => 'en',
}));


const refreshMock = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({ refresh: refreshMock }),
}));

vi.mock('@/app/(auth)/login/actions', () => ({
    logout: vi.fn(),
}));

describe('Header', () => {
    it('renders sign in/up buttons when not authenticated', () => {
        render(<Header isAuthenticated={false} />);
        expect(screen.getByText('signIn')).toBeInTheDocument();
        expect(screen.getByText('signUp')).toBeInTheDocument();
    });

    it('renders username and sign out when authenticated', () => {
        render(<Header isAuthenticated={true} username="John" />);
        expect(screen.getByText('John')).toBeInTheDocument();
        expect(screen.getByText('signOut')).toBeInTheDocument();
    });

    it('applies sticky style when scrolling', () => {
        render(<Header isAuthenticated={false} />);
        const header = screen.getByRole('banner');

        expect(header.className).toContain('h-16');

        fireEvent.scroll(window, { target: { scrollY: 100 } });
        window.dispatchEvent(new Event('scroll'));

        expect(header.className).toContain('h-14');
    });
});

describe('LocaleSwitcher', () => {
    it('shows EN as current locale', () => {
        render(<LocaleSwitcher />);
        expect(screen.getByText('EN')).toBeInTheDocument();
    });

    it('switches locale on click and calls router.refresh', () => {
        render(<LocaleSwitcher />);
        const button = screen.getByRole('button', { name: 'EN' });

        fireEvent.click(button);

        expect(document.cookie).toContain('locale=ru');
        expect(refreshMock).toHaveBeenCalled();
    });
});
