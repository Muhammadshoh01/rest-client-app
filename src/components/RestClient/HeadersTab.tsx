"use client";

import { Header } from "@/types/rest-client";

interface HeadersTabProps {
  headers: Header[];
  onAddHeader: () => void;
  onUpdateHeader: (
    id: string,
    field: "key" | "value" | "enabled",
    value: string | boolean,
  ) => void;
  onRemoveHeader: (id: string) => void;
}

export default function HeadersTab({
  headers,
  onAddHeader,
  onUpdateHeader,
  onRemoveHeader,
}: HeadersTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">
          Request Headers
        </span>
        <button
          onClick={onAddHeader}
          className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 font-medium transition-colors"
        >
          + Add Header
        </button>
      </div>

      <div className="space-y-3">
        {headers.map((header) => (
          <div
            key={header.id}
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
          >
            <input
              type="checkbox"
              checked={header.enabled}
              onChange={(e) =>
                onUpdateHeader(header.id, "enabled", e.target.checked)
              }
              className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <input
              type="text"
              placeholder="Header key (e.g., Content-Type)"
              value={header.key}
              onChange={(e) => onUpdateHeader(header.id, "key", e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
            <input
              type="text"
              placeholder="Header value (e.g., application/json)"
              value={header.value}
              onChange={(e) =>
                onUpdateHeader(header.id, "value", e.target.value)
              }
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
            <button
              onClick={() => onRemoveHeader(header.id)}
              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
              title="Remove header"
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
        ))}
      </div>

      {headers.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No headers added yet.</p>
          <button
            onClick={onAddHeader}
            className="mt-2 text-indigo-600 hover:text-indigo-700"
          >
            Add your first header
          </button>
        </div>
      )}
    </div>
  );
}
