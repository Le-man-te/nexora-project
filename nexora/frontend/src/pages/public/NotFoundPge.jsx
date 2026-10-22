import { Link } from 'react-router-dom'
import { PublicLayout } from '../../layouts/index.js'
import './PublicPages.css'

function NotFoundPage() {
  return (
    <PublicLayout className="nexora-public">
      <section className="public-not-found">
        <span className="public-not-found-code">404</span>
        <span className="public-eyebrow">THIS PAGE TOOK A WRONG TURN</span>
        <h1>Nothing here, for now.</h1>
        <p>The link may be out of date, or the page may have moved.</p>
        <Link className="public-button" to="/">Back to home <span aria-hidden="true">→</span></Link>
      </section>
    </PublicLayout>
  )
}

export default NotFoundPage
