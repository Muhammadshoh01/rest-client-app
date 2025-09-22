import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { AnalyticsData } from '@/types/history';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: history, error } = await supabase
      .from('request_history')
      .select('method, status, duration, endpoint')
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch analytics' },
        { status: 500 }
      );
    }

    const totalRequests = history.length;
    const averageResponseTime =
      totalRequests > 0
        ? history.reduce((sum, req) => sum + req.duration, 0) / totalRequests
        : 0;

    const successRequests = history.filter(
      (req) => req.status >= 200 && req.status < 400
    );
    const successRate =
      totalRequests > 0 ? (successRequests.length / totalRequests) * 100 : 0;
    const errorCount = history.filter((req) => req.status >= 400).length;

    const methodCounts = history.reduce(
      (acc, req) => {
        acc[req.method] = (acc[req.method] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const mostUsedMethods = Object.entries(methodCounts)
      .map(([method, count]) => ({ method, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const endpointCounts = history.reduce(
      (acc, req) => {
        acc[req.endpoint] = (acc[req.endpoint] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const mostUsedEndpoints = Object.entries(endpointCounts)
      .map(([endpoint, count]) => ({ endpoint, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const statusCounts = history.reduce(
      (acc, req) => {
        acc[req.status] = (acc[req.status] || 0) + 1;
        return acc;
      },
      {} as Record<number, number>
    );

    const statusCodeDistribution = Object.entries(statusCounts)
      .map(([status, count]) => ({ status: parseInt(status), count }))
      .sort((a, b) => b.count - a.count);

    const analytics: AnalyticsData = {
      totalRequests,
      averageResponseTime,
      successRate,
      errorCount,
      mostUsedMethods,
      mostUsedEndpoints,
      statusCodeDistribution,
    };

    return NextResponse.json({ analytics });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
