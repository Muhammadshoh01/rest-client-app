import Link from "next/link";

export default function ErrorPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 text-red-500">
                        <svg
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                            />
                        </svg>
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Oops! Something went wrong
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        We encountered an error while processing your request.
                    </p>
                </div>

                <div className="mt-8 space-y-4">
                    <div className="text-center">
                        <p className="text-sm text-gray-500 mb-4">
                            This could be due to:
                        </p>
                        <ul className="text-sm text-gray-600 space-y-1 text-left">
                            <li>• Invalid login credentials</li>
                            <li>• Network connectivity issues</li>
                            <li>• Server temporarily unavailable</li>
                            <li>• Account verification required</li>
                        </ul>
                    </div>

                    <div className="flex flex-col space-y-3">
                        <Link
                            href="/login"
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Back to Login
                        </Link>

                        <Link
                            href="/signup"
                            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Create Account
                        </Link>

                        <Link
                            href="/"
                            className="text-center text-sm text-indigo-600 hover:text-indigo-500"
                        >
                            Go to Homepage
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}