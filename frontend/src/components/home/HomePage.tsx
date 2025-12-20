// Debug mode: set VITE_DEBUG=true in your .env file to enable
import { useState, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { useQuery } from '@tanstack/react-query';
import { ToastContainer, toast } from 'react-toastify';

import SearchBar from '@/components/search/SearchBar';
import SearchResults from '@/components/search/SearchResults';
import useChannel from '@/hooks/useChannel';
import ExampleQuery from '@/examples/ExampleQuery';

import { SUPABASE_ANON_KEY, SUPABASE_FUNCTION_URL, DEV_MODE } from '@/components/common/utils';
import LoadingIndicator from '@/components/search/LoadingIndicator';
import ErrorBoundary from "@/components/common/ErrorBoundary"

if (DEV_MODE) {
    console.log('DEV MODE ACTIVATED', DEV_MODE);
}

const minSearchWordCount = 3;
/**
 * Queries the decode-book API for search results.
 * @param searchTerm - The user's search query (will be trimmed of whitespace).
 * @param channelName - Unique channel for real-time updates.
 * @param setCurrentSearchText - Callback to update loading text.
 * @returns Promise resolving to search results or mock data in dev mode.
 * @throws Error if searchTerm is empty or invalid inputs provided.
 */
async function queryDecodeBook(
    searchTerm: string,
    channelName: string,
    setCurrentSearchText: (str: string) => void,
) {

    const trimmedSearchTerm = searchTerm.trim();

    if (DEV_MODE) {
        setCurrentSearchText('Complete');
        return ExampleQuery(800);
    }
    const resp = await fetch(SUPABASE_FUNCTION_URL, {
        method: 'POST',
        headers: {
            apikey: SUPABASE_ANON_KEY,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: channelName, searchTerm: trimmedSearchTerm }),
    });

    const data = await resp.json();
    if (!resp.ok) {
        throw new Error(`Error ${data.message}`);
    }
    setCurrentSearchText('Complete');
    await new Promise((res) => setTimeout(res, 800));

    console.log(data);
    return data;
}

/**
 * Main page component handling search input, results display, and real-time updates.
 */
export default function HomePage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentSearchText, setCurrentSearchText] = useState('');
    const [channelName, setChannelName] = useState('');
    const [validationError, setValidationError] = useState<string | null>(null);

    // subscribe to a broad cast channel for text-based updates during RAG and tooling
    const resp = useChannel(channelName);
    // only update if different
    useEffect(() => {
        if (!resp) return;
        setCurrentSearchText(resp);
    }, [resp]);

    // TanStack for search
    const {
        data: searchResults,
        isLoading,
        error,
        isSuccess,
    } = useQuery({
        queryKey: [searchTerm.toLowerCase()],
        queryFn: async () => queryDecodeBook(searchTerm, channelName, setCurrentSearchText),
        enabled: searchTerm.length > 0,
        staleTime: Infinity, // 2 minutes
        retry: false,
    });

    useEffect(() => {
        if (error) {
            toast.error(`${error instanceof Error ? error.message : 'Unknown error'}`);
        } else {
            toast.dismiss();
        }
    }, [error]);


    function onSearch(formdata: FormData): void {
        if (isLoading) return;

        const query = formdata.get('search') as string;
        // count words  (split on whitespace after trimming)
        const trimmedQuery = query.trim();
        const isValid = trimmedQuery.length > 0 && trimmedQuery.split(/\s+/).length >= minSearchWordCount;

        console.log(isValid)
        setValidationError(null);
        if (isValid) {
            setCurrentSearchText('Embedding your query...');
            setChannelName(nanoid());
            setSearchTerm(trimmedQuery);
        } else {
            setValidationError(`Please provide at least ${minSearchWordCount} keywords.`)
        }
    }

    return (
        <div>
            <SearchBar onSearch={onSearch} disabled={isLoading}/>

            {isLoading && <LoadingIndicator currentSearchText={currentSearchText} />}

            <ErrorBoundary>
                <SearchResults
                    error={error}
                    searchResults={searchResults}
                    searchTerm={searchTerm}
                    validationError={validationError} />
            </ErrorBoundary>

            <ToastContainer
                position="top-center"
                autoClose={2000}
                hideProgressBar={true}
                newestOnTop={false}
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
        </div>
    );
}