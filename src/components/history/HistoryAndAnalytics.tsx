import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import {
  Clock,
  Activity,
  AlertCircle,
  ExternalLink,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { HistoryAPI } from "@/utils/api/history";
import { RequestHistoryRecord, AnalyticsData } from "../../types/history";

interface HistoryAndAnalyticsProps {
  user: User;
  onNavigateToRequest: (requestData: any) => void;
}

export default function HistoryAndAnalytics({
  user,
  onNavigateToRequest,
}: HistoryAndAnalyticsProps) {
  const [history, setHistory] = useState<RequestHistoryRecord[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const historyAPI = new HistoryAPI();

  // Load history and analytics from server
  useEffect(() => {
    loadHistoryAndAnalytics();
  }, [user]);

  const loadHistoryAndAnalytics = async () => {
    setLoading(true);
    setError(null);

    try {
      const [historyData, analyticsData] = await Promise.all([
        historyAPI.getHistory(),
        historyAPI.getAnalytics(),
      ]);

      setHistory(historyData);
      setAnalytics(analyticsData);
    } catch (err) {
      setError("Failed to load history and analytics");
      console.error("Error loading history:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestClick = (request: RequestHistoryRecord) => {
    // Navigate to REST client with the request data restored
    const requestData = {
      method: request.method,
      url: request.url,
      headers:
        request.headers.length > 0
          ? request.headers
          : [{ id: "1", key: "", value: "", enabled: true }],
      body: request.body,
    };

    onNavigateToRequest(requestData);
  };

  const formatTimestamp = (timestamp: Date | string) => {
    const date =
      typeof timestamp === "string" ? new Date(timestamp) : timestamp;
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "text-green-600 bg-green-100";
    if (status >= 300 && status < 400) return "text-blue-600 bg-blue-100";
    if (status >= 400 && status < 500) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET":
        return "text-blue-600 bg-blue-100";
      case "POST":
        return "text-green-600 bg-green-100";
      case "PUT":
        return "text-orange-600 bg-orange-100";
      case "DELETE":
        return "text-red-600 bg-red-100";
      case "PATCH":
        return "text-purple-600 bg-purple-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">{error}</h3>
            <button
              onClick={loadHistoryAndAnalytics}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            History & Analytics
          </h1>
          <p className="mt-2 text-gray-600">
            Track your API requests and analyze performance metrics
          </p>
        </div>

        {history.length === 0 ? (
          // Empty state
          <div className="bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="text-center py-16">
              <Activity className="mx-auto h-16 w-16 text-gray-400" />
              <h3 className="mt-4 text-xl font-medium text-gray-900">
                You haven't executed any requests yet
              </h3>
              <p className="mt-2 text-gray-600">
                It's empty here. Try these options:
              </p>
              <div className="mt-6">
                <button
                  onClick={() => router.push("/rest-client")}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <ExternalLink className="mr-2 h-5 w-5" />
                  REST Client
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Analytics Overview */}
            {analytics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Total Requests
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {analytics.totalRequests}
                      </p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-blue-600" />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Avg Response Time
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {Math.round(analytics.averageResponseTime)}ms
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-green-600" />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Success Rate
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {Math.round(analytics.successRate)}%
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Errors
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {analytics.errorCount}
                      </p>
                    </div>
                    <AlertCircle className="h-8 w-8 text-red-600" />
                  </div>
                </div>
              </div>
            )}

            {/* Request History */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Request History
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Click on any request to restore it in the REST client
                </p>
              </div>

              <div className="divide-y divide-gray-200">
                {history
                  .sort(
                    (a, b) =>
                      new Date(b.timestamp).getTime() -
                      new Date(a.timestamp).getTime(),
                  )
                  .map((request) => (
                    <div
                      key={request.id}
                      onClick={() => handleRequestClick(request)}
                      className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1 min-w-0">
                          {/* Method Badge */}
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMethodColor(request.method)}`}
                          >
                            {request.method}
                          </span>

                          {/* URL */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {request.url}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatTimestamp(request.timestamp)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          {/* Status */}
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}
                          >
                            {request.status}
                          </span>

                          {/* Duration */}
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {request.duration}ms
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatBytes(request.request_size)} →{" "}
                              {formatBytes(request.response_size)}
                            </p>
                          </div>

                          {/* Error indicator */}
                          {request.error_details && (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}

                          <ExternalLink className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>

                      {/* Error details */}
                      {request.error_details && (
                        <div className="mt-2 text-xs text-red-600 bg-red-50 rounded p-2">
                          Error: {request.error_details}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>

            {/* Analytics Details */}
            {analytics && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Most Used Methods */}
                <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Most Used Methods
                  </h3>
                  <div className="space-y-3">
                    {analytics.mostUsedMethods.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMethodColor(item.method)}`}
                        >
                          {item.method}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {item.count} requests
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Code Distribution */}
                <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Status Code Distribution
                  </h3>
                  <div className="space-y-3">
                    {analytics.statusCodeDistribution.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}
                        >
                          {item.status}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {item.count} requests
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
