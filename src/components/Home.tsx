import { useState } from 'react'
import {
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import Search from './Search'

// Mock API function - replace with your actual API endpoint
async function searchElectricalCodes(query: string) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100))
  return {
  rules: [
    {
      ruleNumber: '26-252',
      section: 'Installation of electrical equipment',
      subsection: 'Transformers',
      title: 'Overcurrent protection for power and distribution transformer circuits rated 750 V or less, other than dry-type transformers',   
      subRuleLabel: [Array],
      relevanceExplanation: 'Provides detailed conditions under which overcurrent devices, including secondary side devices and their ratings, allow omission or necessitate secondary fuses on transformers.'
    },
    {
      ruleNumber: '26-254',
      section: 'Installation of electrical equipment',
      subsection: 'Transformers',
      title: 'Overcurrent protection for dry-type transformer circuits rated 750 V or less',
      subRuleLabel: [Array],
      relevanceExplanation: 'Specifies when a transformer having overcurrent protection on the secondary side can omit primary overcurrent devices and the allowable device ratings, implying necessity for secondary fuses when these conditions are met.'
    }
  ],
  conclusion: 'Secondary fuses on transformers are required unless the transformer has an overcurrent device on the secondary side rated or set at not more than 125% of the rated secondary current, in which case a primary overcurrent device may be omitted if the primary feeder device is suitably rated, as outlined in Rules 26-252 and 26-254.'
}
}

export default function Home() {
    const [searchTerm, setSearchTerm] = useState('')
    
    // TanStack Query for search
    const { data: searchResults,  isLoading, error, isSuccess } = useQuery({
        queryKey: [searchTerm.toLowerCase()],
        queryFn: () => searchElectricalCodes(searchTerm),
        staleTime: 5 * 60 * 1000, // 5 minutes
    })

    function onSearch(formdata: FormData): void {
        const query = formdata.get("search") as string
        if (query && query.trim()) {
            setSearchTerm(query.trim())
        }
    }
    console.log(searchResults);
    return (
        <div>
            <h1>Decode Book</h1>
            <h2>AI Powered Electrical Code</h2>
            <Search onSearch={onSearch} />
            
            {/* Search Results */}
            {searchTerm && (
                <div className="search-results" style={{ marginTop: '2rem' }}>
                    {isLoading && <p>Searching electrical codes...</p>}
                    
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