import { render, screen } from '@testing-library/react';
import Footer from '@/components/layout/Footer';
import { expect, vi, it, describe } from 'vitest';
import type { AnchorHTMLAttributes, PropsWithChildren } from 'react';

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => {
        const dict: Record<string, string> = {
            createdBy: 'Created by',
            appName: 'MyApp',
            rollingSchool: 'RS School',
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

describe('Footer', () => {
    it('renders createdBy heading', () => {
        render(<Footer />);
        expect(screen.getByText(/Created by/i)).toBeInTheDocument();
    });

    it('renders all authors with GitHub links', () => {
        render(<Footer />);
        const authors = ['muhammadshoh01', 'yelantsevv', 'hitman46923'];

        authors.forEach((author) => {
            const link = screen.getByRole('link', {
                name: author,
            }) as HTMLAnchorElement;
            expect(link).toBeInTheDocument();
            expect(link.href).toContain(`github.com/${author}`);
        });
    });

    it('renders current year and appName', () => {
        render(<Footer />);
        const year = new Date().getFullYear().toString();
        expect(screen.getByText(new RegExp(`© ${year} MyApp`))).toBeInTheDocument();
    });

    it('renders RS School link', () => {
        render(<Footer />);
        const rsLink = screen.getByRole('link', { name: /RS School/i });
        expect(rsLink).toBeInTheDocument();
        expect((rsLink as HTMLAnchorElement).href).toBe('https://rs.school/');
    });
});
