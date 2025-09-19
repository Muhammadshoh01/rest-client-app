"use client";

import { Variable } from "@/types/rest-client";
import { hasVariables, replaceVariables } from "@/utils/functions/variables";

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
  className = "",
}: VariablePreviewProps) {
  if (!text || !hasVariables(text)) {
    return null;
  }

  const resolved = replaceVariables(text, variables);
  const hasUnresolvedVars = hasVariables(resolved);

  return (
    <div
      className={`text-xs bg-amber-50 border border-amber-200 rounded p-2 ${className}`}
    >
      <div className="font-medium text-amber-800 mb-1">{label} Preview:</div>
      <div className="space-y-1">
        <div className="text-gray-600">
          <span className="font-medium">Original:</span>
          <code className="bg-white px-1 py-0.5 rounded ml-1 text-xs break-all">
            {text}
          </code>
        </div>
        <div className="text-gray-800">
          <span className="font-medium">Resolved:</span>
          <code
            className={`px-1 py-0.5 rounded ml-1 text-xs break-all ${
              hasUnresolvedVars
                ? "bg-red-100 text-red-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {resolved}
          </code>
        </div>
        {hasUnresolvedVars && (
          <div className="text-red-600 text-xs mt-1">
            ⚠️ Some variables are not defined or disabled
          </div>
        )}
      </div>
    </div>
  );
}
