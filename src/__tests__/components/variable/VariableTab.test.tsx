
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VariablesTab from '@/components/variable/VariableTab';
import type { Variable } from '@/types/rest-client';
import { vi, describe, it, expect } from 'vitest'

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => key,
}));

const mockWriteText = vi.fn(() => Promise.resolve());
Object.assign(navigator, {
    clipboard: {
        writeText: mockWriteText,
    },
});

describe('VariablesTab', () => {
    const baseVariable: Variable = {
        id: '1',
        name: 'TOKEN',
        value: '123',
        description: 'auth token',
        enabled: true,
    };

    const setup = (propsOverrides = {}) => {
        const props = {
            variables: [],
            onAddVariable: vi.fn(),
            onUpdateVariable: vi.fn(),
            onRemoveVariable: vi.fn(),
            onImportVariables: vi.fn(),
            onExportVariables: vi.fn(),
            ...propsOverrides,
        };
        render(<VariablesTab {...props} />);
        return props;
    };

    it('renders empty state when no variables', () => {
        setup();
        expect(screen.getByText('noVariables')).toBeInTheDocument();
        expect(screen.getByText('addFirstVariable')).toBeInTheDocument();
    });

    it('renders a variable and allows updating fields', () => {
        const onUpdateVariable = vi.fn();
        setup({ variables: [baseVariable], onUpdateVariable });

        fireEvent.change(screen.getByPlaceholderText('variableNamePlaceholder'), {
            target: { value: 'NEW_NAME' },
        });
        expect(onUpdateVariable).toHaveBeenCalledWith('1', 'name', 'NEW_NAME');

        fireEvent.change(screen.getByPlaceholderText('valuePlaceholder'), {
            target: { value: '456' },
        });
        expect(onUpdateVariable).toHaveBeenCalledWith('1', 'value', '456');

        fireEvent.change(screen.getByPlaceholderText('descriptionPlaceholder'), {
            target: { value: 'updated desc' },
        });
        expect(onUpdateVariable).toHaveBeenCalledWith(
            '1',
            'description',
            'updated desc'
        );
    });

    it('toggles variable enabled state', () => {
        const onUpdateVariable = vi.fn();
        setup({ variables: [baseVariable], onUpdateVariable });

        fireEvent.click(screen.getByRole('checkbox'));
        expect(onUpdateVariable).toHaveBeenCalledWith('1', 'enabled', false);
    });

    it('calls onAddVariable when add button clicked', () => {
        const onAddVariable = vi.fn();
        setup({ onAddVariable });
        fireEvent.click(screen.getByText('+ addVariable'));
        expect(onAddVariable).toHaveBeenCalled();
    });

    it('calls onRemoveVariable when remove button clicked', () => {
        const onRemoveVariable = vi.fn();
        setup({ variables: [baseVariable], onRemoveVariable });
        fireEvent.click(screen.getByTitle('removeVariable'));
        expect(onRemoveVariable).toHaveBeenCalledWith('1');
    });

    it('imports variables with valid JSON', () => {
        const onImportVariables = vi.fn();
        setup({ onImportVariables });

        fireEvent.click(screen.getByText('import'));

        const textarea = screen.getByPlaceholderText(/\[/);
        fireEvent.change(textarea, {
            target: {
                value: JSON.stringify([{ name: 'API_KEY', value: 'abc' }]),
            },
        });

        fireEvent.click(screen.getAllByText('import')[1]);

        expect(onImportVariables).toHaveBeenCalled();
    });

    it('shows alert for invalid JSON on import', () => {
        const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => { });
        setup();

        fireEvent.click(screen.getByText('import'));
        fireEvent.change(screen.getByPlaceholderText(/\[/), {
            target: { value: '{invalid}' },
        });
        fireEvent.click(screen.getAllByText('import')[1]);

        expect(alertMock).toHaveBeenCalledWith('invalidJson');
        alertMock.mockRestore();
    });

    it('exports variables to clipboard', async () => {
        const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => { });
        setup({ variables: [baseVariable] });

        fireEvent.click(screen.getByText('export'));

        await waitFor(() =>
            expect(mockWriteText).toHaveBeenCalledWith(
                JSON.stringify(
                    [
                        {
                            name: 'TOKEN',
                            value: '123',
                            description: 'auth token',
                            enabled: true,
                        },
                    ],
                    null,
                    2
                )
            )
        );

        expect(alertMock).toHaveBeenCalledWith('exportSuccess');
        alertMock.mockRestore();
    });
});
