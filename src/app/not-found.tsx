'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function NotFound() {
  const t = useTranslations();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8 text-center px-4">
        <div className="mx-auto w-32 h-32 text-indigo-500">
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            className="w-full h-full"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-3-8.5a9.5 9.5 0 11-9.5 9.5A9.5 9.5 0 0112 3.5z"
            />
          </svg>
        </div>

        <div>
          <h1 className="text-6xl font-bold text-gray-900 mb-2">
            {t('NotFound.title')}
          </h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            {t('NotFound.subtitle')}
          </h2>
          <p className="text-gray-600 mb-8">{t('NotFound.description')}</p>
        </div>

        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center w-full px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            {t('NotFound.go_home')}
          </Link>

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center w-full px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            {t('NotFound.go_back')}
          </button>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-3">
            {t('NotFound.quick_links')}
          </p>
          <div className="flex justify-center space-x-6">
            <Link
              href="/login"
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              {t('NotFound.login')}
            </Link>
            <Link
              href="/signup"
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              {t('NotFound.signup')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
