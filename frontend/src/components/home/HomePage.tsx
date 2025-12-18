// Debug mode: set VITE_DEBUG=true in your .env file to enable
import { useState, useEffect } from 'react';
import { GiWhiteBook } from 'react-icons/gi';
import { nanoid } from 'nanoid';
import { useQuery } from '@tanstack/react-query';

import SearchBar from '../search/SearchBar';
import SearchResults from '../search/SearchResults';
import useChannel from '../../hooks/useChannel';
import ExampleQuery from '../examples/ExampleQuery';

import { SUPABASE_ANON_KEY, SUPABASE_FUNCTION_URL, DEV_MODE } from '../common/utils';
import LoadingIndicator from '../search/LoadingIndicator';

if (DEV_MODE) {
  console.log('DEV MODE ACTIVATED', DEV_MODE);
}

const minSearchWordCount = 2;
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
  // Input validation
  if (
    !searchTerm ||
    typeof searchTerm !== 'string' ||
    searchTerm.trim().length === 0 ||
    searchTerm.split(' ').length < minSearchWordCount
  ) {
    throw new Error(`Invalid search, please include at least ${minSearchWordCount} words.`);
  }

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
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: false,
  });

  function onSearch(formdata: FormData): void {
    const query = formdata.get('search') as string;
    if (query && query.trim()) {
      setCurrentSearchText('Embedding your query...');
      setChannelName(nanoid());
      setSearchTerm(query.trim());
    }
  }

  return (
    <div>
      <h1 className="page-title">
        Decode Book <GiWhiteBook />
      </h1>
      <h2 className="page-subtitle">AI Powered Electrical Code</h2>
      <SearchBar onSearch={onSearch} />
      {isLoading && <LoadingIndicator currentSearchText={currentSearchText} />}
      <SearchResults error={error} searchResults={searchResults} searchTerm={searchTerm} />
    </div>
  );
}
