import type {CodeRule} from './types'
import { capitalize, abbreviateLabel } from './utils';

export default function RuleCard({rule}: {rule: CodeRule}) {
    let { 
        ruleNumber, 
        section, 
        // subsection, 
        subRuleLabel, 
        title, 
        relevanceExplanation
    } = rule;

    // format text
    title = title.replace(/\(see Appendix *.\)/g, '')
    section = capitalize(section);
    title = capitalize(title);

    subRuleLabel = subRuleLabel && abbreviateLabel(subRuleLabel)

    return (
        <div className='code-rule'>
            <div className='card'>
                <h3 className='code-rule-title'>{`${ruleNumber}: ${title}`}</h3>
                {subRuleLabel?.length && <span className='code-rule-subrule'>
                    Subrule { subRuleLabel.join(', ')}
                </span>}
                <div className='divider'></div>
                <p>
                    {relevanceExplanation}
                </p>
            </div>
        </div>)
}