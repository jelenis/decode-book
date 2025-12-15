import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { capitalize } from './utils';

interface SectionProps {
  section: string;
  children: ReactNode[];
}

export default function Section({ section, children }: SectionProps) {
  return (
    <div>
      <h3 className="code-rule-section">{capitalize(section)}</h3>
        <div className="divider"></div>
        {children}
    </div>
  );
}
