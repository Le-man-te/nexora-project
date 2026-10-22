import { Link } from 'react-router-dom'
import Footer from './Footer.jsx'

function PublicLayout({
  children,
  brand = 'nexora',
  homeTo = '/',
  navigation,
  footer,
  className = '',
}) {
  return (
    <div className={['public-layout', className].filter(Boolean).join(' ')}>
      <header className="public-layout-header">
        <Link aria-label={`${brand} home`} className="public-layout-brand" to={homeTo}>
          {brand}
        </Link>
        {navigation}
      </header>
      <main className="public-layout-content">{children}</main>
      {footer ?? (
        <Footer
          copyright={`© ${brand}`}
          links={[
            { label: 'Privacy', href: '/privacy' },
            { label: 'Terms', href: '/terms' },
          ]}
        />
      )}
    </div>
  )
}

export default PublicLayout