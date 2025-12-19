import { CiSearch } from 'react-icons/ci';
import { useState } from 'react';

/**
 * Input form for searching electrical codes.
 * @param onSearch - Callback function to handle form submission.
 */
export default function SearchBar({ onSearch, disabled }: { onSearch: (formData: FormData) => void, disabled: boolean }) {
  const [text, setText] = useState('');

  return (
    <form id="searchbar" className="search-bar-container" action={onSearch}>
      <input
        name="search"
        aria-label="search"
        className="search-bar"
        disabled={disabled}
        maxLength={160}
        placeholder="Is EMT good for outdoor use?"
        autoComplete="off"
        value={text}
        onChange={(e) => setText(e.currentTarget.value)}
      />
      <div className='vertical'></div>
      <button className='btn'>
        <CiSearch/>
      </button>
    </form>
  );
}
