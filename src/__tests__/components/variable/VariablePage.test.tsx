import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VariablesPage from '@/components/variable/VariablePage';
import { User } from '@supabase/supabase-js';
import { expect, vi, it, describe } from 'vitest';
import { Suspense } from 'react';
import { Variable } from '@/types/rest-client';

vi.mock('@/utils/functions/variables', () => ({
    loadVariablesFromStorage: vi.fn(() => []),
    saveVariablesToStorage: vi.fn(),
}));
vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => key,
}));

const mockUser = { id: '123' } as unknown as User;

describe('VariablesPage', () => {

    it('loads variables from storage on mount', async () => {
        const loadVariablesFromStorage = await import('@/utils/functions/variables');
        vi.spyOn(loadVariablesFromStorage, 'loadVariablesFromStorage').mockReturnValueOnce([
            { id: '1', name: 'API_KEY', value: '123', description: '', enabled: true },
        ]);

        render(
            <Suspense fallback="loading">
                <VariablesPage user={mockUser} />
            </Suspense>
        );

        await waitFor(() =>
            expect(screen.getByDisplayValue('API_KEY')).toBeInTheDocument()
        );
    });

    it('adds a new variable when clicking create button', async () => {
        render(<VariablesPage user={mockUser} />);
        const button = await screen.findByText(/createFirst/i);
        fireEvent.click(button);
        await waitFor(() =>
            expect(screen.getByText(/manageVariables/i)).toBeInTheDocument()
        );
    });

    it('updates counts when variables change', async () => {
        render(<VariablesPage user={mockUser} />);

        const button = await screen.findByText(/createFirst/i);
        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getAllByText('1')).toHaveLength(2);
        });
    });
});
