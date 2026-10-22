import { Link } from 'react-router-dom'
import { PublicLayout } from '../../layouts/index.js'
import '../public/PublicPages.css'

function UnauthorizedPage() {
  return (
    <PublicLayout className="nexora-public">
      <section aria-labelledby="unauthorized-title" className="public-not-found">
        <span aria-hidden="true" className="public-not-found-code">401</span>
        <span className="public-eyebrow">SIGN-IN REQUIRED</span>
        <h1 id="unauthorized-title">Please sign in to continue.</h1>
        <p>You need to be signed in to access this page.</p>
        <Link className="public-button" to="/login">
          Go to sign in <span aria-hidden="true">→</span>
        </Link>
      </section>
    </PublicLayout>
  )
}

export default UnauthorizedPage