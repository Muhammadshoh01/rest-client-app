import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import HistoryPageClient from './HistoryPageClient';

export default async function HistoryPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  return <HistoryPageClient user={user} />;
}
