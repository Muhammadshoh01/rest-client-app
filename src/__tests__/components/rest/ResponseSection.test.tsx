import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import ResponseSection from '@/components/RestClient/ResponseSection';
import * as functions from '@/utils/functions';
import type { Mock } from 'vitest';

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string, values?: Record<string, string>) => {
        if (key === 'time') return `Time: ${values?.time}ms`;
        if (key === 'responseSize') return `Size: ${values?.size}`;
        return key;
    },
}));

vi.mock('@/utils/functions', () => ({
    prettifyJson: vi.fn(),
    copyToClipboard: vi.fn(),
}));

describe('ResponseSection', () => {
    const baseResponse = {
        status: 200,
        statusText: 'OK',
        time: 123,
        headers: { 'Content-Type': 'application/json' },
        body: '{"foo":"bar"}',
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (functions.prettifyJson as Mock).mockReturnValue('prettified body');
    });

    it('renders title and status text', () => {
        render(<ResponseSection response={baseResponse} />);
        expect(screen.getByText('title')).toBeInTheDocument();
        expect(screen.getByText('200 OK')).toBeInTheDocument();
    });

    it('renders time', () => {
        render(<ResponseSection response={baseResponse} />);
        expect(screen.getByText(/Time: 123ms/)).toBeInTheDocument();
    });

    it('renders headers if present', () => {
        render(<ResponseSection response={baseResponse} />);
        expect(screen.getByText(/Content-Type:/)).toBeInTheDocument();
        expect(screen.getByText(/application\/json/)).toBeInTheDocument();
    });

    it('renders "noHeaders" if none', () => {
        render(<ResponseSection response={{ ...baseResponse, headers: {} }} />);
        expect(screen.getByText('noHeaders')).toBeInTheDocument();
    });

    it('renders prettified body if present', () => {
        render(<ResponseSection response={baseResponse} />);
        expect(functions.prettifyJson).toHaveBeenCalledWith(baseResponse.body);
        expect(screen.getByText('prettified body')).toBeInTheDocument();
    });

    it('renders "noBody" if body is empty', () => {
        render(<ResponseSection response={{ ...baseResponse, body: '' }} />);
        expect(screen.getByText('noBody')).toBeInTheDocument();
    });

    it('shows copy button when body exists and calls copyToClipboard', () => {
        render(<ResponseSection response={baseResponse} />);
        fireEvent.click(screen.getByRole('button', { name: 'copy' }));
        expect(functions.copyToClipboard).toHaveBeenCalledWith(baseResponse.body);
    });

    it('shows response size when body exists', () => {
        render(<ResponseSection response={baseResponse} />);
        expect(screen.getByText(/Size:/)).toBeInTheDocument();
    });

    it('renders correct style for error status (>=400)', () => {
        render(<ResponseSection response={{ ...baseResponse, status: 404, statusText: 'Not Found' }} />);
        expect(screen.getByText(/404 Not Found/)).toHaveClass('bg-red-100');
    });

    it('renders correct style for status=0', () => {
        render(<ResponseSection response={{ ...baseResponse, status: 0, statusText: '' }} />);
        expect(screen.getByText('error')).toHaveClass('bg-gray-100');
    });

    it('renders correct style for warning status (other)', () => {
        render(<ResponseSection response={{ ...baseResponse, status: 302, statusText: 'Found' }} />);
        expect(screen.getByText(/302 Found/)).toHaveClass('bg-yellow-100');
    });
});
