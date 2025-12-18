import CodeRuleCard from '../rules/CodeRuleCard';
import type { CodeRule } from '../common/types';
import LoadingIndicator from './LoadingIndicator';
import type { ReactNode } from 'react';
import { groupBy } from '../common/utils';
import ContentSection from '../rules/ContentSection';
import { motion } from 'framer-motion';
import { CiStickyNote } from 'react-icons/ci';
import { ToastContainer, toast } from 'react-toastify';
import { useEffect } from 'react';
import { infinity } from 'ldrs';

/** Props for the SearchResults component, including loading/error states and data. */
type SearchResultsProps = {
  error: unknown;
  searchResults: { rules: CodeRule[]; conclusion: string };
  searchTerm: string;
  validationError?: string | null;
};

/**
 * Renders a list of code rules grouped by section.
 * @param rules - Array of CodeRule objects.
 * @returns React nodes for the rendered sections.
 */
function renderResults(rules: CodeRule[]): ReactNode {
  if (!rules) return null;
  const sections: Array<[string, CodeRule[]]> = Array.from(
    groupBy<CodeRule>(rules, 'section').entries(),
  );

  return sections.map(([section, rules]) => (
    <ContentSection key={section} section={section}>
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
          {<CodeRuleCard key={rule.ruleNumber} rule={rule} />}
        </motion.div>
      ))}
    </ContentSection>
  ));
}

/**
 * Processes and renders the conclusion text (currently a placeholder).
 * @param rawText - The raw conclusion string.
 * @returns React node for the conclusion.
 */
function renderConclusion(rawText: string): ReactNode {
  // capture all continous spaces and non space characters
  // this preserves spaces to map jsx
  const tokens = rawText.match(/\s+|\S+/g);
  if (!tokens) return null;

  // const elementsArr = tokens.map((word,i) => {
  //     const match = word.match(/\[(\d+-\d+)\]/)
  //     if (match) {
  //         return <sup key={match[1]} className='reference'>
  //             {/*  TODO Handle references here */}
  //             {/* {match[1]} */}
  //             {/* <CiStickyNote/> */}
  //         </sup>
  //     }
  //     return word;
  // });

  // const output = [];
  // for (let i = 0; i < elementsArr.length; i++ ){
  //     const cur = elementsArr[i];
  //     const prev = elementsArr[i-1];
  //     if (typeof prev !== 'string' && typeof cur !== 'string') {
  //         // this is a consecutive code reference
  //         output.push(' ')
  //     }
  //     output.push(cur)
  // }

  return rawText;
}

/**
 * Displays search results, loading state, errors, and conclusion.
 * @param props - SearchResultsProps object.
 */
export default function SearchResults({
  searchTerm,
  searchResults,
  error,
  validationError,
}: SearchResultsProps) {
  useEffect(() => {
    // Only toast for non-validation errors
    if (error) {
      if (!(error instanceof Error && error.name === 'ValidationError')) {
        toast.error(`${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else {
      toast.dismiss();
    }
  }, [error, searchTerm]);

  // Determine search states
  const hasSearched = searchTerm.length > 0 && !validationError;
  const hasResults = hasSearched && searchResults?.rules?.length > 0;
  const hasEmptyResults = hasSearched && searchResults?.rules?.length === 0;

  return (
    <div className="search-results" style={{ marginTop: '2rem' }}>
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

      {validationError && (
        <div className="validation-error" role="alert" aria-live="polite">
          {validationError}
        </div>
      )}

      {hasResults && (
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
            <p className="conclusion">{renderConclusion(searchResults.conclusion)}</p>
          </motion.div>
          {renderResults(searchResults.rules)}
        </div>
      )}
      {hasEmptyResults && <p>{searchResults.conclusion}</p>}
    </div>
  );
}
