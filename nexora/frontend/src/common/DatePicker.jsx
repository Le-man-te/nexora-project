function DatePicker({
  id,
  name,
  label,
  value = '',
  onChange,
  min,
  max,
  disabled = false,
  required = false,
  className = '',
  ariaLabel = 'Choose date',
}) {
  const input = (
    <input
      aria-label={label ? undefined : ariaLabel}
      className={className || undefined}
      disabled={disabled}
      id={id}
      max={max}
      min={min}
      name={name}
      onChange={onChange}
      required={required}
      type="date"
      value={value}
    />
  )

  return label
    ? <label htmlFor={id}>{label}{input}</label>
    : input
}

export default DatePicker