import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import VariablesPage from '@/components/variable/VariablePage';

export const metadata = {
  title: 'Variables | REST Client',
  description:
    'Manage your environment variables and reusable values for API requests',
};

export default async function Variables() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return <VariablesPage user={user} />;
}
