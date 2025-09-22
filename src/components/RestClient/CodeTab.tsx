'use client';

import { generateCode, copyToClipboard } from '@/utils/functions';
import { CODE_LANGUAGES } from '@/utils/constants/vars';
import { RequestData } from '@/types/rest-client';
import { useTranslations } from 'next-intl';

interface CodeTabProps {
  request: RequestData;
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
}

export default function CodeTab({
  request,
  selectedLanguage,
  onLanguageChange,
}: CodeTabProps) {
  const t = useTranslations();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          {t('generatedCode')}
        </span>
        <div className="flex items-center space-x-3">
          <select
            value={selectedLanguage}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          >
            {CODE_LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
          <button
            onClick={() =>
              copyToClipboard(generateCode(request, selectedLanguage))
            }
            className="px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            title={t('copyToClipboard')}
          >
            {t('copy')}
          </button>
        </div>
      </div>
      <div className="relative">
        <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm font-mono max-h-96">
          <code>{generateCode(request, selectedLanguage)}</code>
        </pre>
      </div>
    </div>
  );
}
