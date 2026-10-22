import { lazy, Suspense } from 'react'

const AiAssistantPage = lazy(() => import('./AiAssistantPage.jsx'))

function AiAssistantRoute() {
  return (
    <Suspense fallback={<div role="status" style={{ padding: 24, color: '#777489' }}>Opening your AI workspace…</div>}>
      <AiAssistantPage />
    </Suspense>
  )
}

export default AiAssistantRoute
