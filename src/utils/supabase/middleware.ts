import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
    const supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                get(name) {
                    return request.cookies.get(name)?.value;
                },
                set(name, value, options) {
                    request.cookies.set({ name, value, ...options });
                    supabaseResponse.cookies.set(name, value, options);
                },
                remove(name, options) {
                    request.cookies.set({ name, value: "", ...options });
                    supabaseResponse.cookies.set(name, "", options);
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const isPrivatePage =
        request.nextUrl.pathname.startsWith("/rest-client") ||
        request.nextUrl.pathname === "/";
    const isAuthPage =
        request.nextUrl.pathname.startsWith("/login") ||
        request.nextUrl.pathname.startsWith("/signup");

    if (user && isAuthPage) {
        const url = request.nextUrl.clone();
        url.pathname = "/rest-client";
        return NextResponse.redirect(url);
    }

    if (!user && isPrivatePage) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        return NextResponse.redirect(url);
    }

    return supabaseResponse;
}
