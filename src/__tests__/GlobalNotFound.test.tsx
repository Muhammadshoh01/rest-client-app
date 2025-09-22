import { render, screen, fireEvent } from '@testing-library/react';
import NotFound from '@/app/not-found';
import { NextIntlClientProvider } from 'next-intl';
import { vi, describe, it, expect } from 'vitest'

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => {
        const messages: Record<string, string> = {
            'NotFound.title': 'Page Not Found',
            'NotFound.subtitle': 'This page does not exist',
            'NotFound.description': 'The page you are looking for might have been removed.',
            'NotFound.go_home': 'Go Home',
            'NotFound.go_back': 'Go Back',
            'NotFound.quick_links': 'Quick Links',
            'NotFound.login': 'Login',
            'NotFound.signup': 'Signup',
        };
        return messages[key] ?? key;
    },
    NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe('NotFound page', () => {
    it('renders all translations', () => {
        render(<NotFound />);

        expect(screen.getByText('Page Not Found')).toBeInTheDocument();
        expect(screen.getByText('This page does not exist')).toBeInTheDocument();
        expect(screen.getByText('The page you are looking for might have been removed.')).toBeInTheDocument();
        expect(screen.getByText('Go Home')).toBeInTheDocument();
        expect(screen.getByText('Go Back')).toBeInTheDocument();
        expect(screen.getByText('Quick Links')).toBeInTheDocument();
        expect(screen.getByText('Login')).toBeInTheDocument();
        expect(screen.getByText('Signup')).toBeInTheDocument();
    });

    it('calls window.history.back when clicking "Go Back"', () => {
        const backSpy = vi.spyOn(window.history, 'back').mockImplementation(() => { });
        render(<NotFound />);
        fireEvent.click(screen.getByText('Go Back'));
        expect(backSpy).toHaveBeenCalled();
    });

    it('has correct link hrefs', () => {
        render(<NotFound />);
        expect(screen.getByRole('link', { name: 'Go Home' })).toHaveAttribute('href', '/');
        expect(screen.getByRole('link', { name: 'Login' })).toHaveAttribute('href', '/login');
        expect(screen.getByRole('link', { name: 'Signup' })).toHaveAttribute('href', '/signup');
    });
});