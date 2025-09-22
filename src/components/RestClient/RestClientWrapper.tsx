'use client';

import dynamic from 'next/dynamic';
import { RestClientWrapperProps } from '@/types/rest-client';
import { useTranslations } from 'next-intl';

function RestClientLoading() {
  const t = useTranslations('RestClientHeader');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <div role="status" className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="text-gray-600">{t('loading')}</p>
      </div>
    </div>
  );
}

const RestClient = dynamic(() => import('@/components/RestClient/ResClient'), {
  loading: () => <RestClientLoading />,
  ssr: false,
});

export default function RestClientWrapper({ user }: RestClientWrapperProps) {
  return <RestClient user={user} />;
}
