'use client';

import { User } from '@supabase/supabase-js';
import { logout } from '@/app/(auth)/login/actions';
import { useTranslations } from 'next-intl';

interface RestClientHeaderProps {
  user: User;
  currentMethod: string;
}

export default function RestClientHeader({
  user,
  currentMethod,
}: RestClientHeaderProps) {
  const t = useTranslations('RestClientHeader');

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-indigo-600">{t('title')}</h1>
            <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
              <span>{t('method')}</span>
              <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                {currentMethod}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {t('welcome', { email: user.email ?? '' })}
            </span>
            <form action={logout} className="inline">
              <button
                type="submit"
                className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
              >
                {t('signOut')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </header>
  );
}
