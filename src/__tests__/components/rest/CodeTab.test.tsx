import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import CodeTab from '@/components/RestClient/CodeTab';
import * as functions from '@/utils/functions';
import { RequestData } from '@/types/rest-client';

vi.mock('@/utils/functions', () => ({
    generateCode: vi.fn(() => 'mocked generated code'),
    copyToClipboard: vi.fn(),
}));

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => key,
}));

const request: RequestData = {
    method: 'GET',
    url: 'https://api.example.com',
    headers: [{ key: 'Authorization', value: 'Bearer token', id: 'test', enabled: true }],
    body: '',
};

describe('CodeTab', () => {
    const onLanguageChange = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders generated code', () => {
        render(
            <CodeTab
                request={request}
                selectedLanguage="fetch"
                onLanguageChange={onLanguageChange}
            />
        );

        expect(screen.getByText('generatedCode')).toBeInTheDocument();
        expect(functions.generateCode).toHaveBeenCalledWith(request, 'fetch');
        expect(screen.getByText('mocked generated code')).toBeInTheDocument();
    });

    it('calls onLanguageChange when language is switched', () => {
        render(
            <CodeTab
                request={request}
                selectedLanguage="fetch"
                onLanguageChange={onLanguageChange}
            />
        );

        const select = screen.getByDisplayValue('JavaScript (Fetch)');
        fireEvent.change(select, { target: { value: 'python' } });

        expect(onLanguageChange).toHaveBeenCalledWith('python');
    });

    it('copies code to clipboard when button is clicked', () => {
        render(
            <CodeTab
                request={request}
                selectedLanguage="fetch"
                onLanguageChange={onLanguageChange}
            />
        );

        const copyBtn = screen.getByRole('button', { name: /copy/i });
        fireEvent.click(copyBtn);

        expect(functions.copyToClipboard).toHaveBeenCalledWith('mocked generated code');
    });
});

