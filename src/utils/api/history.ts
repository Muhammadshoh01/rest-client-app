// utils/api/history.ts
import { RequestHistoryRecord, AnalyticsData } from "../../types/history";
export class HistoryAPI {
  private baseUrl: string;

  constructor(baseUrl: string = "/api") {
    this.baseUrl = baseUrl;
  }

  // Save a request to history (called after each request execution)
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
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
      console.error("Error saving request to history:", error);
      // Don't throw - we don't want to break the user's request flow
    }
  }

  // Get request history for the authenticated user
  async getHistory(): Promise<RequestHistoryRecord[]> {
    const response = await fetch(`${this.baseUrl}/history`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch history: ${response.statusText}`);
    }

    const data = await response.json();
    return data.history || [];
  }

  // Get analytics data for the authenticated user
  async getAnalytics(): Promise<AnalyticsData> {
    const response = await fetch(`${this.baseUrl}/history/analytics`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch analytics: ${response.statusText}`);
    }

    const data = await response.json();
    return data.analytics;
  }

  // Helper method to extract endpoint from URL for grouping
  private extractEndpoint(url: string): string {
    try {
      const urlObj = new URL(url);
      let pathname = urlObj.pathname;

      // Replace numeric IDs with placeholders for grouping
      pathname = pathname.replace(/\/\d+/g, "/{id}");

      // Replace UUIDs with placeholders
      pathname = pathname.replace(
        /\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
        "/{uuid}",
      );

      return pathname;
    } catch (error) {
      return url; // Fallback to full URL if parsing fails
    }
  }
}
