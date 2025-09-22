'use client';

import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { encodeBase64, decodeBase64 } from '@/utils/functions';
import {
  Header,
  RequestData,
  ResponseData,
  Variable,
} from '@/types/rest-client';
import { HTTP_METHODS } from '@/utils/constants/vars';
import {
  saveVariablesToStorage,
  loadVariablesFromStorage,
  replaceVariables,
  hasVariables,
} from '@/utils/functions/variables';
import { useRequestHistory } from '@/utils/hooks/useRequestHistory';

import RequestForm from './RequestForm';
import TabNavigation from './TabNavigation';
import RequestBodyTab from './RequestBodyTab';
import HeadersTab from './HeadersTab';
import CodeTab from './CodeTab';
import ResponseSection from './ResponseSection';
import VariablePreview from '@/components/variable/variablePreview';
import { useTranslations } from 'next-intl';

const VariablesTab = lazy(() => import('@/components/variable/VariableTab'));

function calculateRequestSize(body: BodyInit | null | undefined): number {
  if (!body) return 0;

  if (typeof body === 'string') {
    return new TextEncoder().encode(body).length;
  }

  if (body instanceof FormData) {
    let size = 0;
    for (const [key, value] of body) {
      size += new TextEncoder().encode(key).length;
      if (typeof value === 'string') {
        size += new TextEncoder().encode(value).length;
      } else if (value instanceof File) {
        size += value.size;
      }
    }
    return size;
  }

  if (body instanceof URLSearchParams) {
    return new TextEncoder().encode(body.toString()).length;
  }

  if (body instanceof ArrayBuffer) {
    return body.byteLength;
  }

  if (body instanceof Uint8Array) {
    return body.length;
  }

  if (body instanceof Blob) {
    return body.size;
  }

  return new TextEncoder().encode(String(body)).length;
}

function getInitialRequestFromUrl(
  pathname: string,
  searchParams: URLSearchParams
): RequestData {

  const pathParts = pathname.split('/').filter(Boolean);

  if (pathParts.length >= 2 && pathParts[0] === 'rest-client') {
    const method = pathParts[1];
    const encodedUrl = pathParts[2];
    const encodedBody = pathParts[3];

    if (HTTP_METHODS.includes(method.toUpperCase())) {
      try {
        const decodedUrl = encodedUrl ? decodeBase64(encodedUrl) : '';
        const decodedBody = encodedBody ? decodeBase64(encodedBody) : '';

        const urlHeaders: Header[] = [];
        let headerId = 1;

        searchParams.forEach((value, key) => {
          urlHeaders.push({
            id: headerId.toString(),
            key: key,
            value: decodeURIComponent(value),
            enabled: true,
          });
          headerId++;
        });

        if (urlHeaders.length === 0) {
          urlHeaders.push({ id: '1', key: '', value: '', enabled: true });
        }

        return {
          method: method.toUpperCase(),
          url: decodedUrl,
          headers: urlHeaders,
          body: decodedBody,
        };
      } catch (error) {
      }
    }
  }

  return {
    method: 'GET',
    url: '',
    headers: [{ id: '1', key: '', value: '', enabled: true }],
    body: '',
  };
}

let globalResponse: ResponseData | null = null;
let globalRequest: RequestData | null = null;
let globalVariables: Variable[] = [];

