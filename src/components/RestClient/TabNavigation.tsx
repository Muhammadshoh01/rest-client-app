'use client';

interface TabNavigationProps {
    activeTab: 'body' | 'headers' | 'code';
    onTabChange: (tab: 'body' | 'headers' | 'code') => void;
    headerCount: number;
}

export default function TabNavigation({ activeTab, onTabChange, headerCount }: TabNavigationProps) {
    const tabs = [
        { id: 'body' as const, label: 'Body' },
        { id: 'headers' as const, label: 'Headers' },
        { id: 'code' as const, label: 'Generated Code' }
    ];

    return (
        <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        {tab.label}
                        {tab.id === 'headers' && (
                            <span className="ml-2 bg-gray-100 text-gray-600 py-1 px-2 rounded-full text-xs">
                                {headerCount}
                            </span>
                        )}
                    </button>
                ))}
            </nav>
        </div>
    );
}