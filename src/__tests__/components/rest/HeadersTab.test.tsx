import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import HeadersTab from '@/components/RestClient/HeadersTab';
import { Header } from '@/types/rest-client';

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => key,
}));

describe('HeadersTab', () => {
    const onAddHeader = vi.fn();
    const onUpdateHeader = vi.fn();
    const onRemoveHeader = vi.fn();

    const headers: Header[] = [
        { id: '1', key: 'Authorization', value: 'Bearer token', enabled: true },
        { id: '2', key: 'Content-Type', value: 'application/json', enabled: false },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders headers list', () => {
        render(
            <HeadersTab
                headers={headers}
                onAddHeader={onAddHeader}
                onUpdateHeader={onUpdateHeader}
                onRemoveHeader={onRemoveHeader}
            />
        );

        expect(screen.getByDisplayValue('Authorization')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Bearer token')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Content-Type')).toBeInTheDocument();
    });

    it('calls onAddHeader when add button is clicked', () => {
        render(
            <HeadersTab
                headers={headers}
                onAddHeader={onAddHeader}
                onUpdateHeader={onUpdateHeader}
                onRemoveHeader={onRemoveHeader}
            />
        );

        fireEvent.click(screen.getByText('addHeader'));
        expect(onAddHeader).toHaveBeenCalled();
    });

    it('calls onUpdateHeader when checkbox is toggled', () => {
        render(
            <HeadersTab
                headers={headers}
                onAddHeader={onAddHeader}
                onUpdateHeader={onUpdateHeader}
                onRemoveHeader={onRemoveHeader}
            />
        );

        const checkbox = screen.getAllByRole('checkbox')[0];
        fireEvent.click(checkbox);

        expect(onUpdateHeader).toHaveBeenCalledWith('1', 'enabled', false);
    });

    it('calls onUpdateHeader when key/value changes', () => {
        render(
            <HeadersTab
                headers={headers}
                onAddHeader={onAddHeader}
                onUpdateHeader={onUpdateHeader}
                onRemoveHeader={onRemoveHeader}
            />
        );

        const keyInput = screen.getByDisplayValue('Authorization');
        fireEvent.change(keyInput, { target: { value: 'Auth' } });
        expect(onUpdateHeader).toHaveBeenCalledWith('1', 'key', 'Auth');

        const valueInput = screen.getByDisplayValue('Bearer token');
        fireEvent.change(valueInput, { target: { value: 'XYZ' } });
        expect(onUpdateHeader).toHaveBeenCalledWith('1', 'value', 'XYZ');
    });

    it('calls onRemoveHeader when remove button is clicked', () => {
        render(
            <HeadersTab
                headers={headers}
                onAddHeader={onAddHeader}
                onUpdateHeader={onUpdateHeader}
                onRemoveHeader={onRemoveHeader}
            />
        );

        const removeButtons = screen.getAllByRole('button', { name: 'removeHeader' });
        fireEvent.click(removeButtons[0]);

        expect(onRemoveHeader).toHaveBeenCalledWith('1');
    });

    it('shows empty state when no headers exist', () => {
        render(
            <HeadersTab
                headers={[]}
                onAddHeader={onAddHeader}
                onUpdateHeader={onUpdateHeader}
                onRemoveHeader={onRemoveHeader}
            />
        );

        expect(screen.getByText('noHeadersYet')).toBeInTheDocument();

        fireEvent.click(screen.getByText('addFirstHeader'));
        expect(onAddHeader).toHaveBeenCalled();
    });
});
