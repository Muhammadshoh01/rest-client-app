'use client';

import { Variable } from '@/types/rest-client';
import { hasVariables, replaceVariables } from '@/utils/functions/variables';
import { useTranslations } from 'next-intl';

interface VariablePreviewProps {
  text: string;
  variables: Variable[];
  label: string;
  className?: string;
}

export default function VariablePreview({
  text,
  variables,
  label,
  className = '',
}: VariablePreviewProps) {
  const t = useTranslations('VariablePreview');
  if (!text || !hasVariables(text)) {
    return null;
  }

  const resolved = replaceVariables(text, variables);
  const hasUnresolvedVars = hasVariables(resolved);

  return (
    <div
      className={`text-xs bg-amber-50 border border-amber-200 rounded p-2 ${className}`}
    >
      <div className="font-medium text-amber-800 mb-1">
        {label} {t('preview')}
      </div>
      <div className="space-y-1">
        <div className="text-gray-600">
          <span className="font-medium">{t('original')}:</span>
          <code className="bg-white px-1 py-0.5 rounded ml-1 text-xs break-all">
            {text}
          </code>
        </div>
        <div className="text-gray-800">
          <span className="font-medium">{t('resolved')}:</span>
          <code
            className={`px-1 py-0.5 rounded ml-1 text-xs break-all ${hasUnresolvedVars
              ? 'bg-red-100 text-red-800'
              : 'bg-green-100 text-green-800'
              }`}
          >
            {resolved}
          </code>
        </div>
        {hasUnresolvedVars && (
          <div className="text-red-600 text-xs mt-1">
            ⚠️ {t('unresolvedWarning')}
          </div>
        )}
      </div>
    </div>
  );
}
