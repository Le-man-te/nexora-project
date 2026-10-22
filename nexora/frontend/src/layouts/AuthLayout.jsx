import { useId } from 'react'
import { Link } from 'react-router-dom'
import Footer from './Footer.jsx'

function AuthLayout({
  children,
  title,
  description,
  brand = 'nexora',
  homeTo = '/',
  footer,
  className = '',
}) {
  const titleId = useId()

  return (
    <div className={['auth-layout', className].filter(Boolean).join(' ')}>
      <Link aria-label={`${brand} home`} className="auth-layout-brand" to={homeTo}>
        <span aria-hidden="true">✦</span> {brand}
      </Link>
      <main className="auth-layout-main">
        <section
          aria-labelledby={title ? titleId : undefined}
          className="auth-layout-card"
        >
          {title && <h1 id={titleId}>{title}</h1>}
          {description && <p className="auth-layout-description">{description}</p>}
          {children}
        </section>
      </main>
      {footer ?? <Footer copyright={`© ${brand}`} />}
    </div>
  )
}

export default AuthLayout