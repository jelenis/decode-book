import { useEffect, useState, type RefObject } from 'react';

/**
 * useComputedProp(ref, key)
 * Return the computed CSS property `key` for `ref.current` or `null`.
 * Uses `getComputedStyle(...).getPropertyValue(key)` (supports custom props).
 * Example: `const font = useComputedProp(inputRef, 'font');`
 */
export default function useComputedProp<T extends Element = Element>(ref: RefObject<T | null>, key: string) {
  const [prop, setProp] = useState<string | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) {
      setProp(null);
      return;
    }
    const computed = window.getComputedStyle(el);
    // Prefer getPropertyValue for runtime-safe lookup (supports custom props).
    const val = computed.getPropertyValue(key);
    setProp(val || null);
  }, [ref, key]);

  return prop;
}
