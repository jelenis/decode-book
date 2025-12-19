import type { ReactNode } from 'react';
import { capitalize } from '@/components/common/utils';

/** Props for the ContentSection component. */
interface SectionProps {
  section: string;
  children: ReactNode[];
}

/**
 * Wraps content in a section with a capitalized title and divider.
 * @param section - The section title string.
 * @param children - React nodes to render inside the section.
 */
export default function ContentSection({ section, children }: SectionProps) {
  return (
    <div>
      <h3 className="code-rule-section">{capitalize(section)}</h3>
      <div className="divider"></div>
      {children}
    </div>
  );
}
