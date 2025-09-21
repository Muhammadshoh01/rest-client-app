'use client';

import { useState } from 'react';
import { signup } from '../login/actions';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export default function SignupForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const t = useTranslations();

  return (
    <div className="max-w-md w-full space-y-8">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            {t('Signup.title')}
          </h2>
          <p className="mt-2 text-gray-600">{t('Signup.subtitle')}</p>
        </div>

        <form
          action={async (formData) => {
            setError(null);

            const password = formData.get('password') as string;
            if (!passwordRegex.test(password)) {
              setError(t('Signup.password_error'));
              return;
            }

            setLoading(true);
            try {
              await signup(formData);
            } catch (err: unknown) {
              if (err instanceof Error) {
                setError(err.message || t('Signup.error_generic'));
              }
              setLoading(false);
            }
          }}
          className="space-y-6"
        >
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              {t('Signup.email_label')}
            </label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder={t('Signup.email_placeholder')}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              {t('Signup.password_label')}
            </label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder={t('Signup.password_placeholder')}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              {t('Signup.password_hint')}
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t('Signup.submit_creating') : t('Signup.submit')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {t('Signup.already_have')}{' '}
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              {t('Signup.signin_link')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
