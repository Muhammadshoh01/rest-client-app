'use client';

import { useState, useEffect, lazy, Suspense } from 'react';
import { User } from '@supabase/supabase-js';
import { Variable } from '@/types/rest-client';
import {
    saveVariablesToStorage,
    loadVariablesFromStorage,
    findVariablesInText
} from '@/utils/functions/variables';

const VariablesTab = lazy(() => import('@/components/variable/VariableTab'));

interface VariablesPageProps {
    user: User;
}

export default function VariablesPage({ user }: VariablesPageProps) {
    const [variables, setVariables] = useState<Variable[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (user) {
            console.log("🔄 Loading variables from localStorage");
            const savedVariables = loadVariablesFromStorage();
            setVariables(savedVariables);
            setIsLoaded(true);
        }
    }, [user]);

    useEffect(() => {
        if (user && isLoaded) {
            console.log("💾 Saving variables to localStorage");
            saveVariablesToStorage(variables);
        }
    }, [variables, user, isLoaded]);

    const addVariable = () => {
        const newVariable: Variable = {
            id: Date.now().toString(),
            name: '',
            value: '',
            description: '',
            enabled: true
        };
        setVariables([...variables, newVariable]);
    };

    const updateVariable = (id: string, field: 'name' | 'value' | 'description' | 'enabled', value: string | boolean) => {
        const newVariables = variables.map(v =>
            v.id === id ? { ...v, [field]: value } : v
        );
        setVariables(newVariables);
    };

    const removeVariable = (id: string) => {
        const newVariables = variables.filter(v => v.id !== id);
        setVariables(newVariables);
    };

    const importVariables = (importedVariables: Variable[]) => {
        setVariables([...variables, ...importedVariables]);
    };

    const exportVariables = () => {
    };

    const enabledVariablesCount = variables.filter(v => v.enabled && v.name && v.value).length;
    const totalVariablesCount = variables.length;

    if (!isLoaded) {
        return (
            <div className="bg-gray-50 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Variables</h1>
                            <p className="mt-2 text-gray-600">
                                Manage environment variables and reusable values for your API requests
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <div className="text-sm text-gray-500">Total Variables</div>
                                <div className="text-2xl font-bold text-gray-900">{totalVariablesCount}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-gray-500">Active Variables</div>
                                <div className="text-2xl font-bold text-green-600">{enabledVariablesCount}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {totalVariablesCount > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <dt className="text-sm font-medium text-gray-500 truncate">Total Variables</dt>
                                    <dd className="text-lg font-semibold text-gray-900">{totalVariablesCount}</dd>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <dt className="text-sm font-medium text-gray-500 truncate">Active Variables</dt>
                                    <dd className="text-lg font-semibold text-green-600">{enabledVariablesCount}</dd>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <dt className="text-sm font-medium text-gray-500 truncate">Stored Locally</dt>
                                    <dd className="text-lg font-semibold text-gray-600">Secure</dd>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-lg border border-gray-200">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">Manage Variables</h2>
                            <div className="flex items-center space-x-2">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    Private & Secure
                                </span>
                            </div>
                        </div>

                        <Suspense fallback={
                            <div className="flex justify-center items-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            </div>
                        }>
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
                </div>

                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3 flex-1">
                            <h3 className="text-sm font-medium text-blue-800">
                                How to use variables
                            </h3>
                            <div className="mt-2 text-sm text-blue-700">
                                <ul className="space-y-1">
                                    <li>• Use <code className="bg-blue-100 px-1 rounded">{`{{variableName}}`}</code> syntax to reference variables</li>
                                    <li>• Variables work in URLs, headers, and request bodies</li>
                                    <li>• All variables are stored locally in your browser</li>
                                    <li>• Use Import/Export to share variable sets with your team</li>
                                    <li>• Disabled variables won't be replaced in requests</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {totalVariablesCount === 0 && (
                    <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Common Variable Examples</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-2">API Configuration</h4>
                                <div className="space-y-2 text-sm">
                                    <div><code className="bg-gray-100 px-2 py-1 rounded">BASE_URL = https://api.example.com</code></div>
                                    <div><code className="bg-gray-100 px-2 py-1 rounded">API_KEY = your-secret-key</code></div>
                                    <div><code className="bg-gray-100 px-2 py-1 rounded">VERSION = v1</code></div>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Dynamic Values</h4>
                                <div className="space-y-2 text-sm">
                                    <div><code className="bg-gray-100 px-2 py-1 rounded">USER_ID = 12345</code></div>
                                    <div><code className="bg-gray-100 px-2 py-1 rounded">ENVIRONMENT = staging</code></div>
                                    <div><code className="bg-gray-100 px-2 py-1 rounded">TOKEN = bearer-token-value</code></div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4">
                            <button
                                onClick={addVariable}
                                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                            >
                                Create your first variable →
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}