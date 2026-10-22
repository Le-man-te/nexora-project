import { useEffect, useRef, useState } from 'react'
import './ProfileSettingsPage.css'

const defaultProfile = {
  name: 'Alex Morgan',
  email: 'alex@studionorth.com',
  role: 'Product Designer',
  bio: 'Designing thoughtful experiences with the Studio North team.',
  timezone: 'America/Los_Angeles',
}

const timezones = [
  ['America/Los_Angeles', 'Pacific Time (Los Angeles)'],
  ['America/Denver', 'Mountain Time (Denver)'],
  ['America/Chicago', 'Central Time (Chicago)'],
  ['America/New_York', 'Eastern Time (New York)'],
  ['Europe/London', 'Greenwich Mean Time (London)'],
  ['Europe/Paris', 'Central European Time (Paris)'],
  ['Asia/Dubai', 'Gulf Standard Time (Dubai)'],
  ['Asia/Kolkata', 'India Standard Time (Kolkata)'],
  ['Asia/Tokyo', 'Japan Standard Time (Tokyo)'],
  ['Australia/Sydney', 'Australian Eastern Time (Sydney)'],
]

function getInitials(name) {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'
  return words.length === 1
    ? words[0].slice(0, 2).toUpperCase()
    : `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase()
}

function ProfileSettingsPage({
  profile: profileProp = defaultProfile,
  onSave,
}) {
  const [profile, setProfile] = useState(profileProp)
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  const avatarUrlRef = useRef('')
  const [feedback, setFeedback] = useState('')
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => () => {
    if (avatarUrlRef.current) URL.revokeObjectURL(avatarUrlRef.current)
  }, [])

  function updateProfile(key, value) {
    setProfile((current) => ({ ...current, [key]: value }))
    setFeedback('')
    setError('')
  }

  function handleAvatarChange(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Choose an image file for your profile photo.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Choose an image smaller than 5 MB.')
      return
    }

    if (avatarUrlRef.current) URL.revokeObjectURL(avatarUrlRef.current)
    avatarUrlRef.current = URL.createObjectURL(file)
    setAvatarPreview(avatarUrlRef.current)
    setAvatarFile(file)
    setFeedback('')
    setError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setFeedback('')
    setError('')

    const updatedProfile = {
      ...profile,
      name: profile.name.trim(),
      email: profile.email.trim(),
      role: profile.role.trim(),
      bio: profile.bio.trim(),
      avatarFile,
    }

    if (!updatedProfile.name) {
      setError('Enter your name before saving your profile.')
      return
    }
    if (!onSave) {
      setFeedback('Preview only: profile changes are not saved until an account service is connected.')
      return
    }

    setIsSaving(true)
    try {
      await onSave(updatedProfile)
      setProfile({
        name: updatedProfile.name,
        email: updatedProfile.email,
        role: updatedProfile.role,
        bio: updatedProfile.bio,
        timezone: updatedProfile.timezone,
      })
      setFeedback('Your profile was updated.')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save your profile.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="profile-settings-page">
      <div className="profile-settings-container">
        <header className="profile-settings-header">
          <span className="profile-settings-eyebrow">ACCOUNT PREFERENCES</span>
          <h1>Profile</h1>
          <p>Manage how your name and details appear to your workspace.</p>
        </header>

        {(feedback || error) && (
          <p className={`profile-settings-message${error ? ' is-error' : ''}`} role={error ? 'alert' : 'status'}>
            {error || feedback}
          </p>
        )}

        <form className="profile-settings-form" onSubmit={handleSubmit}>
          <section aria-labelledby="profile-photo-heading" className="profile-settings-card">
            <div className="profile-settings-card-heading">
              <h2 id="profile-photo-heading">Profile photo</h2>
              <p>Choose a photo to help teammates recognize you.</p>
            </div>
            <div className="profile-settings-photo">
              {avatarPreview
                ? <img alt="Profile preview" className="profile-settings-avatar" src={avatarPreview} />
                : <span aria-label={`${getInitials(profile.name)} initials`} className="profile-settings-avatar">
                    {getInitials(profile.name)}
                  </span>}
              <div className="profile-settings-photo-controls">
                <label className="profile-settings-upload-button" htmlFor="profile-photo">
                  Choose photo
                  <input
                    accept="image/*"
                    id="profile-photo"
                    onChange={handleAvatarChange}
                    type="file"
                  />
                </label>
                <span>JPG, PNG, GIF, or WebP · up to 5 MB</span>
              </div>
            </div>
          </section>

          <section aria-labelledby="profile-details-heading" className="profile-settings-card">
            <div className="profile-settings-card-heading">
              <h2 id="profile-details-heading">Personal details</h2>
              <p>This information is visible to people in your workspace.</p>
            </div>
            <div className="profile-settings-fields">
              <label htmlFor="profile-name">
                Full name
                <input
                  autoComplete="name"
                  id="profile-name"
                  maxLength={80}
                  onChange={(event) => updateProfile('name', event.target.value)}
                  required
                  value={profile.name}
                />
              </label>
              <label htmlFor="profile-email">
                Email address
                <input
                  autoComplete="email"
                  id="profile-email"
                  onChange={(event) => updateProfile('email', event.target.value)}
                  required
                  type="email"
                  value={profile.email}
                />
                <small>Changing your email may require verification.</small>
              </label>
              <label htmlFor="profile-role">
                Job title
                <input
                  autoComplete="organization-title"
                  id="profile-role"
                  maxLength={80}
                  onChange={(event) => updateProfile('role', event.target.value)}
                  placeholder="e.g. Product Designer"
                  value={profile.role}
                />
              </label>
              <label htmlFor="profile-bio">
                About
                <textarea
                  id="profile-bio"
                  maxLength={240}
                  onChange={(event) => updateProfile('bio', event.target.value)}
                  placeholder="Share a little about what you do..."
                  rows={4}
                  value={profile.bio}
                />
                <small>{profile.bio.length}/240 characters</small>
              </label>
              <label htmlFor="profile-timezone">
                Time zone
                <select
                  id="profile-timezone"
                  onChange={(event) => updateProfile('timezone', event.target.value)}
                  value={profile.timezone}
                >
                  {timezones.map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <small>Used to display dates and times in your workspace.</small>
              </label>
            </div>
          </section>

          <div className="profile-settings-save-row">
            <span>{onSave ? 'Remember to save your profile changes.' : 'Account service not connected. Changes cannot be applied yet.'}</span>
            <button disabled={isSaving} type="submit">
              {isSaving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}

export default ProfileSettingsPage