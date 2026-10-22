import { lazy, Suspense } from 'react'

const AnalyticsPage = lazy(() => import('./AnalyticsPage.jsx'))

function AnalyticsRoute() {
  return (
    <Suspense fallback={<div role="status" style={{ padding: 24, color: '#777489' }}>Opening your workspace insights…</div>}>
      <AnalyticsPage />
    </Suspense>
  )
}

export default AnalyticsRoute
