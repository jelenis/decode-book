/** Supabase project URL for database connections. */
export const SUPABASE_URL = 'https://zjzpmvfuhgndocqkreks.supabase.co';
/** Supabase function URL for decode-book API calls. */
export const SUPABASE_FUNCTION_URL =
  'https://zjzpmvfuhgndocqkreks.supabase.co/functions/v1/decode-book';
/** Anonymous key for Supabase client authentication. */
export const SUPABASE_ANON_KEY = 'sb_publishable_D09vuim214cRhV-ieD27Wg_zAN3yK4t';
/** Flag indicating if the app is in development mode. */
export const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true';

const ignoreWord = new Set([
  'a',
  'an',
  'the',
  'and',
  'but',
  'or',
  'nor',
  'yet',
  'so',
  'at',
  'by',
  'for',
  'in',
  'of',
  'on',
]);

/**
 * Groups an array of objects by a specified property.
 * @param arr - The array of objects to group.
 * @param prop - The property name to group by.
 * @returns A Map where keys are unique property values and values are arrays of matching objects.
 * @example groupBy([{section: 'A'}, {section: 'B'}, {section: 'A'}], 'section') // Map {'A' => [...], 'B' => [...]}
 */
export function groupBy<O>(arr: O[], prop: string) {
  return arr.reduce((map: Map<string, O[]>, v: O) => {
    const key = String((v as any)[prop]);
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key)?.push(v);
    return map;
  }, new Map<string, O[]>());
}

export function capitalize(str: string) {
  if (!str) return '';
  return str
    .split(' ')
    .map((word) => (ignoreWord.has(word) ? word : word[0].toUpperCase() + word.slice(1)))
    .join(' ');
}

/**
 * Abbreviates consecutive label arrays (e.g., numbers or letters) by collapsing ranges.
 * @param labelArr - Array of label strings (e.g., ['1)', '2)', '3)']).
 * @returns Array of abbreviated strings (e.g., ['1)-3)']).
 * @example abbreviateLabel(['1)', '2)', '3)', '5)']) // ['1)-3)', '5)']
 */
export function abbreviateLabel(labelArr: string[]): string[] {
  if (!labelArr.length) return [];

  const isLettered = isNaN(parseInt(labelArr[0]));
  let values: number[];
  if (isLettered) {
    values = labelArr
      .map((l) => l.trim().replace(/\)/, ''))
      .map((l) => l.charCodeAt(0))
      .sort((a, b) => a - b);
  } else {
    values = labelArr
      .map((x) => parseInt(x))
      .filter((n) => !isNaN(n))
      .sort((a, b) => a - b);
  }

  // remove duplicates
  values = Array.from(new Set<number>(values));

  if (values.length === 0) return [];
  const result: string[] = [];
  let start = values[0];
  let end = values[0];

  for (let i = 1; i <= values.length; i++) {
    if (values[i] === end + 1) {
      // current value is continous, keep moving forward
      end = values[i];
    } else {
      // reached new group
      if (start === end) {
        // record the first value
        result.push(isLettered ? `${String.fromCharCode(start)})` : `${start})`);
      } else {
        // record the last continous value
        result.push(
          isLettered
            ? `${String.fromCharCode(start)})-${String.fromCharCode(end)})`
            : `${start})-${end})`,
        );
      }
      // update start and end the current value
      start = values[i];
      end = values[i];
    }
  }
  return result;
}
