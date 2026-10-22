import Icon from './Icon.jsx'

function MobileNavigation({
  items = [],
  activeSection = 'Overview',
  onNavigate,
  label = 'Mobile navigation',
}) {
  return (
    <nav aria-label={label} className="mobile-navigation">
      {items.map((item) => (
        <button
          aria-current={activeSection === item.label ? 'page' : undefined}
          className={activeSection === item.label ? 'is-active' : ''}
          key={item.label}
          onClick={() => onNavigate?.(item.label)}
          type="button"
        >
          <Icon name={item.icon} size={19} />
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  )
}

export default MobileNavigation