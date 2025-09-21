import { createClient } from '@/utils/supabase/server';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MainPageContent from '@/components/layout/MainPageContent';

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthenticated = !!user;
  const username = user?.email?.split('@')[0] || '';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header isAuthenticated={isAuthenticated} username={username} />
      <MainPageContent isAuthenticated={isAuthenticated} username={username} />
      <Footer />
    </div>
  );
}
