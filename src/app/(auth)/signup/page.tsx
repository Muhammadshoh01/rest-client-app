"use client";

import { useState } from "react";
import { signup } from "../login/actions";
import Link from "next/link";

const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export default function SignupForm() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <form
                action={async (formData) => {
                    setError(null);

                    const password = formData.get("password") as string;
                    if (!passwordRegex.test(password)) {
                        setError(
                            "Password must be at least 8 chars, include letter, digit, special character."
                        );
                        return;
                    }

                    setLoading(true);
                    try {
                        await signup(formData);
                    } catch (err: unknown) {
                        if (err instanceof Error) {
                            setError(err.message || "Signup failed");
                        }
                        setLoading(false);
                    }
                }}
                className="w-full max-w-sm rounded-xl bg-white p-6 shadow-md"
            >
                <h1 className="mb-4 text-xl font-bold">Sign Up</h1>

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
                    {loading ? "Signing up..." : "Sign Up"}
                </button>

                <p className="mt-4 text-sm">
                    Already have an account?{" "}
                    <Link href="/login" className="text-blue-600 hover:underline">
                        Login
                    </Link>
                </p>
            </form>
        </div>
    );
}
