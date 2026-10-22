import Spinner from '../components/Spinner.jsx'

function LoadingOverlay({
  loading = true,
  label = 'Loading',
  fullscreen = false,
  children,
  className = '',
  style,
}) {
  const overlayStyle = fullscreen
    ? {
        position: 'fixed',
        inset: 0,
        zIndex: 1200,
      }
    : {
        position: 'absolute',
        inset: 0,
        zIndex: 1,
      }

  return (
    <div
      aria-busy={loading || undefined}
      className={className}
      style={{
        position: fullscreen ? undefined : 'relative',
        ...style,
      }}
    >
      {children}
      {loading && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            padding: 20,
            background: fullscreen ? 'rgba(255, 255, 255, 0.82)' : 'rgba(255, 255, 255, 0.76)',
            color: '#555469',
            fontSize: 13,
            ...overlayStyle,
          }}
        >
          <Spinner label={label} size={22} />
          <span>{label}</span>
        </div>
      )}
    </div>
  )
}

export default LoadingOverlay