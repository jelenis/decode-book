// Debug mode: set VITE_DEBUG=true in your .env file to enable
import { useState, useEffect} from 'react'
import { GiWhiteBook } from "react-icons/gi";
import { nanoid } from 'nanoid';
import {
    useQuery,
} from '@tanstack/react-query'

import SearchBar from '../search/SearchBar';
import SearchResults from '../search/SearchResults';
import useChannel from '../../hooks/useChannel';
import ExampleQuery from '../examples/ExampleQuery';
import { SUPABASE_ANON_KEY, SUPABASE_FUNCTION_URL, DEV_MODE } from '../common/utils';


if (DEV_MODE) {
    console.log('DEV MODE ACTIVATED', DEV_MODE)
}

async function queryDecodeBook(
    searchTerm: string, 
    channelName: string, 
    setCurrentSearchText: (str: string) => void) {
    if (DEV_MODE) {
        setCurrentSearchText("Complete");
        return ExampleQuery(800);
    }
    const resp = await fetch(SUPABASE_FUNCTION_URL,
         {
            method: 'POST',
            headers: {
                apikey: SUPABASE_ANON_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({name: channelName, searchTerm })
         }
    );

    const data = await resp.json();
    if (!resp.ok) {
        throw new Error(`Error ${data.message}`);
    }
    setCurrentSearchText("Complete")
    await new Promise(res => setTimeout(res, 800));
    console.log(data);
    return data;
}

export default function Home() {

    const [searchTerm, setSearchTerm] = useState('')
    const [currentSearchText, setCurrentSearchText] = useState('')
    const [channelName, setChannelName] = useState('');

    // subscribe to a broad cast channel for updates during RAG
    const resp = useChannel(channelName);
    // only update if different
    useEffect(() => {
        if (!resp) return;
        setCurrentSearchText(resp);
    }, [resp]);

    // TanStack for search
    const { data: searchResults, isLoading, error, isSuccess } = useQuery({
        queryKey: [searchTerm.toLowerCase()],
        queryFn: async () => queryDecodeBook(searchTerm, channelName, setCurrentSearchText),
        enabled: DEV_MODE || searchTerm.length > 3 && searchTerm.split(" ").length > 1,
        staleTime: 2 * 60 * 1000, // 2 minutes
        retry: false
    })
    

    function onSearch(formdata: FormData): void {
        const query = formdata.get("search") as string
        if (query && query.trim()) {
            setCurrentSearchText("Embedding your query...");
            setChannelName(nanoid())
            setSearchTerm(query.trim())
        }
    }

    return (
        <div>
            <h1 className='page-title'>Decode Book <GiWhiteBook /></h1>
            <h2 className='page-subtitle'>AI Powered Electrical Code</h2>
            <SearchBar onSearch={onSearch} />

            <SearchResults
                isLoading={isLoading}
                error={error}
                isSuccess={isSuccess}
                searchResults={searchResults}
                currentSearchText={currentSearchText}
                searchTerm={searchTerm}
            />
        </div>
    )
}