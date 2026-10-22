import './FilterBar.css'

function FilterBar({
  filters = [],
  value,
  onChange,
  label = 'Filter options',
  className = '',
}) {
  return (
    <div
      aria-label={label}
      className={['filter-bar', className].filter(Boolean).join(' ')}
      role="group"
    >
      {filters.map((filter) => {
        const option = typeof filter === 'string'
          ? { label: filter, value: filter }
          : filter
        const selected = value === option.value

        return (
          <button
            aria-pressed={selected}
            className={`filter-bar-option${selected ? ' is-selected' : ''}`}
            key={option.value}
            onClick={() => onChange?.(option.value)}
            type="button"
          >
            {option.label}
            {option.count !== undefined && (
              <span className="filter-bar-count">{option.count}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export default FilterBar