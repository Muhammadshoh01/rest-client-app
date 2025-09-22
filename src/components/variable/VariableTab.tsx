'use client';

import { useState } from 'react';
import { Variable } from '@/types/rest-client';
import { useTranslations } from 'next-intl';

interface VariablesTabProps {
  variables: Variable[];
  onAddVariable: () => void;
  onUpdateVariable: (
    id: string,
    field: 'name' | 'value' | 'description' | 'enabled',
    value: string | boolean
  ) => void;
  onRemoveVariable: (id: string) => void;
  onImportVariables: (variables: Variable[]) => void;
  onExportVariables: () => void;
}

export default function VariablesTab({
  variables,
  onAddVariable,
  onUpdateVariable,
  onRemoveVariable,
  onImportVariables,
  onExportVariables,
}: VariablesTabProps) {
  const [importText, setImportText] = useState('');
  const [showImport, setShowImport] = useState(false);

  const t = useTranslations('VariablesTab');

  const handleImport = () => {
    try {
      const parsed = JSON.parse(importText);
      if (Array.isArray(parsed)) {
        const validVariables = parsed
          .filter((v) => v && typeof v === 'object' && v.name && v.value)
          .map((v) => ({
            id: Date.now().toString() + Math.random(),
            name: v.name,
            value: v.value,
            description: v.description || '',
            enabled: v.enabled !== false,
          }));

        onImportVariables(validVariables);
        setImportText('');
        setShowImport(false);
      } else {
        alert(t('invalidArray'));
      }
    } catch (error) {
      alert(t('invalidJson'));
    }
  };

  const exportToClipboard = () => {
    const exportData = variables.map((v) => ({
      name: v.name,
      value: v.value,
      description: v.description,
      enabled: v.enabled,
    }));

    navigator.clipboard
      .writeText(JSON.stringify(exportData, null, 2))
      .then(() => {
        alert(t('exportSuccess'));
      })
      .catch(() => {
        const textArea = document.createElement('textarea');
        textArea.value = JSON.stringify(exportData, null, 2);
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert(t('exportSuccess'));
      });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-sm font-medium text-gray-700">
            {t('title')}
          </span>
          <p className="text-xs text-gray-500 mt-1">
            Use variables with {`{{variableName}}`} syntax in URL, headers, or
            body
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowImport(!showImport)}
            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            {t('import')}
          </button>
          <button
            onClick={exportToClipboard}
            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            {t('export')}
          </button>
          <button
            onClick={onAddVariable}
            className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 font-medium transition-colors"
          >
            + {t('addVariable')}
          </button>
        </div>
      </div>

      {showImport && (
        <div className="p-4 bg-gray-50 rounded-lg space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('importLabel')}
            </label>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder={`[
  {
    "name": "API_KEY",
    "value": "your-api-key",
    "description": "API authentication key",
    "enabled": true
  }
]`}
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-xs"
            />
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleImport}
              className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
            >
              {t('import')}
            </button>
            <button
              onClick={() => {
                setShowImport(false);
                setImportText('');
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-400"
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {variables.map((variable) => (
          <div
            key={variable.id}
            className="p-4 bg-gray-50 rounded-lg space-y-3"
          >
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={variable.enabled}
                onChange={(e) =>
                  onUpdateVariable(variable.id, 'enabled', e.target.checked)
                }
                className="mt-1 w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <div className="flex-1 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      {t('variableName')}
                    </label>
                    <input
                      type="text"
                      placeholder={t('variableNamePlaceholder')}
                      value={variable.name}
                      onChange={(e) =>
                        onUpdateVariable(variable.id, 'name', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      {t('value')}
                    </label>
                    <input
                      type="text"
                      placeholder={t('valuePlaceholder')}
                      value={variable.value}
                      onChange={(e) =>
                        onUpdateVariable(variable.id, 'value', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {t('description')}
                  </label>
                  <input
                    type="text"
                    placeholder={t('descriptionPlaceholder')}
                    value={variable.description || ''}
                    onChange={(e) =>
                      onUpdateVariable(
                        variable.id,
                        'description',
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  />
                </div>
                {variable.name && (
                  <div className="text-xs text-gray-600 bg-white px-2 py-1 rounded border">
                    <span className="font-medium">{t('usage')}:</span>{' '}
                    <code className="bg-gray-100 px-1 rounded">{`{{${variable.name}}}`}</code>
                  </div>
                )}
              </div>
              <button
                onClick={() => onRemoveVariable(variable.id)}
                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                title={t('removeVariable')}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {variables.length === 0 && (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
          <div className="space-y-2">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
            <p className="font-medium">{t('noVariables')}</p>
            <p className="text-sm">{t('createTip')}</p>
            <button
              onClick={onAddVariable}
              className="mt-2 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
            >
              {t('addFirstVariable')}
            </button>
          </div>
        </div>
      )}

      {variables.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="text-sm text-blue-800">
            <strong>{t('tipsTitle')}:</strong>
            <ul className="mt-2 space-y-1 text-xs">
              <li>
                • {t('tipUrl')}{' '}
                <code className="bg-blue-100 px-1 rounded">
                  https://api.example.com/{`{{endpoint}}`}
                </code>
              </li>
              <li>
                • {t('tipHeaders')}{' '}
                <code className="bg-blue-100 px-1 rounded">
                  Bearer {`{{token}}`}
                </code>
              </li>
              <li>
                • {t('tipJson')}{' '}
                <code className="bg-blue-100 px-1 rounded">{`{"key": "{{value}}"}`}</code>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
