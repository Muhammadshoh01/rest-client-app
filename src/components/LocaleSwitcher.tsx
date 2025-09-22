'use client';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useTransition } from 'react';

interface LocaleSwitcherProps {
  isSticky?: boolean;
}

export default function LocaleSwitcher({ isSticky }: LocaleSwitcherProps) {
  const router = useRouter();
  const currentLocale = useLocale();
  const [isPending, startTransition] = useTransition();

  const switchLocale = () => {
    const newLocale = currentLocale === 'en' ? 'ru' : 'en';

    startTransition(() => {
      document.cookie = `locale=${newLocale}; path=/; max-age=${60 * 60 * 24 * 365}`;
      router.refresh();
    });
  };

  return (
    <button
      onClick={switchLocale}
      disabled={isPending}
      className={`font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 ${isSticky ? 'px-2.5 py-1 text-xs' : 'px-3 py-1 text-sm'
        }`}
    >
      {isPending ? '...' : currentLocale.toUpperCase()}
    </button>
  );
}
