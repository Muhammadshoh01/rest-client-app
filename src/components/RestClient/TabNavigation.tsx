'use client';

import { useTranslations } from 'next-intl';

interface TabNavigationProps {
  activeTab: 'body' | 'headers' | 'variables' | 'code';
  onTabChange: (tab: 'body' | 'headers' | 'variables' | 'code') => void;
  headerCount: number;
  variableCount: number;
}

export default function TabNavigation({
  activeTab,
  onTabChange,
  headerCount,
  variableCount,
}: TabNavigationProps) {
  const t = useTranslations('TabNavigation');

  const tabs = [
    {
      id: 'body' as const,
      label: t('body'),
      count: null,
    },
    {
      id: 'headers' as const,
      label: t('headers'),
      count: headerCount > 0 ? headerCount : null,
    },
    {
      id: 'variables' as const,
      label: t('variables'),
      count: variableCount > 0 ? variableCount : null,
    },
    {
      id: 'code' as const,
      label: t('code'),
      count: null,
    },
  ];

  return (
    <>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
            activeTab === tab.id
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <span>{tab.label}</span>
          {tab.count !== null && (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                activeTab === tab.id
                  ? 'bg-indigo-100 text-indigo-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </>
  );
}
