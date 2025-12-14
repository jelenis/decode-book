import { useState, useEffect } from 'react'

import {
    useQuery,
} from '@tanstack/react-query'
import Search from './Search'

import { motion } from "framer-motion";
import { createClient } from '@supabase/supabase-js'
import Loader from './Loader';
import useChannel from '../hooks/useChannel';

const SUPABASE_URL = 'https://zjzpmvfuhgndocqkreks.supabase.co'
const SUPABASE_FUNCTION_URL = 'https://zjzpmvfuhgndocqkreks.supabase.co/functions/v1/decode-book'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqenBtdmZ1aGduZG9jcWtyZWtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxMTM3MjcsImV4cCI6MjA4MDY4OTcyN30.voBdjJZl0Ifa6gW0xxeF_py05ZuTo50GjMkCt2zR2Vc'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);



async function queryDecodeBook(searchTerm: string, channelName: string) {
    const resp = await fetch('https://zjzpmvfuhgndocqkreks.supabase.co/functions/v1/decode-book',
         {
            method: 'POST',

            headers: {
                Authorization: 'Bearer sb_publishable_D09vuim214cRhV-ieD27Wg_zAN3yK4t',
                apikey: 'sb_publishable_D09vuim214cRhV-ieD27Wg_zAN3yK4t',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({name: channelName, searchTerm })
         }
    );
    // console.log(resp);
    return resp.json();
}

export default function Home() {
    const [searchTerm, setSearchTerm] = useState('')
    const [currentSearchText, setCurrentSearchText] = useState('')
    const [channelName, setChannelName] = useState('');


    const resp = useChannel(channelName);
    useEffect(() => {
        if (!resp?.update) return;
        const {update} = resp;
       

        setCurrentSearchText(update);

    }, [resp])


    // TanStack Query for search
    const { data: searchResults, isLoading, error, isSuccess } = useQuery({
        queryKey: [searchTerm.toLowerCase()],
        queryFn: () => queryDecodeBook(searchTerm, channelName),
        enabled: searchTerm.length > 3,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })

    function onSearch(formdata: FormData): void {
        const query = formdata.get("search") as string
        if (query && query.trim()) {
            setCurrentSearchText("Embedding your query...");
            setChannelName(crypto.randomUUID())
            setSearchTerm(query.trim())
        }
    }

    return (
        <div>
            <h1>Decode Book</h1>
            <h2>AI Powered Electrical Code</h2>
            <Search onSearch={onSearch} />

            {/* Search Results */}
            {searchTerm && (
                <div className="search-results" style={{ marginTop: '2rem' }}>
                    {isLoading && <Loader currentSearchText={currentSearchText} />}

                    {error && (
                        <p style={{ color: 'red' }}>
                            Error searching: {error instanceof Error ? error.message : 'Unknown error'}
                        </p>
                    )}

                    {isSuccess && searchResults && (
                        <div>
                            <h3>Found result(s) for "{searchTerm}"</h3>

                        </div>
                    )}

                    {isSuccess && (
                        <p>No results found for "{searchTerm}". Try different search terms.</p>
                    )}
                </div>
            )}
        </div>
    )
}