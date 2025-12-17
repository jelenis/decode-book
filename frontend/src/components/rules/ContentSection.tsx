import type { ReactNode } from 'react';
import { capitalize } from '../common/utils';

interface SectionProps {
	section: string;
	children: ReactNode[];
}

export default function ContentSection({ section, children }: SectionProps) {
	return (
		<div>
			<h3 className="code-rule-section">{capitalize(section)}</h3>
				<div className="divider"></div>
				{children}
		</div>
	);
}
