import './PageHeader.css'

function PageHeader({
  title,
  description,
  eyebrow,
  actions,
  className = '',
}) {
  return (
    <header className={['page-header', className].filter(Boolean).join(' ')}>
      <div className="page-header-copy">
        {eyebrow && <span className="page-header-eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="page-header-actions">{actions}</div>}
    </header>
  )
}

export default PageHeader