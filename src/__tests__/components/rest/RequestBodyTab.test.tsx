import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import RequestBodyTab from '@/components/RestClient/RequestBodyTab';
import * as functions from '@/utils/functions';

vi.mock('@/utils/functions', () => ({
    prettifyJson: vi.fn((input) => `pretty: ${input}`),
}));

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => key,
}));

describe('RequestBodyTab', () => {
    const onBodyChange = vi.fn();
    const onFormatChange = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders JSON format as selected and shows prettify button', () => {
        render(
            <RequestBodyTab
                body='{"foo":"bar"}'
                bodyFormat="json"
                onBodyChange={onBodyChange}
                onFormatChange={onFormatChange}
            />
        );

        expect(screen.getByText('JSON')).toHaveClass('bg-indigo-100');
        expect(screen.getByRole('button', { name: 'prettifyJson' })).toBeInTheDocument();
    });

    it('renders TEXT format as selected and hides prettify button', () => {
        render(
            <RequestBodyTab
                body=""
                bodyFormat="text"
                onBodyChange={onBodyChange}
                onFormatChange={onFormatChange}
            />
        );

        expect(screen.getByText('TEXT')).toHaveClass('bg-indigo-100');
        expect(screen.queryByRole('button', { name: 'prettifyJson' })).not.toBeInTheDocument();
    });

    it('calls onFormatChange when format buttons are clicked', () => {
        render(
            <RequestBodyTab
                body=""
                bodyFormat="json"
                onBodyChange={onBodyChange}
                onFormatChange={onFormatChange}
            />
        );

        fireEvent.click(screen.getByText('TEXT'));
        expect(onFormatChange).toHaveBeenCalledWith('text');
    });

    it('calls onBodyChange when typing in textarea', () => {
        render(
            <RequestBodyTab
                body=""
                bodyFormat="json"
                onBodyChange={onBodyChange}
                onFormatChange={onFormatChange}
            />
        );

        const textarea = screen.getByRole('textbox');
        fireEvent.change(textarea, { target: { value: '{"new":"data"}' } });

        expect(onBodyChange).toHaveBeenCalledWith('{"new":"data"}');
    });

    it('calls prettifyJson and updates body when prettify button clicked', () => {
        render(
            <RequestBodyTab
                body='{"foo":"bar"}'
                bodyFormat="json"
                onBodyChange={onBodyChange}
                onFormatChange={onFormatChange}
            />
        );

        fireEvent.click(screen.getByRole('button', { name: 'prettifyJson' }));

        expect(functions.prettifyJson).toHaveBeenCalledWith('{"foo":"bar"}');
        expect(onBodyChange).toHaveBeenCalledWith('pretty: {"foo":"bar"}');
    });

    it('shows body size when body is not empty', () => {
        render(
            <RequestBodyTab
                body="hello"
                bodyFormat="text"
                onBodyChange={onBodyChange}
                onFormatChange={onFormatChange}
            />
        );

        expect(screen.getByText(/bodySize/)).toBeInTheDocument();
        expect(screen.getByText(/5/)).toBeInTheDocument();
    });
});
