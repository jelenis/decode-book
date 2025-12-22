import { CiSearch } from 'react-icons/ci';
import { useState, useRef, useMemo, useEffect } from 'react';
import useMedia from 'use-media';

import {questions} from '@/examples/sampleQuestions.json'
import { PiPlaceholder } from 'react-icons/pi';
import useFittingText from '@/hooks/useFittingText';





/**
 * Input form for searching electrical codes.
 * @param onSearch - Callback function to handle form submission.
 */
export default function SearchBar({ onSearch, disabled }: { onSearch: (formData: FormData) => void, disabled: boolean }) {
  const [text, setText] = useState('');
  const [randomText] = useState(() => {
      const randomIndex = Math.floor(Math.random()*questions.length);
      const randomPlaceholder = questions[randomIndex];
      return randomPlaceholder
  });

  const inputRef = useRef<HTMLInputElement | null>(null);
  const placeholder = useFittingText(inputRef, randomText);

  return (
    <form id="searchbar" className="search-bar-container" action={onSearch}>
      <input
        ref={inputRef}
        name="search"
        aria-label="search"
        className="search-bar"
        disabled={disabled}
        maxLength={160}
        placeholder={placeholder}
        autoComplete="off"
        value={text}
        onChange={(e) => setText(e.currentTarget.value)}
      />
      <div className='vertical'></div>
      <button className='btn' disabled={disabled} >
        <CiSearch/>
      </button>
    </form>
  );
}

