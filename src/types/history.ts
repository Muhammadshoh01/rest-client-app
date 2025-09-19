// types/history.ts
export interface RequestHistoryRecord {
  id: string;
  user_id: string;
  timestamp: string; // ISO string
  method: string;
  url: string;
  endpoint: string; // Normalized endpoint for grouping
  status: number;
  duration: number; // in milliseconds
  request_size: number; // in bytes
  response_size: number; // in bytes
  error_details?: string;
  headers: Array<{
    key: string;
    value: string;
    enabled: boolean;
  }>;
  body: string;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsData {
  totalRequests: number;
  averageResponseTime: number;
  successRate: number;
  errorCount: number;
  mostUsedMethods: Array<{
    method: string;
    count: number;
  }>;
  mostUsedEndpoints: Array<{
    endpoint: string;
    count: number;
  }>;
  statusCodeDistribution: Array<{
    status: number;
    count: number;
  }>;
}
