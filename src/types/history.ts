export interface RequestHistoryRecord {
  id: string;
  user_id: string;
  timestamp: string;
  method: string;
  url: string;
  endpoint: string;
  status: number;
  duration: number;
  request_size: number;
  response_size: number;
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
