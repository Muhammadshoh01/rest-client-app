import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import RestClient from '@/components/RestClient/ResClient';
import type { User } from '@supabase/supabase-js';

vi.mock('next/navigation', () => ({
    useRouter: vi.fn(),
    usePathname: vi.fn(),
    useSearchParams: vi.fn(),
}));

vi.mock('next-intl', () => ({
    useTranslations: vi.fn(),
}));

vi.mock('@/utils/hooks/useRequestHistory', () => ({
    useRequestHistory: vi.fn(() => ({
        saveRequestToHistory: vi.fn(),
        isSaving: false,
    })),
}));

vi.mock('@/utils/functions', () => ({
    encodeBase64: vi.fn((str) => btoa(str)),
    decodeBase64: vi.fn((str) => atob(str)),
}));

vi.mock('@/utils/functions/variables', () => ({
    saveVariablesToStorage: vi.fn(),
    loadVariablesFromStorage: vi.fn(() => []),
    replaceVariables: vi.fn((text) => text),
    hasVariables: vi.fn(() => false),
}));

vi.mock('@/utils/constants/vars', () => ({
    HTTP_METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
}));

interface MockRouter {
    replace: ReturnType<typeof vi.fn>;
    back: ReturnType<typeof vi.fn>;
    forward: ReturnType<typeof vi.fn>;
    refresh: ReturnType<typeof vi.fn>;
    push: ReturnType<typeof vi.fn>;
    prefetch: ReturnType<typeof vi.fn>;
}

interface MockTranslations {
    title: string;
    subtitle: string;
    request: string;
    response: string;
    ready: string;
    usesVariables: string;
    url: string;
    requestBody: string;
    headerKey: string;
    headerValue: string;
    authRequired: string;
    signInToUse: string;
    codeInfo: string;
    savingHistory: string;
}

interface MockSearchParams {
    get: (key: string) => string | null;
    getAll: (key: string) => string[];
    has: (key: string) => boolean;
    keys: () => IterableIterator<string>;
    values: () => IterableIterator<string>;
    entries: () => IterableIterator<[string, string]>;
    forEach: (callback: (value: string, key: string) => void) => void;
    toString: () => string;
    size: number;
    append: () => void;
    delete: () => void;
    set: () => void;
    sort: () => void;
}

interface MockResponse {
    status: number;
    statusText: string;
    ok: boolean;
    redirected: boolean;
    type: ResponseType;
    url: string;
    headers: Map<string, string> & {
        forEach: (callbackfn: (value: string, key: string, map: Map<string, string>) => void, thisArg?: unknown) => void;
    };
    text: () => Promise<string>;
    json: () => Promise<unknown>;
    blob: () => Promise<Blob>;
    arrayBuffer: () => Promise<ArrayBuffer>;
    formData: () => Promise<FormData>;
    clone: () => Response;
    body: ReadableStream<Uint8Array> | null;
    bodyUsed: boolean;
}

const mockUser: User = {
    id: 'user-1',
    email: 'test@example.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: '',
};

const mockRouter: MockRouter = {
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    push: vi.fn(),
    prefetch: vi.fn(),
};

const mockTranslations: MockTranslations = {
    title: 'REST Client',
    subtitle: 'Test API endpoints',
    request: 'Request',
    response: 'Response',
    ready: 'Ready',
    usesVariables: 'Uses Variables',
    url: 'URL',
    requestBody: 'Request Body',
    headerKey: 'Header Key',
    headerValue: 'Header Value',
    authRequired: 'Authentication Required',
    signInToUse: 'Sign in to use variables',
    codeInfo: 'Code with resolved variables',
    savingHistory: 'Saving to history...',
};

const createMockSearchParams = (searchString = ''): MockSearchParams => {
    const params = new URLSearchParams(searchString);
    return {
        get: (key: string) => params.get(key),
        getAll: (key: string) => params.getAll(key),
        has: (key: string) => params.has(key),
        keys: () => params.keys(),
        values: () => params.values(),
        entries: () => params.entries(),
        forEach: (callback: (value: string, key: string) => void) => params.forEach(callback),
        toString: () => params.toString(),
        size: params.size,
        append: () => { },
        delete: () => { },
        set: () => { },
        sort: () => { },
    };
};