export default function RestClient({ user }: { user: User }) {
  const t = useTranslations('RestClient');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const renderCount = useRef(0);
  const hasInitialized = useRef(false);
  const variablesLoaded = useRef(false);

  renderCount.current++;

  const [request, setRequest] = useState<RequestData>(() => {
    if (globalRequest) {
      return globalRequest;
    }
    const initialRequest = getInitialRequestFromUrl(pathname, searchParams);
    globalRequest = initialRequest;
    return initialRequest;
  });

  const [response, setResponse] = useState<ResponseData | null>(() => {
    if (globalResponse) {
      return globalResponse;
    }
    return null;
  });

  const [variables, setVariables] = useState<Variable[]>(() => {
    return globalVariables;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'body' | 'headers' | 'variables' | 'code'
  >('body');
  const [selectedLanguage, setSelectedLanguage] = useState('curl');
  const [bodyFormat, setBodyFormat] = useState<'json' | 'text'>('json');
  const { saveRequestToHistory, isSaving: isSavingToHistory } =
    useRequestHistory(user);

  useEffect(() => {
    if (user && !variablesLoaded.current) {
      const savedVariables = loadVariablesFromStorage();
      setVariables(savedVariables);
      globalVariables = savedVariables;
      variablesLoaded.current = true;
    }
    hasInitialized.current = true;
  }, [user]);

  useEffect(() => {
    globalRequest = request;
  }, [request]);

  useEffect(() => {
    globalResponse = response;
  }, [response]);

  useEffect(() => {
    if (user && variablesLoaded.current) {
      saveVariablesToStorage(variables);
      globalVariables = variables;
    }
  }, [variables, user]);

  useEffect(() => {
    const newRequest = getInitialRequestFromUrl(pathname, searchParams);

    const isDifferent =
      newRequest.method !== request.method ||
      newRequest.url !== request.url ||
      newRequest.body !== request.body ||
      JSON.stringify(newRequest.headers) !== JSON.stringify(request.headers);

    if (isDifferent) {
      setRequest(newRequest);
      globalRequest = newRequest;

      setResponse(null);
      globalResponse = null;
    }
  }, [pathname, searchParams]);

  const updateUrl = (requestData: RequestData) => {
    if (!requestData.url.trim()) {
      return;
    }

    const encodedUrl = encodeBase64(requestData.url);
    const encodedBody = requestData.body.trim()
      ? encodeBase64(requestData.body)
      : '';

    let path = `/rest-client/${requestData.method}/${encodedUrl}`;
    if (encodedBody) {
      path += `/${encodedBody}`;
    }

    const queryParams = new URLSearchParams();
    requestData.headers
      .filter((h) => h.enabled && h.key.trim() && h.value.trim())
      .forEach((h) => {
        queryParams.append(h.key, h.value);
      });

    const queryString = queryParams.toString();
    const fullUrl = queryString ? `${path}?${queryString}` : path;

    router.replace(fullUrl, { scroll: false });
  };

  const executeRequest = async () => {
    if (!request.url.trim()) {
      alert('Please enter a URL');
      return;
    }

    setResponse(null);
    globalResponse = null;
    setIsLoading(true);
    const startTime = Date.now();

    let resolvedUrl: string;
    let requestSize = 0;

    const originalError = console.error;
    console.error = () => { };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      resolvedUrl = replaceVariables(request.url, variables);
      const headers: Record<string, string> = {};

      request.headers
        .filter((h) => h.enabled && h.key.trim() && h.value.trim())
        .forEach((h) => {
          const resolvedKey = replaceVariables(h.key, variables);
          const resolvedValue = replaceVariables(h.value, variables);
          headers[resolvedKey] = resolvedValue;
        });

      const fetchOptions: RequestInit = {
        method: request.method,
        headers,
        signal: controller.signal,
        mode: 'cors',
      };

      if (
        ['POST', 'PUT', 'PATCH'].includes(request.method) &&
        request.body.trim()
      ) {
        const resolvedBody = replaceVariables(request.body, variables);
        fetchOptions.body = resolvedBody;
        requestSize = calculateRequestSize(resolvedBody);
      }

      const response = await fetch(resolvedUrl, fetchOptions);

      clearTimeout(timeoutId);
      console.error = originalError;

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
        time: endTime - startTime,
      };

      const responseSize = new TextEncoder().encode(responseText).length;
      await saveRequestToHistory({
        method: request.method,
        url: resolvedUrl,
        headers: request.headers.filter(
          (h) => h.enabled && h.key.trim() && h.value.trim()
        ),
        body: request.body,
        status: response.status,
        duration: endTime - startTime,
        requestSize,
        responseSize,
      });

      setResponse(newResponse);
      globalResponse = newResponse;
      updateUrl(request);
    } catch (error) {

      console.error = originalError;

      const endTime = Date.now();
      let errorStatus = 0;
      let errorStatusText = 'Network Error';
      let errorMessage = 'Request failed';

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorStatus = 408;
          errorStatusText = 'Request Timeout';
          errorMessage = 'Request timed out after 30 seconds';
        } else if (error.message.includes('CORS')) {
          errorStatus = 403;
          errorStatusText = 'Forbidden';
          errorMessage = 'CORS policy blocked this request';
        } else if (error.message.includes('Failed to fetch') ||
          error.message.includes('NetworkError') ||
          error.message.includes('ERR_NAME_NOT_RESOLVED') ||
          error.message.includes('ERR_CONNECTION_REFUSED')) {
          errorStatus = 404;
          errorStatusText = 'Not Found';
          errorMessage = 'The requested resource could not be found or the server is unreachable';
        } else {
          errorMessage = error.message;
        }
      }

      const errorResponse = {
        status: errorStatus,
        statusText: errorStatusText,
        headers: {},
        body: `Error: ${errorMessage}`,
        time: endTime - startTime,
      };

      await saveRequestToHistory({
        method: request.method,
        url: replaceVariables(request.url, variables),
        headers: request.headers.filter(
          (h) => h.enabled && h.key.trim() && h.value.trim()
        ),
        body: request.body,
        status: errorStatus,
        duration: endTime - startTime,
        requestSize,
        responseSize: 0,
        errorDetails: errorMessage,
      });

      setResponse(errorResponse);
      globalResponse = errorResponse;
      updateUrl(request);
    } finally {
      setIsLoading(false);
    }
  };

  const addHeader = () => {
    const newHeaders = [
      ...request.headers,
      {
        id: Date.now().toString(),
        key: '',
        value: '',
        enabled: true,
      },
    ];
    setRequest({ ...request, headers: newHeaders });
  };

  const updateHeader = (
    id: string,
    field: 'key' | 'value' | 'enabled',
    value: string | boolean
  ) => {
    const newHeaders = request.headers.map((h) =>
      h.id === id ? { ...h, [field]: value } : h
    );
    setRequest({ ...request, headers: newHeaders });
  };

  const removeHeader = (id: string) => {
    const newHeaders = request.headers.filter((h) => h.id !== id);
    if (newHeaders.length === 0) {
      newHeaders.push({
        id: Date.now().toString(),
        key: '',
        value: '',
        enabled: true,
      });
    }
    setRequest({ ...request, headers: newHeaders });
  };

  const addVariable = () => {
    const newVariable: Variable = {
      id: Date.now().toString(),
      name: '',
      value: '',
      description: '',
      enabled: true,
    };
    setVariables([...variables, newVariable]);
  };

  const updateVariable = (
    id: string,
    field: 'name' | 'value' | 'description' | 'enabled',
    value: string | boolean
  ) => {
    const newVariables = variables.map((v) =>
      v.id === id ? { ...v, [field]: value } : v
    );
    setVariables(newVariables);
  };

  const removeVariable = (id: string) => {
    const newVariables = variables.filter((v) => v.id !== id);
    setVariables(newVariables);
  };

  const importVariables = (importedVariables: Variable[]) => {
    setVariables([...variables, ...importedVariables]);
  };

  const exportVariables = () => { };

  const headerCount = request.headers.filter(
    (h) => h.enabled && h.key && h.value
  ).length;
  const variableCount = variables.filter(
    (v) => v.enabled && v.name && v.value
  ).length;

  const requestHasVariables =
    hasVariables(request.url) ||
    hasVariables(request.body) ||
    request.headers.some((h) => hasVariables(h.key) || hasVariables(h.value));

  return (
    <div className="bg-gray-50" data-testid="rest-client">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="mt-2 text-gray-600">{t('subtitle')}</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg border border-gray-200 mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {t('request')}
              </h2>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {t('ready')}
                </span>
                {requestHasVariables && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                    {t('usesVariables')}
                  </span>
                )}
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

            {hasVariables(request.url) && (
              <VariablePreview
                text={request.url}
                variables={variables}
                label={t('url')}
                className="mb-4"
              />
            )}

            <div className="border-b border-gray-200 mt-6 mb-6">
              <nav className="-mb-px flex space-x-8">
                <TabNavigation
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  headerCount={headerCount}
                  variableCount={variableCount}
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
                  {hasVariables(request.body) && (
                    <VariablePreview
                      text={request.body}
                      variables={variables}
                      label={t('requestBody')}
                    />
                  )}
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
                  {request.headers.some(
                    (h) => hasVariables(h.key) || hasVariables(h.value)
                  ) && (
                      <div className="space-y-2">
                        {request.headers
                          .filter(
                            (h) => hasVariables(h.key) || hasVariables(h.value)
                          )
                          .map((header) => (
                            <div key={header.id}>
                              {hasVariables(header.key) && (
                                <VariablePreview
                                  text={header.key}
                                  variables={variables}
                                  label={t('headerKey')}
                                />
                              )}
                              {hasVariables(header.value) && (
                                <VariablePreview
                                  text={header.value}
                                  variables={variables}
                                  label={t('headerValue')}
                                />
                              )}
                            </div>
                          ))}
                      </div>
                    )}
                </div>
              )}

              {activeTab === 'variables' && user && (
                <div className="space-y-4">
                  <Suspense
                    fallback={
                      <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                      </div>
                    }
                  >
                    <VariablesTab
                      variables={variables}
                      onAddVariable={addVariable}
                      onUpdateVariable={updateVariable}
                      onRemoveVariable={removeVariable}
                      onImportVariables={importVariables}
                      onExportVariables={exportVariables}
                    />
                  </Suspense>
                </div>
              )}

              {activeTab === 'variables' && !user && (
                <div className="text-center py-8 text-gray-500">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium">
                    {t('authRequired')}
                  </h3>
                  <p className="mt-2">{t('signInToUse')}</p>
                </div>
              )}

              {activeTab === 'code' && (
                <div className="space-y-4">
                  <CodeTab
                    request={{
                      ...request,
                      url: replaceVariables(request.url, variables),
                      body: replaceVariables(request.body, variables),
                      headers: request.headers.map((h) => ({
                        ...h,
                        key: replaceVariables(h.key, variables),
                        value: replaceVariables(h.value, variables),
                      })),
                    }}
                    selectedLanguage={selectedLanguage}
                    onLanguageChange={setSelectedLanguage}
                  />
                  {requestHasVariables && (
                    <div className="text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded p-2">
                      {t('codeInfo')}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {isSavingToHistory && (
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              <span className="text-sm text-blue-700">
                {t('savingHistory')}
              </span>
            </div>
          </div>
        )}

        {response && (
          <div className="bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {t('response')}
                </h2>
                <div className="flex items-center space-x-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${response.status >= 200 && response.status < 300
                      ? 'bg-green-100 text-green-800'
                      : response.status >= 400
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                      }`}
                  >
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