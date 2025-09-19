"use client";

import { prettifyJson } from "@/utils/functions";

interface RequestBodyTabProps {
  body: string;
  bodyFormat: "json" | "text";
  onBodyChange: (body: string) => void;
  onFormatChange: (format: "json" | "text") => void;
}

export default function RequestBodyTab({
  body,
  bodyFormat,
  onBodyChange,
  onFormatChange,
}: RequestBodyTabProps) {
  const prettifyBody = () => {
    if (bodyFormat === "json") {
      const prettified = prettifyJson(body);
      onBodyChange(prettified);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Format:</span>
          <div className="flex space-x-1">
            {(["json", "text"] as const).map((format) => (
              <button
                key={format}
                onClick={() => onFormatChange(format)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  bodyFormat === format
                    ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent"
                }`}
              >
                {format.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        {bodyFormat === "json" && body && (
          <button
            onClick={prettifyBody}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
          >
            Prettify JSON
          </button>
        )}
      </div>
      <textarea
        placeholder={
          bodyFormat === "json"
            ? '{\n  "key": "value",\n  "array": [1, 2, 3]\n}'
            : "Enter your request body here..."
        }
        value={body}
        onChange={(e) => onBodyChange(e.target.value)}
        rows={10}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm resize-vertical"
      />
      {body && (
        <div className="text-xs text-gray-500">
          Body size: {new Blob([body]).size} bytes
        </div>
      )}
    </div>
  );
}
