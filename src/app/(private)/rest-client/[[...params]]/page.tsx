import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import RestClientWrapper from "@/components/RestClient/RestClientWrapper";

interface RouteParams {
  params?: string[];
}

export default async function RestClientPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <RestClientWrapper user={user} />;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const resolvedParams = await params;
  const method = resolvedParams.params?.[0]?.toUpperCase() || "REST";

  return {
    title: `${method} Request - REST Client`,
    description: "Make HTTP requests with our powerful REST client tool",
  };
}
