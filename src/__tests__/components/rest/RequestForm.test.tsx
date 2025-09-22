import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import RequestForm from '@/components/RestClient/RequestForm';
import { HTTP_METHODS } from '@/utils/constants/vars';

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => key,
}));

describe('RequestForm', () => {
    const onMethodChange = vi.fn();
    const onUrlChange = vi.fn();
    const onExecute = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders all HTTP methods in the select', () => {
        render(
            <RequestForm
                method="GET"
                url=""
                isLoading={false}
                onMethodChange={onMethodChange}
                onUrlChange={onUrlChange}
                onExecute={onExecute}
            />
        );

        HTTP_METHODS.forEach((method) => {
            expect(screen.getByRole('option', { name: method })).toBeInTheDocument();
        });
    });

    it('calls onMethodChange when method is changed', () => {
        render(
            <RequestForm
                method="GET"
                url=""
                isLoading={false}
                onMethodChange={onMethodChange}
                onUrlChange={onUrlChange}
                onExecute={onExecute}
            />
        );

        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'POST' } });
        expect(onMethodChange).toHaveBeenCalledWith('POST');
    });

    it('calls onUrlChange when typing in the input', () => {
        render(
            <RequestForm
                method="GET"
                url=""
                isLoading={false}
                onMethodChange={onMethodChange}
                onUrlChange={onUrlChange}
                onExecute={onExecute}
            />
        );

        fireEvent.change(screen.getByPlaceholderText(/https:\/\/api/), {
            target: { value: 'https://example.com' },
        });
        expect(onUrlChange).toHaveBeenCalledWith('https://example.com');
    });

    it('disables the button when URL is empty', () => {
        render(
            <RequestForm
                method="GET"
                url=""
                isLoading={false}
                onMethodChange={onMethodChange}
                onUrlChange={onUrlChange}
                onExecute={onExecute}
            />
        );

        expect(screen.getByRole('button', { name: 'send' })).toBeDisabled();
    });

    it('disables the button when isLoading is true', () => {
        render(
            <RequestForm
                method="GET"
                url="https://example.com"
                isLoading={true}
                onMethodChange={onMethodChange}
                onUrlChange={onUrlChange}
                onExecute={onExecute}
            />
        );

        expect(screen.getByRole('button', { name: /sending/ })).toBeDisabled();
    });

    it('calls onExecute when button clicked and enabled', () => {
        render(
            <RequestForm
                method="GET"
                url="https://example.com"
                isLoading={false}
                onMethodChange={onMethodChange}
                onUrlChange={onUrlChange}
                onExecute={onExecute}
            />
        );

        fireEvent.click(screen.getByRole('button', { name: 'send' }));
        expect(onExecute).toHaveBeenCalled();
    });

    it('shows "send" text when not loading', () => {
        render(
            <RequestForm
                method="GET"
                url="https://example.com"
                isLoading={false}
                onMethodChange={onMethodChange}
                onUrlChange={onUrlChange}
                onExecute={onExecute}
            />
        );

        expect(screen.getByRole('button', { name: 'send' })).toBeInTheDocument();
    });

    it('shows "sending" text and spinner when loading', () => {
        render(
            <RequestForm
                method="GET"
                url="https://example.com"
                isLoading={true}
                onMethodChange={onMethodChange}
                onUrlChange={onUrlChange}
                onExecute={onExecute}
            />
        );

        expect(screen.getByText('sending')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sending/ }).querySelector('svg')).toBeInTheDocument();
    });
});
