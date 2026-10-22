import Footer from './Footer.jsx'

function DashboardLayout({
  sidebar,
  navbar,
  children,
  mobileNavigation,
  footer,
  className = '',
}) {
  return (
    <div className={['nexora-app', className].filter(Boolean).join(' ')}>
      {sidebar}
      <main className="main-area" id="overview">
        {navbar}
        {children}
        {footer && (
          typeof footer === 'string'
            ? <Footer className="dashboard-footer">{footer}</Footer>
            : footer
        )}
      </main>
      {mobileNavigation}
    </div>
  )
}

export default DashboardLayout