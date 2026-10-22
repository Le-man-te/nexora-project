import { useState } from 'react'
import './ApperanceSettingsPage.css'

const defaultPreferences = {
  theme: 'system',
  accent: 'violet',
  density: 'comfortable',
}

const accentColors = [
  { id: 'violet', name: 'Violet', color: '#7556d8' },
  { id: 'blue', name: 'Blue', color: '#3976c5' },
  { id: 'teal', name: 'Teal', color: '#248b83' },
  { id: 'rose', name: 'Rose', color: '#c34e79' },
  { id: 'orange', name: 'Orange', color: '#c6762e' },
]

function ApperanceSettingsPage({
  preferences: preferencesProp = defaultPreferences,
  onSave,
}) {
  const [preferences, setPreferences] = useState(preferencesProp)
  const [feedback, setFeedback] = useState('')
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  function updatePreference(key, value) {
    setPreferences((current) => ({ ...current, [key]: value }))
    setFeedback('')
    setError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setFeedback('')
    setError('')

    if (!onSave) {
      setFeedback('Preview only: appearance preferences are not saved until a settings service is connected.')
      return
    }

    setIsSaving(true)
    try {
      await onSave(preferences)
      setFeedback('Your appearance preferences were saved.')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save appearance preferences.')
    } finally {
      setIsSaving(false)
    }
  }

  const selectedAccent = accentColors.find((accent) => accent.id === preferences.accent) ?? accentColors[0]

  return (
    <main className="appearance-settings-page">
      <div className="appearance-settings-container">
        <header className="appearance-settings-header">
          <span className="appearance-settings-eyebrow">ACCOUNT PREFERENCES</span>
          <h1>Appearance</h1>
          <p>Personalize how Nexora looks on your device.</p>
        </header>

        {(feedback || error) && (
          <p className={`appearance-settings-message${error ? ' is-error' : ''}`} role={error ? 'alert' : 'status'}>
            {error || feedback}
          </p>
        )}

        <form className="appearance-settings-form" onSubmit={handleSubmit}>
          <section aria-labelledby="theme-heading" className="appearance-settings-card">
            <div className="appearance-settings-card-heading">
              <h2 id="theme-heading">Theme</h2>
              <p>Choose a color scheme for your workspace.</p>
            </div>
            <div aria-label="Color theme" className="appearance-settings-theme-options" role="group">
              {[
                { id: 'light', title: 'Light', description: 'A bright, clean workspace', icon: '☀' },
                { id: 'dark', title: 'Dark', description: 'Easy on the eyes in low light', icon: '☾' },
                { id: 'system', title: 'System', description: 'Follow your device setting', icon: '◐' },
              ].map((theme) => (
                <button
                  aria-pressed={preferences.theme === theme.id}
                  className={`appearance-settings-theme${preferences.theme === theme.id ? ' is-selected' : ''}`}
                  key={theme.id}
                  onClick={() => updatePreference('theme', theme.id)}
                  type="button"
                >
                  <span aria-hidden="true" className={`appearance-settings-theme-preview ${theme.id}`}>
                    <i />
                    <i />
                    <i />
                  </span>
                  <span className="appearance-settings-theme-copy">
                    <strong><span aria-hidden="true">{theme.icon}</span> {theme.title}</strong>
                    <small>{theme.description}</small>
                  </span>
                  <span aria-hidden="true" className="appearance-settings-radio" />
                </button>
              ))}
            </div>
          </section>

          <section aria-labelledby="accent-heading" className="appearance-settings-card">
            <div className="appearance-settings-card-heading">
              <h2 id="accent-heading">Accent color</h2>
              <p>Pick a highlight color for buttons and interactive elements.</p>
            </div>
            <div aria-label="Accent color" className="appearance-settings-colors" role="group">
              {accentColors.map((accent) => (
                <button
                  aria-label={accent.name}
                  aria-pressed={preferences.accent === accent.id}
                  className={`appearance-settings-color${preferences.accent === accent.id ? ' is-selected' : ''}`}
                  key={accent.id}
                  onClick={() => updatePreference('accent', accent.id)}
                  style={{ '--appearance-accent': accent.color }}
                  title={accent.name}
                  type="button"
                >
                  <span />
                </button>
              ))}
              <span className="appearance-settings-color-name">{selectedAccent.name}</span>
            </div>
          </section>

          <section aria-labelledby="density-heading" className="appearance-settings-card">
            <div className="appearance-settings-card-heading">
              <h2 id="density-heading">Display density</h2>
              <p>Adjust the spacing used in lists and workspace panels.</p>
            </div>
            <div aria-label="Display density" className="appearance-settings-density" role="group">
              {[
                { id: 'comfortable', title: 'Comfortable', description: 'More breathing room' },
                { id: 'compact', title: 'Compact', description: 'See more at a glance' },
              ].map((density) => (
                <button
                  aria-pressed={preferences.density === density.id}
                  className={`appearance-settings-density-option${preferences.density === density.id ? ' is-selected' : ''}`}
                  key={density.id}
                  onClick={() => updatePreference('density', density.id)}
                  type="button"
                >
                  <span className={`appearance-settings-density-icon ${density.id}`} aria-hidden="true">
                    <i /><i /><i />
                  </span>
                  <span>
                    <strong>{density.title}</strong>
                    <small>{density.description}</small>
                  </span>
                  <span aria-hidden="true" className="appearance-settings-radio" />
                </button>
              ))}
            </div>
          </section>

          <section aria-labelledby="preview-heading" className="appearance-settings-card">
            <div className="appearance-settings-card-heading">
              <h2 id="preview-heading">Preview</h2>
              <p>See your selected theme and accent color together.</p>
            </div>
            <div
              className={`appearance-settings-preview ${preferences.theme === 'dark' ? 'is-dark' : ''} ${preferences.density}`}
              style={{ '--appearance-accent': selectedAccent.color }}
            >
              <div className="appearance-settings-preview-sidebar" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
              <div className="appearance-settings-preview-content">
                <strong>Project overview</strong>
                <span>Bring your team’s work together.</span>
                <div className="appearance-settings-preview-task">
                  <i />
                  <span>Review project updates</span>
                  <small>Today</small>
                </div>
                <button type="button" tabIndex={-1}>New task</button>
              </div>
            </div>
          </section>

          <div className="appearance-settings-save-row">
            <span>{onSave ? 'Save to apply your appearance preferences.' : 'Settings service not connected. Changes are preview-only.'}</span>
            <button disabled={isSaving} type="submit">
              {isSaving ? 'Saving…' : 'Save preferences'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}

export default ApperanceSettingsPage