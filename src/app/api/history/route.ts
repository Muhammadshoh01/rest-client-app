import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requestData = await request.json();

    const { error } = await supabase.from('request_history').insert([
      {
        user_id: user.id,
        method: requestData.method,
        url: requestData.url,
        endpoint: requestData.endpoint,
        status: requestData.status,
        duration: requestData.duration,
        request_size: requestData.requestSize,
        response_size: requestData.responseSize,
        error_details: requestData.errorDetails,
        headers: requestData.headers,
        body: requestData.body,
        timestamp: requestData.timestamp,
      },
    ]);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to save request' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
      .select('*')
      .eq('user_id', user.id)
      .order('timestamp', { ascending: false })
      .limit(100);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch history' },
        { status: 500 }
      );
    }

    return NextResponse.json({ history });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
