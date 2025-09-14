"use client";

import { useState } from "react";
import { login } from "./actions";
import Link from "next/link";

export default function LoginForm() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <form
                action={async (formData) => {
                    setError(null);
                    setLoading(true);

                    try {
                        await login(formData);
                    } catch (err: any) {
                        setError(err.message || "Login failed");
                        setLoading(false);
                    }
                }}
                className="w-full max-w-sm rounded-xl bg-white p-6 shadow-md"
            >
                <h1 className="mb-4 text-xl font-bold">Login</h1>

                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    className="mb-3 w-full rounded border p-2"
                    required
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    className="mb-3 w-full rounded border p-2"
                    required
                />

                {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded bg-blue-600 p-2 text-white hover:bg-blue-700 disabled:bg-gray-400"
                >
                    {loading ? "Logging in..." : "Login"}
                </button>

                <p className="mt-4 text-sm">
                    Don’t have an account?{" "}
                    <Link href="/signup" className="text-blue-600 hover:underline">
                        Sign Up
                    </Link>
                </p>
            </form>
        </div>
    );
}