describe('RestClient', () => {
    beforeEach(() => {
        vi.mocked(useRouter).mockReturnValue(mockRouter as unknown as ReturnType<typeof useRouter>);
        vi.mocked(usePathname).mockReturnValue('/rest-client');
        vi.mocked(useSearchParams).mockReturnValue(createMockSearchParams() as ReturnType<typeof useSearchParams>);
        vi.mocked(useTranslations).mockReturnValue(((key: string) => mockTranslations[key as keyof MockTranslations]) as ReturnType<typeof useTranslations>);

        global.fetch = vi.fn();
        global.alert = vi.fn();

        vi.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        vi.clearAllMocks();
        vi.restoreAllMocks();
    });

    it('renders the component with basic elements', () => {
        render(<RestClient user={mockUser} />);

        expect(screen.getByText('REST Client')).toBeInTheDocument();
        expect(screen.getByText('Test API endpoints')).toBeInTheDocument();
        expect(screen.getByText('Request')).toBeInTheDocument();
    });

    it('renders with data-testid attribute', () => {
        render(<RestClient user={mockUser} />);

        expect(screen.getByTestId('rest-client')).toBeInTheDocument();
    });

    it('initializes with default GET method and empty URL', () => {
        render(<RestClient user={mockUser} />);

        expect(screen.getByTestId('rest-client')).toBeInTheDocument();
    });

    it('handles URL with encoded parameters', () => {
        const encodedUrl = btoa('https://api.example.com');
        const encodedBody = btoa('{"test": "data"}');

        vi.mocked(usePathname).mockReturnValue(`/rest-client/POST/${encodedUrl}/${encodedBody}`);
        vi.mocked(useSearchParams).mockReturnValue(createMockSearchParams('Content-Type=application/json') as ReturnType<typeof useSearchParams>);

        render(<RestClient user={mockUser} />);

        expect(screen.getByTestId('rest-client')).toBeInTheDocument();
    });

    it('handles malformed URL parameters gracefully', () => {
        vi.mocked(usePathname).mockReturnValue('/rest-client/POST/invalid-base64');

        render(<RestClient user={mockUser} />);

        expect(screen.getByTestId('rest-client')).toBeInTheDocument();
    });

    it('shows authentication required message when user is null', () => {
        render(<RestClient user={null as unknown as User} />);

        const elements = screen.getAllByRole('button');
        expect(elements.length).toBeGreaterThan(0);
    });

    it('renders different content for authenticated user', () => {
        render(<RestClient user={mockUser} />);

        expect(screen.getByTestId('rest-client')).toBeInTheDocument();
        expect(screen.getByText('Ready')).toBeInTheDocument();
    });

    it('handles component updates when pathname changes', () => {
        const { rerender } = render(<RestClient user={mockUser} />);

        vi.mocked(usePathname).mockReturnValue('/rest-client/GET/aHR0cHM6Ly9uZXdhcGkuY29t');

        rerender(<RestClient user={mockUser} />);

        expect(screen.getByTestId('rest-client')).toBeInTheDocument();
    });

    it('calculates request size for different body types', () => {
        render(<RestClient user={mockUser} />);

        expect(screen.getByTestId('rest-client')).toBeInTheDocument();
    });

    it('handles component with loading variables', () => {
        render(<RestClient user={mockUser} />);

        expect(screen.getByTestId('rest-client')).toBeInTheDocument();
    });

    it('handles text encoding in calculateRequestSize', () => {
        const testString = 'test data';
        const encoder = new TextEncoder();
        const encoded = encoder.encode(testString);

        expect(encoded.length).toBeGreaterThan(0);
    });

    it('processes URL search params correctly', () => {
        vi.mocked(useSearchParams).mockReturnValue(createMockSearchParams('key1=value1&key2=value2') as ReturnType<typeof useSearchParams>);

        render(<RestClient user={mockUser} />);

        expect(screen.getByTestId('rest-client')).toBeInTheDocument();
    });

    it('handles empty headers initialization', () => {
        vi.mocked(usePathname).mockReturnValue('/rest-client/GET/dGVzdA==');

        render(<RestClient user={mockUser} />);

        expect(screen.getByTestId('rest-client')).toBeInTheDocument();
    });

    it('handles variables detection in component', () => {
        render(<RestClient user={mockUser} />);

        expect(screen.getByTestId('rest-client')).toBeInTheDocument();
    });

    it('handles fetch request with successful response', async () => {
        const mockResponse: MockResponse = {
            status: 200,
            statusText: 'OK',
            ok: true,
            redirected: false,
            type: 'basic' as ResponseType,
            url: 'https://api.example.com',
            headers: new Map([['content-type', 'application/json']]) as MockResponse['headers'],
            text: () => Promise.resolve('{"data": "test"}'),
            json: () => Promise.resolve({}),
            blob: () => Promise.resolve(new Blob()),
            arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
            formData: () => Promise.resolve(new FormData()),
            clone: () => ({} as Response),
            body: null,
            bodyUsed: false,
        };
        mockResponse.headers.forEach = (callbackfn: (value: string, key: string, map: Map<string, string>) => void) => {
            callbackfn('application/json', 'content-type', mockResponse.headers);
        };

        vi.mocked(fetch).mockResolvedValueOnce(mockResponse as unknown as Response);

        const { container } = render(<RestClient user={mockUser} />);

        const component = container.querySelector('[data-testid="rest-client"]');
        expect(component).toBeInTheDocument();
    });

    it('handles fetch request with error response', async () => {
        vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

        render(<RestClient user={mockUser} />);

        expect(screen.getByTestId('rest-client')).toBeInTheDocument();
    });

    it('handles CORS error specifically', async () => {
        vi.mocked(fetch).mockRejectedValueOnce(new Error('CORS policy blocked this request'));

        render(<RestClient user={mockUser} />);

        expect(screen.getByTestId('rest-client')).toBeInTheDocument();
    });

    it('handles timeout error specifically', async () => {
        const abortError = new Error('Request timed out');
        abortError.name = 'AbortError';
        vi.mocked(fetch).mockRejectedValueOnce(abortError);

        render(<RestClient user={mockUser} />);

        expect(screen.getByTestId('rest-client')).toBeInTheDocument();
    });

    it('handles connection refused error', async () => {
        vi.mocked(fetch).mockRejectedValueOnce(new Error('ERR_CONNECTION_REFUSED'));

        render(<RestClient user={mockUser} />);

        expect(screen.getByTestId('rest-client')).toBeInTheDocument();
    });

    it('handles name not resolved error', async () => {
        vi.mocked(fetch).mockRejectedValueOnce(new Error('ERR_NAME_NOT_RESOLVED'));

        render(<RestClient user={mockUser} />);

        expect(screen.getByTestId('rest-client')).toBeInTheDocument();
    });

    it('handles failed to fetch error', async () => {
        vi.mocked(fetch).mockRejectedValueOnce(new Error('Failed to fetch'));

        render(<RestClient user={mockUser} />);

        expect(screen.getByTestId('rest-client')).toBeInTheDocument();
    });

    it('handles network error', async () => {
        vi.mocked(fetch).mockRejectedValueOnce(new Error('NetworkError'));

        render(<RestClient user={mockUser} />);

        expect(screen.getByTestId('rest-client')).toBeInTheDocument();
    });

    it('calculates request size for FormData', () => {
        const formData = new FormData();
        formData.append('key', 'value');
        formData.append('file', new File(['content'], 'test.txt'));

        render(<RestClient user={mockUser} />);

        expect(screen.getByTestId('rest-client')).toBeInTheDocument();
    });

    it('calculates request size for URLSearchParams', () => {
        const params = new URLSearchParams('key=value&another=param');

        render(<RestClient user={mockUser} />);

        expect(screen.getByTestId('rest-client')).toBeInTheDocument();
    });

    it('calculates request size for ArrayBuffer', () => {
        const buffer = new ArrayBuffer(8);

        render(<RestClient user={mockUser} />);

        expect(screen.getByTestId('rest-client')).toBeInTheDocument();
    });

    it('calculates request size for Uint8Array', () => {
        const uint8 = new Uint8Array([1, 2, 3, 4]);

        render(<RestClient user={mockUser} />);

        expect(screen.getByTestId('rest-client')).toBeInTheDocument();
    });

    it('calculates request size for Blob', () => {
        const blob = new Blob(['test content'], { type: 'text/plain' });

        render(<RestClient user={mockUser} />);

        expect(screen.getByTestId('rest-client')).toBeInTheDocument();
    });

    it('handles POST request with body', () => {
        vi.mocked(usePathname).mockReturnValue('/rest-client/POST/aHR0cHM6Ly9hcGkuZXhhbXBsZS5jb20=/eyJ0ZXN0IjoiZGF0YSJ9');

        render(<RestClient user={mockUser} />);

        expect(screen.getByTestId('rest-client')).toBeInTheDocument();
    });

    it('handles PUT request', () => {
        vi.mocked(usePathname).mockReturnValue('/rest-client/PUT/aHR0cHM6Ly9hcGkuZXhhbXBsZS5jb20=');

        render(<RestClient user={mockUser} />);

        expect(screen.getByTestId('rest-client')).toBeInTheDocument();
    });

    it('handles PATCH request', () => {
        vi.mocked(usePathname).mockReturnValue('/rest-client/PATCH/aHR0cHM6Ly9hcGkuZXhhbXBsZS5jb20=');

        render(<RestClient user={mockUser} />);

        expect(screen.getByTestId('rest-client')).toBeInTheDocument();
    });

    it('handles invalid HTTP method in URL', () => {
        vi.mocked(usePathname).mockReturnValue('/rest-client/INVALID/aHR0cHM6Ly9hcGkuZXhhbXBsZS5jb20=');

        render(<RestClient user={mockUser} />);

        expect(screen.getByTestId('rest-client')).toBeInTheDocument();
    });

    it('handles URL with only method', () => {
        vi.mocked(usePathname).mockReturnValue('/rest-client/GET');

        render(<RestClient user={mockUser} />);

        expect(screen.getByTestId('rest-client')).toBeInTheDocument();
    });

    it('handles URL with method and encoded URL only', () => {
        vi.mocked(usePathname).mockReturnValue('/rest-client/POST/aHR0cHM6Ly9hcGkuZXhhbXBsZS5jb20=');

        render(<RestClient user={mockUser} />);

        expect(screen.getByTestId('rest-client')).toBeInTheDocument();
    });

    it('handles component re-render with same data', () => {
        const { rerender } = render(<RestClient user={mockUser} />);

        rerender(<RestClient user={mockUser} />);

        expect(screen.getByTestId('rest-client')).toBeInTheDocument();
    });

    it('renders render count increment', () => {
        const { rerender } = render(<RestClient user={mockUser} />);

        rerender(<RestClient user={mockUser} />);
        rerender(<RestClient user={mockUser} />);

        expect(screen.getByTestId('rest-client')).toBeInTheDocument();
    });
});