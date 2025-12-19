import { CiSearch } from 'react-icons/ci';
import { useState } from 'react';
import {questions} from '@/examples/sampleQuestions.json'

/**
 * Input form for searching electrical codes.
 * @param onSearch - Callback function to handle form submission.
 */
export default function SearchBar({ onSearch, disabled }: { onSearch: (formData: FormData) => void, disabled: boolean }) {
  const [text, setText] = useState('');
  const randomIndex = Math.floor(Math.random()*questions.length);
  const randomPlaceholder = questions[randomIndex];
  return (
    <form id="searchbar" className="search-bar-container" action={onSearch}>
      <input
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
