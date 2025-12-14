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
      {Array.isArray(children)
        ? children.map((child, idx) => (
            <motion.div
              key={child && typeof child === 'object' && 'props' in child && (child as any).props.ruleNumber ? (child as any).props.ruleNumber : idx}
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{
                duration: 0.6,
                ease: 'easeOut',
                delay: idx * 0.15,
              }}
            >
              {child}
            </motion.div>
          ))
        : children}
    </div>
  );
}
