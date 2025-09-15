'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { encodeBase64, decodeBase64 } from '@/utils/functions';
import { Header, RequestData, ResponseData } from '@/types/rest-client';
import { HTTP_METHODS } from '@/utils/constants/vars';

import RequestForm from './RequestForm';
import TabNavigation from './TabNavigation';
import RequestBodyTab from './RequestBodyTab';
import HeadersTab from './HeadersTab';
import CodeTab from './CodeTab';
import ResponseSection from './ResponseSection';

function getInitialRequestFromUrl(pathname: string, searchParams: URLSearchParams): RequestData {
    console.log("🔍 Parsing URL - pathname:", pathname);
    console.log("🔍 Parsing URL - searchParams:", Array.from(searchParams.entries()));

    const pathParts = pathname.split('/').filter(Boolean);
    console.log("🔍 Path parts:", pathParts);

    if (pathParts.length >= 2 && pathParts[0] === 'rest-client') {
        const method = pathParts[1];
        const encodedUrl = pathParts[2];
        const encodedBody = pathParts[3];

        console.log("🔍 Extracted - method:", method, "encodedUrl:", encodedUrl, "encodedBody:", encodedBody);

        if (HTTP_METHODS.includes(method.toUpperCase())) {
            try {
                const decodedUrl = encodedUrl ? decodeBase64(encodedUrl) : '';
                const decodedBody = encodedBody ? decodeBase64(encodedBody) : '';

                console.log("🔍 Decoded - URL:", decodedUrl, "Body:", decodedBody);

                const urlHeaders: Header[] = [];
                let headerId = 1;

                searchParams.forEach((value, key) => {
                    urlHeaders.push({
                        id: headerId.toString(),
                        key: key,
                        value: decodeURIComponent(value),
                        enabled: true
                    });
                    headerId++;
                });

                if (urlHeaders.length === 0) {
                    urlHeaders.push({ id: '1', key: '', value: '', enabled: true });
                }

                console.log("🔍 Final parsed request:", {
                    method: method.toUpperCase(),
                    url: decodedUrl,
                    body: decodedBody,
                    headers: urlHeaders
                });

                return {
                    method: method.toUpperCase(),
                    url: decodedUrl,
                    headers: urlHeaders,
                    body: decodedBody
                };
            } catch (error) {
                console.error("❌ Error decoding URL parts:", error);
            }
        } else {
            console.log("🔍 Method not in HTTP_METHODS:", method);
        }
    } else {
        console.log("🔍 Not a rest-client route or insufficient path parts");
    }

    console.log("🔍 Returning default request");
    return {
        method: 'GET',
        url: '',
        headers: [{ id: '1', key: '', value: '', enabled: true }],
        body: ''
    };
}

let globalResponse: ResponseData | null = null;
let globalRequest: RequestData | null = null;

