/**
 * Represents a single electrical code rule with metadata.
 * Used for displaying search results and rule details.
 */
export type CodeRule = {
  ruleNumber: string;
  section: string;
  subsection: string | null;
  subRuleLabel: string[];
  title: string;
  content: string;
  relevanceExplanation: string;
};
