function Footer({ children, copyright, links = [], className = '' }) {
  return (
    <footer className={['layout-footer', className].filter(Boolean).join(' ')}>
      {children}
      {copyright && <span>{copyright}</span>}
      {links.length > 0 && (
        <nav aria-label="Footer navigation">
          {links.map((link) => (
            <a href={link.href} key={link.label}>{link.label}</a>
          ))}
        </nav>
      )}
    </footer>
  )
}

export default Footer