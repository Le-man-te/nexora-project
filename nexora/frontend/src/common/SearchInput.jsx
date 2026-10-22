import Icon from '../layouts/Icon.jsx'

function SearchInput({
  value = '',
  onChange,
  onSearchSubmit,
  placeholder = 'Search...',
  ariaLabel = 'Search',
  className = '',
  disabled = false,
  autoFocus = false,
}) {
  function handleSubmit(event) {
    event.preventDefault()
    onSearchSubmit?.(value)
  }

  return (
    <form
      className={['search-box', className].filter(Boolean).join(' ')}
      onSubmit={handleSubmit}
      role="search"
    >
      <Icon name="search" size={17} />
      <input
        aria-label={ariaLabel}
        autoComplete="off"
        autoFocus={autoFocus}
        disabled={disabled}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={!onChange}
        type="search"
        value={value}
      />
    </form>
  )
}

export default SearchInput