import Link from "next/link";
import { Settings, Clock, Database } from "lucide-react";

interface MainPageContentProps {
  isAuthenticated: boolean;
  username?: string;
}

export default function MainPageContent({
  isAuthenticated,
  username,
}: MainPageContentProps) {
  if (!isAuthenticated) {
    return (
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Welcome!</h1>
            <div className="space-y-4">
              <Link
                href="/login"
                className="w-full inline-flex justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="w-full inline-flex justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back, {username}!
            </h1>
            <p className="text-gray-600">
              Access your REST client and manage your API requests
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Link
            href="/rest-client"
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow group"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4 group-hover:bg-blue-200 transition-colors">
              <Database className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              REST Client
            </h3>
            <p className="text-gray-600 text-sm">
              Test and interact with REST APIs
            </p>
          </Link>

          <Link
            href="/history"
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow group"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4 group-hover:bg-green-200 transition-colors">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              History
            </h3>
            <p className="text-gray-600 text-sm">
              View your previous API requests
            </p>
          </Link>

          <Link
            href="/variables"
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow group"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4 group-hover:bg-purple-200 transition-colors">
              <Settings className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Variables
            </h3>
            <p className="text-gray-600 text-sm">
              Manage your environment variables
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}
