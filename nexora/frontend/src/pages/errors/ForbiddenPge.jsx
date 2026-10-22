import { Link } from 'react-router-dom'
import { PublicLayout } from '../../layouts/index.js'
import '../public/PublicPages.css'

function ForbiddenPage() {
  return (
    <PublicLayout className="nexora-public">
      <section aria-labelledby="forbidden-title" className="public-not-found">
        <span aria-hidden="true" className="public-not-found-code">403</span>
        <span className="public-eyebrow">ACCESS RESTRICTED</span>
        <h1 id="forbidden-title">You don’t have permission to view this page.</h1>
        <p>Contact your workspace administrator if you think you should have access.</p>
        <Link className="public-button" to="/">
          Back to home <span aria-hidden="true">→</span>
        </Link>
      </section>
    </PublicLayout>
  )
}

export default ForbiddenPage