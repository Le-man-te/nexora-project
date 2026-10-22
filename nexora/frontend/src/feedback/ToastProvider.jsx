import {
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react'
import Toast from './Toast.jsx'
import ToastContext from './ToastContext.js'

const defaultDuration = 4000

function showVariantToast(showToast, variant, message, options) {
  const isToastOptions =
    message &&
    typeof message === 'object' &&
    !Array.isArray(message) &&
    'message' in message

  return isToastOptions
    ? showToast({ ...message, ...options, variant })
    : showToast(message, { ...options, variant })
}

function ToastProvider({ children, duration = defaultDuration }) {
  const [toasts, setToasts] = useState([])
  const nextId = useRef(0)

  const dismissToast = useCallback((id) => {
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(
    (message, options = {}) => {
      const toastOptions =
        message &&
        typeof message === 'object' &&
        !Array.isArray(message) &&
        'message' in message
          ? { ...message, ...options }
          : { ...options, message }

      if (toastOptions.message == null) {
        throw new TypeError('showToast requires a message.')
      }

      nextId.current += 1
      const id = nextId.current
      const toast = {
        id,
        variant: 'info',
        duration,
        ...toastOptions,
      }

      setToasts((currentToasts) => [...currentToasts, toast])
      return id
    },
    [duration],
  )

  const info = useCallback(
    (message, options = {}) =>
      showVariantToast(showToast, 'info', message, options),
    [showToast],
  )
  const success = useCallback(
    (message, options = {}) =>
      showVariantToast(showToast, 'success', message, options),
    [showToast],
  )
  const warning = useCallback(
    (message, options = {}) =>
      showVariantToast(showToast, 'warning', message, options),
    [showToast],
  )
  const error = useCallback(
    (message, options = {}) =>
      showVariantToast(showToast, 'error', message, options),
    [showToast],
  )

  const contextValue = useMemo(
    () => ({ showToast, dismissToast, info, success, warning, error }),
    [showToast, dismissToast, info, success, warning, error],
  )

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div
        aria-label="Notifications"
        aria-live="off"
        role="region"
        style={{
          position: 'fixed',
          top: 16,
          right: 16,
          zIndex: 1300,
          display: 'grid',
          width: 'min(380px, calc(100vw - 32px))',
          gap: 10,
          pointerEvents: 'none',
        }}
      >
        {toasts.map((toast) => (
          <div key={toast.id} style={{ pointerEvents: 'auto' }}>
            <Toast
              duration={toast.duration}
              message={toast.message}
              onDismiss={() => dismissToast(toast.id)}
              title={toast.title}
              variant={toast.variant}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export { ToastProvider }
