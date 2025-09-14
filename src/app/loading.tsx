export default function Loading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center space-y-6">
                <div className="flex justify-center">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-indigo-200 rounded-full animate-spin"></div>
                        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-indigo-600 rounded-full animate-spin"></div>
                    </div>
                </div>

                <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Loading...
                    </h2>
                    <p className="text-gray-600">
                        Please wait while we prepare your content
                    </p>
                </div>

                <div className="flex justify-center space-x-1">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
            </div>
        </div>
    );
}