import { RequestHistoryRecord, AnalyticsData } from '../../types/history';
export class HistoryAPI {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  async saveRequest(requestData: {
    method: string;
    url: string;
    headers: Array<{ key: string; value: string; enabled: boolean }>;
    body: string;
    status: number;
    duration: number;
    requestSize: number;
    responseSize: number;
    errorDetails?: string;
  }): Promise<void> {
    try {
      const endpoint = this.extractEndpoint(requestData.url);

      const response = await fetch(`${this.baseUrl}/history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...requestData,
          endpoint,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save request: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error saving request to history:', error);
    }
  }

  async getHistory(): Promise<RequestHistoryRecord[]> {
    const response = await fetch(`${this.baseUrl}/history`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch history: ${response.statusText}`);
    }

    const data = await response.json();
    return data.history || [];
  }

  async getAnalytics(): Promise<AnalyticsData> {
    const response = await fetch(`${this.baseUrl}/history/analytics`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch analytics: ${response.statusText}`);
    }

    const data = await response.json();
    return data.analytics;
  }

  private extractEndpoint(url: string): string {
    try {
      const urlObj = new URL(url);
      let pathname = urlObj.pathname;

      pathname = pathname.replace(/\/\d+/g, '/{id}');

      pathname = pathname.replace(
        /\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
        '/{uuid}'
      );

      return pathname;
    } catch (error) {
      return url;
    }
  }
}
