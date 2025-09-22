'use client';

import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import HistoryAndAnalytics from '@/components/history/HistoryAndAnalytics';
import { encodeBase64 } from '@/utils/functions';
import { RequestData, Header } from '@/types/rest-client';


interface HistoryPageClientProps {
  user: User;
}

export default function HistoryPageClient({ user }: HistoryPageClientProps) {
  const router = useRouter();

  const handleNavigateToRequest = (requestData: RequestData) => {
    const encodedUrl = encodeBase64(requestData.url);
    const encodedBody = requestData.body?.trim()
      ? encodeBase64(requestData.body)
      : '';

    let path = `/rest-client/${requestData.method}/${encodedUrl}`;
    if (encodedBody) {
      path += `/${encodedBody}`;
    }

    const queryParams = new URLSearchParams();
    requestData.headers
      .filter((h: Header) => h.enabled && h.key.trim() && h.value.trim())
      .forEach((h: Header) => {
        queryParams.append(h.key, h.value);
      });

    const queryString = queryParams.toString();
    const fullUrl = queryString ? `${path}?${queryString}` : path;

    router.replace(fullUrl);
  };

  return (
    <HistoryAndAnalytics
      user={user}
      onNavigateToRequest={handleNavigateToRequest}
    />
  );
}
