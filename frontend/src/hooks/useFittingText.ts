import { useMemo, useEffect, useState, type RefObject } from 'react';
import getTextWidth from '@/utils/getTextWidth';
import useComputedProp from '@/hooks/useComputedProp';

/**
 * useFittingText(ref, text, padding)
 * Return a version of `text` trimmed with "..." so it fits inside `ref.current.clientWidth`.
 */
export default function useFittingText<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T | null>,
  text: string,
  padding = 6
) {
  const font = useComputedProp(ref, 'font');
  const [refWidth, setRefWidth] = useState(0);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const ro = new ResizeObserver(() => {
            const next = el.clientWidth;
            setRefWidth(prev => (prev === next ? prev : next));
        });

        ro.observe(el);
        return () => ro.disconnect();
    }, []);
    

  return useMemo(() => {
    if (!font || !ref.current) return text;
    const maxWidth = Math.max(0, refWidth - padding);
    if (getTextWidth(text, font) <= maxWidth) return text;


    // remove 1 character at a time until the text fits
    let trimmed = text;
    while (trimmed.length > 0 && getTextWidth(trimmed + '...', font) > maxWidth) {
      trimmed = trimmed.slice(0, -1);
    }

    return trimmed.trim() + '...';
  }, [font, text, refWidth]);
}