export default function RestClient({ user }: { user: User }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const renderCount = useRef(0);
    const hasInitialized = useRef(false);

    renderCount.current++;
    console.log(`🔄 RestClient render #${renderCount.current}`);

    const [request, setRequest] = useState<RequestData>(() => {
        if (globalRequest) {
            console.log("🔄 Restoring request from global state");
            return globalRequest;
        }
        console.log("🚀 Initializing request state from URL");
        const initialRequest = getInitialRequestFromUrl(pathname, searchParams);
        globalRequest = initialRequest;
        return initialRequest;
    });

    const [response, setResponse] = useState<ResponseData | null>(() => {
        if (globalResponse) {
            console.log("🔄 Restoring response from global state");
            return globalResponse;
        }
        console.log("🚀 Initializing response state to null");
        return null;
    });

    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'body' | 'headers' | 'code'>('body');
    const [selectedLanguage, setSelectedLanguage] = useState('curl');
    const [bodyFormat, setBodyFormat] = useState<'json' | 'text'>('json');

    useEffect(() => {
        hasInitialized.current = true;
    }, []);

    useEffect(() => {
        globalRequest = request;
    }, [request]);

    useEffect(() => {
        globalResponse = response;
    }, [response]);

    console.log(`📊 Current response state:`, response ? 'HAS_RESPONSE' : 'NULL');

    const updateUrl = (requestData: RequestData) => {
        console.log("🔗 Updating URL...");
        if (!requestData.url.trim()) {
            return;
        }

        const encodedUrl = encodeBase64(requestData.url);
        const encodedBody = requestData.body.trim() ? encodeBase64(requestData.body) : '';

        let path = `/rest-client/${requestData.method}/${encodedUrl}`;
        if (encodedBody) {
            path += `/${encodedBody}`;
        }

        const queryParams = new URLSearchParams();
        requestData.headers
            .filter(h => h.enabled && h.key.trim() && h.value.trim())
            .forEach(h => {
                queryParams.append(h.key, h.value);
            });

        const queryString = queryParams.toString();
        const fullUrl = queryString ? `${path}?${queryString}` : path;

        console.log("🔗 New URL:", fullUrl);
        router.replace(fullUrl, { scroll: false });
    };

    const executeRequest = async () => {
        console.log("🚀 Starting request execution...");

        if (!request.url.trim()) {
            alert('Please enter a URL');
            return;
        }

        setResponse(null);
        globalResponse = null;

        setIsLoading(true);
        const startTime = Date.now();

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000);

            const headers: Record<string, string> = {};
            request.headers
                .filter(h => h.enabled && h.key.trim() && h.value.trim())
                .forEach(h => {
                    headers[h.key] = h.value;
                });

            const fetchOptions: RequestInit = {
                method: request.method,
                headers,
                signal: controller.signal,
                mode: 'cors'
            };

            if (['POST', 'PUT', 'PATCH'].includes(request.method) && request.body.trim()) {
                fetchOptions.body = request.body;
            }

            console.log("📡 Making fetch request...");
            const response = await fetch(request.url, fetchOptions);
            clearTimeout(timeoutId);

            const responseText = await response.text();
            const endTime = Date.now();

            const responseHeaders: Record<string, string> = {};
            response.headers.forEach((value, key) => {
                responseHeaders[key] = value;
            });

            const newResponse = {
                status: response.status,
                statusText: response.statusText,
                headers: responseHeaders,
                body: responseText,
                time: endTime - startTime
            };

            console.log(`✅ Setting response:`, {
                status: newResponse.status,
                bodyLength: newResponse.body.length
            });

            setResponse(newResponse);
            globalResponse = newResponse;

            console.log("🔗 About to update URL...");
            updateUrl(request);
            console.log("🔗 URL update completed");

        } catch (error) {
            const endTime = Date.now();
            const errorMessage = error instanceof Error ? error.message : 'Request failed';

            const errorResponse = {
                status: 0,
                statusText: 'Network Error',
                headers: {},
                body: `Error: ${errorMessage}`,
                time: endTime - startTime
            };

            console.log(`❌ Setting error response`);
            setResponse(errorResponse);
            globalResponse = errorResponse;
            updateUrl(request);
        } finally {
            setIsLoading(false);
            console.log("🏁 Request execution completed");
        }
    };

    const addHeader = () => {
        const newHeaders = [...request.headers, {
            id: Date.now().toString(),
            key: '',
            value: '',
            enabled: true
        }];
        setRequest({ ...request, headers: newHeaders });
    };

    const updateHeader = (id: string, field: 'key' | 'value' | 'enabled', value: string | boolean) => {
        const newHeaders = request.headers.map(h =>
            h.id === id ? { ...h, [field]: value } : h
        );
        setRequest({ ...request, headers: newHeaders });
    };

    const removeHeader = (id: string) => {
        const newHeaders = request.headers.filter(h => h.id !== id);
        if (newHeaders.length === 0) {
            newHeaders.push({ id: Date.now().toString(), key: '', value: '', enabled: true });
        }
        setRequest({ ...request, headers: newHeaders });
    };

    const headerCount = request.headers.filter(h => h.enabled && h.key && h.value).length;

    return (
        <div className="bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">REST Client</h1>
                    <p className="mt-2 text-gray-600">
                        Build, test, and debug your REST API requests
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow-lg border border-gray-200 mb-6">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">Request</h2>
                            <div className="flex items-center space-x-2">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    Ready
                                </span>
                            </div>
                        </div>

                        <RequestForm
                            method={request.method}
                            url={request.url}
                            isLoading={isLoading}
                            onMethodChange={(method) => setRequest({ ...request, method })}
                            onUrlChange={(url) => setRequest({ ...request, url })}
                            onExecute={executeRequest}
                        />

                        <div className="border-b border-gray-200 mt-6 mb-6">
                            <nav className="-mb-px flex space-x-8">
                                <TabNavigation
                                    activeTab={activeTab}
                                    onTabChange={setActiveTab}
                                    headerCount={headerCount}
                                />
                            </nav>
                        </div>

                        <div className="mt-6">
                            {activeTab === 'body' && (
                                <div className="space-y-4">
                                    <RequestBodyTab
                                        body={request.body}
                                        bodyFormat={bodyFormat}
                                        onBodyChange={(body) => setRequest({ ...request, body })}
                                        onFormatChange={setBodyFormat}
                                    />
                                </div>
                            )}

                            {activeTab === 'headers' && (
                                <div className="space-y-4">
                                    <HeadersTab
                                        headers={request.headers}
                                        onAddHeader={addHeader}
                                        onUpdateHeader={updateHeader}
                                        onRemoveHeader={removeHeader}
                                    />
                                </div>
                            )}

                            {activeTab === 'code' && (
                                <div className="space-y-4">
                                    <CodeTab
                                        request={request}
                                        selectedLanguage={selectedLanguage}
                                        onLanguageChange={setSelectedLanguage}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {response && (
                    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-gray-900">Response</h2>
                                <div className="flex items-center space-x-2">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${response.status >= 200 && response.status < 300
                                        ? 'bg-green-100 text-green-800'
                                        : response.status >= 400
                                            ? 'bg-red-100 text-red-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {response.status}
                                    </span>
                                </div>
                            </div>
                            <ResponseSection response={response} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}