"use client";

import { ResponseData } from "@/types/rest-client";
import { prettifyJson, copyToClipboard } from "@/utils/functions";

interface ResponseSectionProps {
  response: ResponseData;
}

export default function ResponseSection({ response }: ResponseSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Response</h2>
          <div className="flex items-center space-x-4 text-sm">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                response.status >= 200 && response.status < 300
                  ? "bg-green-100 text-green-800 border border-green-200"
                  : response.status >= 400
                    ? "bg-red-100 text-red-800 border border-red-200"
                    : response.status === 0
                      ? "bg-gray-100 text-gray-800 border border-gray-200"
                      : "bg-yellow-100 text-yellow-800 border border-yellow-200"
              }`}
            >
              {response.status === 0
                ? "Error"
                : `${response.status} ${response.statusText}`}
            </span>
            <span className="text-gray-500 font-mono">{response.time}ms</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Response Headers
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 text-sm font-mono max-h-64 overflow-y-auto">
              {Object.keys(response.headers).length > 0 ? (
                Object.entries(response.headers).map(([key, value]) => (
                  <div key={key} className="text-gray-800 mb-1">
                    <span className="text-indigo-600 font-medium">{key}:</span>{" "}
                    <span className="text-gray-700">{value}</span>
                  </div>
                ))
              ) : (
                <div className="text-gray-500">No headers received</div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700">
                Response Body
              </h3>
              {response.body && (
                <button
                  onClick={() => copyToClipboard(response.body)}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Copy
                </button>
              )}
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-sm font-mono max-h-64 overflow-auto">
              {response.body ? (
                <pre className="whitespace-pre-wrap text-gray-800">
                  {prettifyJson(response.body)}
                </pre>
              ) : (
                <div className="text-gray-500">No response body</div>
              )}
            </div>
          </div>
        </div>

        {response.body && (
          <div className="mt-4 text-xs text-gray-500 border-t pt-4">
            Response size: {new Blob([response.body]).size} bytes
          </div>
        )}
      </div>
    </div>
  );
}
