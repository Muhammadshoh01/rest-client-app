
import { render, screen, fireEvent } from '@testing-library/react';
import TabNavigation from '@/components/RestClient/TabNavigation';
import { expect, vi, it, describe } from 'vitest';

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => key,
}));

describe('TabNavigation', () => {
    const mockOnTabChange = vi.fn();

    it('renders all tabs with correct labels', () => {
        render(
            <TabNavigation
                activeTab="body"
                onTabChange={mockOnTabChange}
                headerCount={0}
                variableCount={0}
            />
        );

        expect(screen.getByText('body')).toBeInTheDocument();
        expect(screen.getByText('headers')).toBeInTheDocument();
        expect(screen.getByText('variables')).toBeInTheDocument();
        expect(screen.getByText('code')).toBeInTheDocument();
    });

    it('shows counts only when > 0', () => {
        render(
            <TabNavigation
                activeTab="body"
                onTabChange={mockOnTabChange}
                headerCount={3}
                variableCount={2}
            />
        );

        expect(screen.getByText('3')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.queryByText('0')).not.toBeInTheDocument();
    });

    it('applies active styles to active tab', () => {
        render(
            <TabNavigation
                activeTab="headers"
                onTabChange={mockOnTabChange}
                headerCount={1}
                variableCount={0}
            />
        );

        const activeTab = screen.getByText('headers').closest('button');
        expect(activeTab).toHaveClass('border-indigo-500 text-indigo-600');
    });

    it('calls onTabChange with correct id when tab clicked', () => {
        render(
            <TabNavigation
                activeTab="body"
                onTabChange={mockOnTabChange}
                headerCount={0}
                variableCount={0}
            />
        );

        fireEvent.click(screen.getByText('variables'));
        expect(mockOnTabChange).toHaveBeenCalledWith('variables');
    });
});
