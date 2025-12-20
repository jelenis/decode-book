import type { CodeRule } from '@/components/common/types';
import { capitalize, abbreviateLabel } from '@/components/common/utils';

/**
 * Displays a single electrical code rule with title, subrules, and explanation.
 * @param rule - The CodeRule object to display.
 */
export default function CodeRuleCard({ rule }: { rule: CodeRule }) {
  let { ruleNumber, section, subsection, subRuleLabel, title, relevanceExplanation } = rule;

  // format text
  title = title.replace(/\(see Appendix *.\)/g, '');
  section = capitalize(section);
  title = capitalize(title);

  subRuleLabel = subRuleLabel && abbreviateLabel(subRuleLabel);

  return (
    <div className="code-rule">
      <div className="card">
        <h3 className="code-rule-title">{`${ruleNumber}: ${title}`}</h3>
        {subRuleLabel?.length > 0 && (
          <span className="code-rule-subrule">Subrule {subRuleLabel.join(', ')}</span>
        )}
        <div className="divider"></div>
        <p>{relevanceExplanation}</p>
      </div>
    </div>
  );
}
