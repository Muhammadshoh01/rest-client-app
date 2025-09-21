import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const username = user?.email?.split('@')[0] || '';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header isAuthenticated={true} username={username} />
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">{children}</main>
      <Footer />
    </div>
  );
}
