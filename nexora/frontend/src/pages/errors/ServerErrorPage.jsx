import { Link } from 'react-router-dom'
import { PublicLayout } from '../../layouts/index.js'
import '../public/PublicPages.css'

function ServerErrorPage() {
  return (
    <PublicLayout className="nexora-public">
      <section aria-labelledby="server-error-title" className="public-not-found">
        <span aria-hidden="true" className="public-not-found-code">500</span>
        <span className="public-eyebrow">TEMPORARY SETBACK</span>
        <h1 id="server-error-title">Something went wrong on our end.</h1>
        <p>Please try again in a little while. If the problem continues, contact support.</p>
        <Link className="public-button" to="/">
          Back to home <span aria-hidden="true">→</span>
        </Link>
      </section>
    </PublicLayout>
  )
}

export default ServerErrorPage