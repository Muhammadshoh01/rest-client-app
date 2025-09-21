'use client';

import { HTTP_METHODS } from '@/utils/constants/vars';
import { useTranslations } from 'next-intl';

interface RequestFormProps {
  method: string;
  url: string;
  isLoading: boolean;
  onMethodChange: (method: string) => void;
  onUrlChange: (url: string) => void;
  onExecute: () => void;
}

export default function RequestForm({
  method,
  url,
  isLoading,
  onMethodChange,
  onUrlChange,
  onExecute,
}: RequestFormProps) {
  const t = useTranslations();
  return (
    <div className="flex gap-3 mb-6">
      <select
        value={method}
        onChange={(e) => onMethodChange(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
      >
        {HTTP_METHODS.map((method) => (
          <option key={method} value={method}>
            {method}
          </option>
        ))}
      </select>

      <input
        type="url"
        placeholder="https://api.example.com/endpoint"
        value={url}
        onChange={(e) => onUrlChange(e.target.value)}
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
      />

      <button
        onClick={onExecute}
        disabled={!url.trim() || isLoading}
        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
      >
        {isLoading ? (
          <span className="flex items-center">
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            {t('sending')}
          </span>
        ) : (
          t('send')
        )}
      </button>
    </div>
  );
}
