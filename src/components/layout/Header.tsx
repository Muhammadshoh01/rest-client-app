'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { logout } from '@/app/(auth)/login/actions';
import { useTranslations } from 'next-intl';
import LocaleSwitcher from '@/components/LocaleSwitcher';

interface HeaderProps {
  isAuthenticated: boolean;
  username?: string;
}

export default function Header({ isAuthenticated, username }: HeaderProps) {
  const [isSticky, setIsSticky] = useState(false);
  const t = useTranslations();

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsSticky(scrollTop > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-300 ease-in-out ${isSticky
        ? 'bg-white/95 backdrop-blur-md border-gray-200 shadow-lg h-14'
        : 'bg-white border-gray-200 shadow-sm h-16'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`flex justify-between items-center transition-all duration-300 ${isSticky ? 'h-14' : 'h-16'
            }`}
        >
          <div className="flex items-center">
            <Link href="/" className="flex items-center group">
              <div
                className={`bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold transition-all duration-300 ${isSticky ? 'w-7 h-7 text-sm' : 'w-8 h-8'
                  }`}
              >
                R
              </div>
              <span
                className={`ml-2 font-semibold text-gray-900 transition-all duration-300 group-hover:text-blue-600 ${isSticky ? 'text-lg' : 'text-xl'
                  }`}
              >
                {t('appName')}
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <LocaleSwitcher isSticky={isSticky} />

            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                {username && (
                  <span
                    className={`text-gray-600 transition-all duration-300 ${isSticky ? 'text-xs hidden sm:inline' : 'text-sm'
                      }`}
                  >
                    {username}
                  </span>
                )}
                <button
                  onClick={logout}
                  className={`font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-all duration-200 ${isSticky ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'
                    }`}
                >
                  {t('signOut')}
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className={`font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-all duration-200 ${isSticky ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'
                    }`}
                >
                  {t('signIn')}
                </Link>
                <Link
                  href="/signup"
                  className={`font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-all duration-200 ${isSticky ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'
                    }`}
                >
                  {t('signUp')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
