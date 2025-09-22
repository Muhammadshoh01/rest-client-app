import { render, screen } from '@testing-library/react';
import MainPageContent from '@/components/layout/MainPageContent';
import { expect, vi, it, describe } from 'vitest';
import type { AnchorHTMLAttributes, PropsWithChildren } from 'react';


vi.mock('next-intl', () => ({
    useTranslations: () => (
        key: string,
        values?: Record<string, string | number | boolean>
    ) => {
        const dict: Record<string, string> = {
            welcome: 'Welcome',
            signIn: 'Sign In',
            signUp: 'Sign Up',
            welcomeBack: `Welcome back, ${values?.username ?? 'User'}`,
            accessDescription: 'Choose a tool below to continue.',
            restClient: 'REST Client',
            restClientDescription: 'Test your APIs easily.',
            history: 'History',
            historyDescription: 'View your past requests.',
            variables: 'Variables',
            variablesDescription: 'Manage your environment variables.',
        };
        return dict[key] ?? key;
    },
}));


vi.mock('next/link', () => ({
    default: ({ href, children, ...rest }: PropsWithChildren<AnchorHTMLAttributes<HTMLAnchorElement>>) => (
        <a href={href} {...rest}>
            {children}
        </a>
    ),
}));

describe('MainPageContent', () => {
    it('renders unauthenticated state with login/signup buttons', () => {
        render(<MainPageContent isAuthenticated={false} />);

        expect(screen.getByText(/Welcome/i)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Sign In/i })).toHaveAttribute(
            'href',
            '/login'
        );
        expect(screen.getByRole('link', { name: /Sign Up/i })).toHaveAttribute(
            'href',
            '/signup'
        );
    });

    it('renders authenticated state with username and feature cards', () => {
        render(<MainPageContent isAuthenticated={true} username="Alice" />);

        expect(screen.getByText(/Welcome back, Alice/i)).toBeInTheDocument();
        expect(
            screen.getByText(/Choose a tool below to continue./i)
        ).toBeInTheDocument();

        expect(
            screen.getByRole('link', { name: /REST Client/i })
        ).toHaveAttribute('href', '/rest-client');
        expect(screen.getByText(/Test your APIs easily./i)).toBeInTheDocument();

        expect(
            screen.getByRole('link', { name: /History/i })
        ).toHaveAttribute('href', '/history');
        expect(screen.getByText(/View your past requests./i)).toBeInTheDocument();

        expect(
            screen.getByRole('link', { name: /Variables/i })
        ).toHaveAttribute('href', '/variables');
        expect(
            screen.getByText(/Manage your environment variables./i)
        ).toBeInTheDocument();
    });

    it('falls back to "User" if username is missing', () => {
        render(<MainPageContent isAuthenticated={true} />);

        expect(screen.getByText(/Welcome back, User/i)).toBeInTheDocument();
    });
});
