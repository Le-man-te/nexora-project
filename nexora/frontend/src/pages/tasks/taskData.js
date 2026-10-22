export const sampleTasks = [
  {
    id: 'review-wireframes',
    title: 'Review homepage wireframes',
    description: 'Share feedback on the latest homepage layouts before the design review.',
    project: 'Website redesign',
    assignee: 'Alex Morgan',
    initials: 'AM',
    dueDate: '2026-10-20',
    priority: 'High',
    status: 'In progress',
  },
  {
    id: 'brand-guidelines',
    title: 'Share updated brand guidelines',
    description: 'Post the updated brand guide and make sure the project team can find it.',
    project: 'Website redesign',
    assignee: 'Jordan Davis',
    initials: 'JD',
    dueDate: '2026-10-20',
    priority: 'Medium',
    status: 'To do',
  },
  {
    id: 'onboarding-flow',
    title: 'Finalize onboarding flow',
    description: 'Confirm the final onboarding steps and prepare the handoff notes.',
    project: 'Mobile app launch',
    assignee: 'Alex Morgan',
    initials: 'AM',
    dueDate: '2026-10-21',
    priority: 'High',
    status: 'In progress',
  },
  {
    id: 'campaign-references',
    title: 'Collect campaign references',
    description: 'Gather visual references for the Q4 campaign direction.',
    project: 'Q4 campaign',
    assignee: 'Sam Kim',
    initials: 'SK',
    dueDate: '2026-10-18',
    priority: 'Low',
    status: 'Done',
  },
  {
    id: 'mobile-test-plan',
    title: 'Draft mobile test plan',
    description: 'Outline the release test cases and note any device coverage gaps.',
    project: 'Mobile app launch',
    assignee: 'Riley Lee',
    initials: 'RL',
    dueDate: '2026-10-24',
    priority: 'Medium',
    status: 'To do',
  },
  {
    id: 'campaign-copy',
    title: 'Review launch email copy',
    description: 'Proofread the campaign launch email and confirm the final call to action.',
    project: 'Q4 campaign',
    assignee: 'Alex Morgan',
    initials: 'AM',
    dueDate: '2026-10-27',
    priority: 'Low',
    status: 'To do',
  },
]

export const taskProjects = [
  'Website redesign',
  'Mobile app launch',
  'Q4 campaign',
]

export const currentUser = 'Alex Morgan'

export function formatTaskDate(dateValue, options = { month: 'short', day: 'numeric' }) {
  if (!dateValue) return 'No due date'

  const date = new Date(`${dateValue}T12:00:00`)
  if (Number.isNaN(date.getTime())) return 'Invalid date'

  return new Intl.DateTimeFormat('en', options).format(date)
}

export function getDueLabel(dateValue, now = new Date()) {
  if (!dateValue) return 'No due date'

  const date = new Date(`${dateValue}T00:00:00`)
  if (Number.isNaN(date.getTime())) return 'Invalid date'

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  if (date.getTime() === today.getTime()) return 'Today'
  if (date.getTime() === tomorrow.getTime()) return 'Tomorrow'
  if (date < today) return 'Overdue'
  return formatTaskDate(dateValue)
}
