import { useEffect, useRef } from 'react'
import Alert from './Alert.jsx'

const defaultDuration = 4000

function Toast({
  title,
  message,
  variant = 'info',
  duration = defaultDuration,
  onDismiss,
}) {
  const onDismissRef = useRef(onDismiss)

  useEffect(() => {
    onDismissRef.current = onDismiss
  }, [onDismiss])

  useEffect(() => {
    if (!duration || duration < 0) return undefined

    const timeoutId = window.setTimeout(() => onDismissRef.current(), duration)
    return () => window.clearTimeout(timeoutId)
  }, [duration])

  return (
    <Alert
      onDismiss={onDismiss}
      style={{
        boxShadow: '0 8px 24px rgba(25, 20, 48, 0.12)',
        fontSize: 13,
      }}
      title={title}
      variant={variant}
    >
      {message}
    </Alert>
  )
}

export { Toast }
export default Toast