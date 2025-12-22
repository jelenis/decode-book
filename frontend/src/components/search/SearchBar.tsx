import { CiSearch } from 'react-icons/ci';
import { useState, useRef, useEffect } from 'react';
import useMedia from 'use-media';

import {questions} from '@/examples/sampleQuestions.json'

/**
 * Input form for searching electrical codes.
 * @param onSearch - Callback function to handle form submission.
 */
export default function SearchBar({ onSearch, disabled }: { onSearch: (formData: FormData) => void, disabled: boolean }) {
  const [text, setText] = useState('');
  const randomIndex = Math.floor(Math.random()*questions.length);
  const isSmall = useMedia({maxWidth: '520px'});
  const inputRef = useRef<HTMLInputElement | null>(null);
  let randomPlaceholder = questions[randomIndex];

  const smallPlaceHolderLen = 32; // arbitrary length;
  if (isSmall && randomPlaceholder.length > smallPlaceHolderLen) {
    // trim to a smaller length, find the last space, and then append elipsis
    const splitPlaceholder = [...randomPlaceholder].slice(0,smallPlaceHolderLen);
    const lastSpaceIdx = splitPlaceholder.lastIndexOf(' ');
    randomPlaceholder = randomPlaceholder.slice(0, lastSpaceIdx) + '...'
  }

  return (
    <form id="searchbar" className="search-bar-container" action={onSearch}>
      <input
        ref={inputRef}
        name="search"
        aria-label="search"
        className="search-bar"
        disabled={disabled}
        maxLength={160}
        placeholder={randomPlaceholder}
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

