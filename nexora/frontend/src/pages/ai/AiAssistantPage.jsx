import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout.jsx'
import Icon from '../../layouts/Icon.jsx'
import MobileNavigation from '../../layouts/MobileNavigation.jsx'
import Navbar from '../../layouts/Navbar.jsx'
import Sidebar from '../../layouts/Sidebar.jsx'
import './AiAssistantPage.css'

const projects = [
  { name: 'Website redesign', color: 'violet' },
  { name: 'Mobile app launch', color: 'blue' },
  { name: 'Q4 campaign', color: 'orange' },
]

const navigation = [
  { label: 'Overview', icon: 'grid' },
  { label: 'My tasks', icon: 'check', count: 4 },
  { label: 'Projects', icon: 'folder' },
  { label: 'Calendar', icon: 'calendar' },
  { label: 'Notes', icon: 'note' },
  { label: 'Documents', icon: 'document' },
  { label: 'AI Assistant', icon: 'ai' },
  { label: 'Analytics', icon: 'chart' },
  { label: 'Activity', icon: 'spark' },
  { label: 'Invitations', icon: 'plus', count: 2 },
]

const mobileNavigation = [
  { label: 'Overview', icon: 'grid' },
  { label: 'AI Assistant', icon: 'ai' },
  { label: 'Projects', icon: 'folder' },
  { label: 'Activity', icon: 'spark' },
]

const suggestions = [
  { icon: 'check', label: 'What should I focus on today?', prompt: 'What should I focus on today?' },
  { icon: 'folder', label: 'Summarize project progress', prompt: 'Summarize project progress' },
  { icon: 'spark', label: 'Help me plan this week', prompt: 'Help me plan this week' },
]

const initialMessages = [
  {
    id: 'welcome',
    role: 'assistant',
    content: 'Hi Alex! I’m here to help you make sense of the work and find a clear next step.',
    detail: 'Try asking about your tasks, project progress, or planning your week.',
  },
]

function createReply(prompt) {
  const query = prompt.toLowerCase()

  if (query.includes('focus') || query.includes('today') || query.includes('task')) {
    return {
      content: 'A good place to start is the work that unlocks other work.',
      points: [
        'Review homepage wireframes — high priority, due today.',
        'Finalize the onboarding flow — high priority, due tomorrow.',
        'Share updated brand guidelines — due today; Jordan is waiting on this.',
      ],
      detail: 'Suggested from your sample task list.',
    }
  }

  if (query.includes('project') || query.includes('progress') || query.includes('status')) {
    return {
      content: 'Here’s a quick snapshot of what’s moving across Studio North.',
      points: [
        'Website redesign — 72% complete (18 of 25 tasks).',
        'Mobile app launch — 46% complete (11 of 24 tasks).',
        'Q4 campaign — 28% complete (7 of 25 tasks).',
      ],
      detail: 'Based on sample workspace project data.',
    }
  }

  if (query.includes('plan') || query.includes('week') || query.includes('schedule')) {
    return {
      content: 'Let’s make the week feel manageable. Start with a few clear priorities.',
      points: [
        'Today: review the homepage wireframes and share the brand guidelines.',
        'Tomorrow: protect a focus block to finalize the onboarding flow.',
        'Before Friday: check in on Q4 campaign progress and unblock the next milestone.',
      ],
      detail: 'A draft plan from sample workspace tasks. Adjust it to fit your team.',
    }
  }

  return {
    content: 'I can help you get oriented around your workspace.',
    points: [
      'Ask “What should I focus on today?” for a task shortlist.',
      'Ask “Summarize project progress” for a quick project snapshot.',
      'Ask “Help me plan this week” for a starting point.',
    ],
    detail: 'This assistant preview uses example workspace data; it is not connected to a live AI service.',
  }
}

function AssistantMark({ small = false }) {
  return (
    <span className={`ai-assistant-mark${small ? ' is-small' : ''}`}>
      <Icon name="ai" size={small ? 15 : 19} />
    </span>
  )
}

function AssistantReply({ message }) {
  return (
    <div className="ai-message-row">
      <AssistantMark small />
      <article className="ai-message assistant-message">
        <strong className="ai-message-author">Nexora AI <span>PREVIEW</span></strong>
        <p>{message.content}</p>
        {message.points && (
          <ul>
            {message.points.map((point) => <li key={point}>{point}</li>)}
          </ul>
        )}
        {message.detail && <span className="ai-message-detail">{message.detail}</span>}
      </article>
    </div>
  )
}

function AssistantQuestion({ message }) {
  return (
    <div className="ai-message-row user-row">
      <article className="ai-message user-message"><p>{message.content}</p></article>
      <span aria-label="Alex Morgan" className="ai-user-avatar">AM</span>
    </div>
  )
}

function AiAssistantPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [prompt, setPrompt] = useState('')
  const [messages, setMessages] = useState(initialMessages)
  const [notice, setNotice] = useState('')

  function navigateToSection(section) {
    const paths = {
      Overview: '/dashboard',
      'My tasks': '/my-tasks',
      Projects: '/projects',
      Calendar: '/calendar',
      Notes: '/notes',
      Documents: '/documents',
      'AI Assistant': '/ai',
      Analytics: '/analytics',
      Activity: '/collaborations/activity',
      Invitations: '/collaborations/invitations',
    }
    if (paths[section]) navigate(paths[section])
  }

  function submitSearch(query) {
    const value = query.trim()
    if (value) navigate(`/search?q=${encodeURIComponent(value)}`)
  }

  function sendPrompt(value = prompt) {
    const content = value.trim()
    if (!content) return

    setMessages((current) => [
      ...current,
      { id: `question-${Date.now()}`, role: 'user', content },
      { id: `answer-${Date.now()}`, role: 'assistant', ...createReply(content) },
    ])
    setPrompt('')
    setNotice('')
  }

  function handleSubmit(event) {
    event.preventDefault()
    sendPrompt()
  }

  function startNewChat() {
    setMessages(initialMessages)
    setPrompt('')
    setNotice('Started a fresh conversation.')
  }

  return (
    <DashboardLayout
      className="dashboard-animated ai-app"
      sidebar={
        <Sidebar
          activeSection="AI Assistant"
          navigation={navigation}
          onAddProject={() => navigate('/projects/new')}
          onNavigate={navigateToSection}
          onUpgrade={() => navigate('/workspaces/settings')}
          projects={projects}
          user={{ name: 'Alex Morgan', email: 'alex@studionorth.com', initials: 'AM' }}
        />
      }
      navbar={
        <Navbar
          onInvite={() => navigate('/collaborations/invitations')}
          onNotifications={() => navigate('/notifications')}
          onSearchChange={setSearch}
          onSearchSubmit={submitSearch}
          notificationCount={1}
          searchValue={search}
          section="AI Assistant"
          workspaceName="Studio North"
        />
      }
      mobileNavigation={
        <MobileNavigation activeSection="AI Assistant" items={mobileNavigation} onNavigate={navigateToSection} />
      }
    >
      <div className="ai-page">
        <header className="ai-page-heading">
          <div>
            <span className="ai-eyebrow"><span /> YOUR THOUGHT PARTNER</span>
            <h1>AI Assistant</h1>
            <p>A little clarity for your next big thing.</p>
          </div>
          <button className="ai-new-chat" onClick={startNewChat} type="button">
            <Icon name="plus" size={16} />
            New conversation
          </button>
        </header>

        {notice && <div className="ai-notice" role="status">{notice}</div>}

        <div className="ai-workspace">
          <main aria-label="AI conversation" className="ai-chat-panel">
            <div className="ai-chat-topline">
              <div className="ai-chat-title">
                <AssistantMark />
                <span><strong>Workspace assistant</strong><small><i /> Ready to think with you</small></span>
              </div>
              <span className="ai-preview-badge">SAMPLE DATA</span>
            </div>

            <div aria-live="polite" className="ai-conversation">
              {messages.length === 1 ? (
                <>
                  <div className="ai-welcome">
                    <span className="ai-welcome-spark" aria-hidden="true">✦</span>
                    <h2>What’s on your mind, Alex?</h2>
                    <p>Ask a question or pick a starting point. We’ll figure out the next step together.</p>
                  </div>
                  <AssistantReply message={messages[0]} />
                  <div className="ai-suggestions">
                    <span className="ai-suggestions-label">A FEW PLACES TO START</span>
                    {suggestions.map((suggestion) => (
                      <button key={suggestion.label} onClick={() => sendPrompt(suggestion.prompt)} type="button">
                        <span><Icon name={suggestion.icon} size={15} /></span>
                        {suggestion.label}
                        <span className="ai-suggestion-arrow">↗</span>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="ai-message-list">
                  {messages.map((message) => message.role === 'user'
                    ? <AssistantQuestion key={message.id} message={message} />
                    : <AssistantReply key={message.id} message={message} />)}
                </div>
              )}
            </div>

            <form className="ai-composer" onSubmit={handleSubmit}>
              <label className="ai-composer-label" htmlFor="ai-prompt">Your message</label>
              <textarea
                id="ai-prompt"
                onChange={(event) => setPrompt(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault()
                    sendPrompt()
                  }
                }}
                placeholder="Ask anything about your work..."
                rows={2}
                value={prompt}
              />
              <div className="ai-composer-footer">
                <span><kbd>Enter</kbd> to send <span className="ai-shortcut-divider">·</span> <kbd>Shift</kbd> + <kbd>Enter</kbd> for a new line</span>
                <button aria-label="Send message" disabled={!prompt.trim()} type="submit"><Icon name="arrow" size={17} /></button>
              </div>
            </form>
          </main>

          <aside aria-label="Assistant context" className="ai-context-panel">
            <div className="ai-context-heading"><span>✦</span><h2>In your corner</h2></div>
            <p className="ai-context-intro">A little context helps turn a big question into a clear next step.</p>
            <section className="ai-context-card">
              <span className="ai-context-label">YOUR WORKSPACE</span>
              <strong>Studio North</strong>
              <span>4 teammates · 3 active projects</span>
              <div className="ai-context-avatars" aria-label="4 workspace teammates">
                <i className="lavender">AM</i><i className="peach">JD</i><i className="blue">SK</i><i className="mint">RL</i>
              </div>
            </section>
            <section className="ai-context-links">
              <h3>Explore your workspace</h3>
              <button onClick={() => navigate('/my-tasks')} type="button"><span className="ai-context-link-icon tasks"><Icon name="check" size={14} /></span><span><strong>Your tasks</strong><small>See what’s next</small></span><b>→</b></button>
              <button onClick={() => navigate('/projects')} type="button"><span className="ai-context-link-icon projects"><Icon name="folder" size={14} /></span><span><strong>Projects</strong><small>Check team progress</small></span><b>→</b></button>
              <button onClick={() => navigate('/analytics')} type="button"><span className="ai-context-link-icon analytics"><Icon name="chart" size={14} /></span><span><strong>Analytics</strong><small>See the bigger picture</small></span><b>→</b></button>
            </section>
            <div className="ai-context-note"><Icon name="spark" size={15} /><p>This assistant preview uses example workspace content. It doesn’t send your messages to an AI service.</p></div>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default AiAssistantPage