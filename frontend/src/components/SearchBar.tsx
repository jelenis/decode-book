import { CiSearch } from "react-icons/ci";
import {useState} from "react"

export default function SearchBar({onSearch}: {onSearch: (formData: FormData) => void}) {
    const [text, setText] = useState('');

    return (
    <form id="searchbar" className='search-bar-container' action={onSearch}>
        <input
        name='search'
        aria-label='search'
        className='search-bar'
        maxLength={160}
        placeholder='Is EMT good for outdoor use?'
        autoComplete="off"
        value={text}
        onChange={e => setText(e.currentTarget.value)}
        />
        <CiSearch />
    </form>)
}