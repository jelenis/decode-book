import { useState, useEffect } from 'react'
import { GiWhiteBook } from "react-icons/gi";

import {
    useQuery,
} from '@tanstack/react-query'

import Search from './Search'
import SearchResults from './SearchResults'
import useChannel from '../hooks/useChannel';

const SUPABASE_FUNCTION_URL = 'https://zjzpmvfuhgndocqkreks.supabase.co/functions/v1/decode-book'
const SUPABASE_ANON_KEY = 'sb_publishable_D09vuim214cRhV-ieD27Wg_zAN3yK4t'

const TEST_MODE = false;

async function queryDecodeBook(searchTerm: string, channelName: string, setCurrentSearchText: (str: string) => string) {
    if (TEST_MODE) {
        setCurrentSearchText("Complete")
        await new Promise(res => setTimeout(res, 800));
        return JSON.parse("{\"rules\":[{\"ruleNumber\":\"26-244\",\"section\":\"Installation of electrical equipment\",\"subsection\":\"Transformers\",\"title\":\"Transformers mounted on roofs (see Appendix B)\",\"subRuleLabel\":[\"1)\",\"2)\"],\"relevanceExplanation\":\"Specifies requirements for dielectric liquid-filled and non-propagating liquid transformers mounted on roofs, including vault location and separation from doors, windows, and vents.\"},{\"ruleNumber\":\"26-246\",\"section\":\"Installation of electrical equipment\",\"subsection\":\"Transformers\",\"title\":\"Dry-core, open-ventilated-type transformers\",\"subRuleLabel\":[\"1)\",\"2)\",\"3)\",\"4)\",\"5)\"],\"relevanceExplanation\":\"Details mounting clearances for dry-core transformers related to air space and combustible materials, and installation height to avoid flooding.\"},{\"ruleNumber\":\"30-1016\",\"section\":\"Installation of lighting equipment\",\"subsection\":\"Permanent outdoor floodlighting installations\",\"title\":\"Location of transformers\",\"subRuleLabel\":[\"a)\",\"b)\",\"c)\"],\"relevanceExplanation\":\"Specifies mounting conditions for transformers on poles or platforms, including height requirements and guarding for outdoor lighting installations.\"},{\"ruleNumber\":\"26-242\",\"section\":\"Installation of electrical equipment\",\"subsection\":\"Transformers\",\"title\":\"Outdoor transformer and unit substation installations\",\"subRuleLabel\":[\"1)\",\"2)\",\"2) a)\",\"2) b)\",\"2) c)\",\"2) d)\"],\"relevanceExplanation\":\"Covers outdoor mounting requirements for transformers, including elevation, fencing, warning signs, and minimum distances from combustible surfaces and building openings.\"}],\"conclusion\":\"Transformers can be mounted on roofs, floors, poles, platforms, or outdoors with specific requirements for clearances, elevation, enclosures, and safety measures as outlined in Rules 26-244, 26-246, 30-1016, and 26-242.\"}")
    }
    const resp = await fetch(SUPABASE_FUNCTION_URL,
         {
            method: 'POST',

            headers: {
                Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
                apikey: SUPABASE_ANON_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({name: channelName, searchTerm })
         }
    );
    if (resp.ok) {
        setCurrentSearchText("Complete")
        await new Promise(res => setTimeout(res, 800));
        
    }

    return await resp.json();
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
        queryFn: async () => queryDecodeBook(searchTerm, channelName, setCurrentSearchText),
        enabled: TEST_MODE || searchTerm.length > 3 && searchTerm.split(" ").length > 1,
        staleTime: 2 * 60 * 1000, // 2 minutes
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
            <h1 className='page-title'>Decode Book <GiWhiteBook /></h1>
            <h2>AI Powered Electrical Code</h2>
            <Search onSearch={onSearch} />

            {/* Search Results */}
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