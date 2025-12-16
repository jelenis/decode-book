import RuleCard from './RuleCard';
import type { CodeRule } from './types';
import Loader from './Loader';
import type { ReactNode } from 'react';
import { groupBy } from './utils';
import Section from './Section';

import { motion } from "framer-motion";

type SearchResultsProps = {
    isLoading: boolean;
    error: unknown;
    isSuccess: boolean;
    searchResults: any | undefined;
    currentSearchText: string;
    searchTerm: string;
}

function renderResults(rules: CodeRule[]): ReactNode {
    if (!rules) return null;
    const sections: Array<[string, CodeRule[]]> = Array.from(
        groupBy<CodeRule>(rules, 'section').entries()
    );

    return sections.map(([section, rules]) => (
        <Section key={section} section={section}>
            {rules.map((rule, idx) => (
                <motion.div
                    key={rule.ruleNumber}
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{
                        duration: 0.6,
                        ease: 'easeOut',
                        delay: idx * 0.15,
                    }}
                >
                    {<RuleCard key={rule.ruleNumber} rule={rule} />}
                </motion.div>
            ))}

        </Section>
    ));
}

export default function SearchResults({
    isLoading,
    error,
    isSuccess,
    searchResults,
    currentSearchText,
    searchTerm,
}: SearchResultsProps) {
  
    return (
        <div className="search-results" style={{ marginTop: '2rem' }}>
            {isLoading && <Loader currentSearchText={currentSearchText} />}
            {error && (
                <p style={{ color: 'red' }}>
                    Error searching: {error instanceof Error ? error.message : 'Unknown error'}
                </p>
            )}
            {isSuccess && searchResults?.rules?.length && (
                <div>
                    <h2 className="code-rule-section">Results</h2>
                    <div className="divider"></div>
                    <motion.div
                        initial={{ opacity: 0, y: 3 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -1 }}
                        transition={{
                            duration: 0.6,
                            ease: 'easeInOut',
                        }}
                    >
                        <p className='conclusion'>{searchResults.conclusion}</p>
                    </motion.div>
                    
                    {renderResults(searchResults.rules)}
                </div>
            )}

            {isSuccess && !searchResults && (
                <p>Sorry, I'm unable to find to determine the anser for "{searchTerm}". Try different search terms.</p>
            )}
        </div>
    );
}
