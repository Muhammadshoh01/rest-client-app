'use client';

import dynamic from 'next/dynamic';
import { RestClientWrapperProps } from '@/types/rest-client';

const RestClient = dynamic(() => import('@/components/RestClient/ResClient'), {
    loading: () => (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="text-gray-600">Loading REST Client...</p>
            </div>
        </div>
    ),
    ssr: false
});

export default function RestClientWrapper({ user }: RestClientWrapperProps) {
    return <RestClient user={user} />;
}