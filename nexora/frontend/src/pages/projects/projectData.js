export {
  formatProjectDate,
  getProjectInitials,
  getProjectTaskCounts,
} from './projects.utils.js'

export const sampleProjects = [
  {
    id: 'website-redesign',
    name: 'Website redesign',
    description: 'Refresh the marketing site and improve conversion.',
    color: 'violet',
    status: 'In progress',
    progress: 72,
    dueDate: '2026-10-28',
    members: ['Leta Tesfaye', 'Jordan Davis', 'Sam Kim'],
    tasks: [
      { id: 'wireframes', title: 'Review homepage wireframes', status: 'In progress', assignee: 'Leta Tesfaye', dueDate: '2026-10-20' },
      { id: 'guidelines', title: 'Share updated brand guidelines', status: 'To do', assignee: 'Jordan Davis', dueDate: '2026-10-20' },
      { id: 'prototype', title: 'Prepare interactive prototype', status: 'Done', assignee: 'Sam Kim', dueDate: '2026-10-17' },
    ],
  },
  {
    id: 'mobile-app-launch',
    name: 'Mobile app launch',
    description: 'Prepare the first Nexora mobile release.',
    color: 'blue',
    status: 'In progress',
    progress: 46,
    dueDate: '2026-11-04',
    members: ['Leta Tesfaye', 'Riley Lee'],
    tasks: [
      { id: 'onboarding', title: 'Finalize onboarding flow', status: 'In progress', assignee: 'Leta Tesfaye', dueDate: '2026-10-21' },
      { id: 'test-plan', title: 'Draft mobile test plan', status: 'To do', assignee: 'Riley Lee', dueDate: '2026-10-24' },
    ],
  },
  {
    id: 'q4-campaign',
    name: 'Q4 campaign',
    description: 'Plan and publish the end-of-year campaign.',
    color: 'orange',
    status: 'Planning',
    progress: 28,
    dueDate: '2026-11-12',
    members: ['Sam Kim', 'Leta Tesfaye', 'Riley Lee'],
    tasks: [
      { id: 'references', title: 'Collect campaign references', status: 'Done', assignee: 'Sam Kim', dueDate: '2026-10-18' },
      { id: 'email-copy', title: 'Review launch email copy', status: 'To do', assignee: 'Leta Tesfaye', dueDate: '2026-10-27' },
    ],
  },
  {
    id: 'customer-research',
    name: 'Customer research',
    description: 'Understand customer needs and identify product opportunities.',
    color: 'green',
    status: 'Planning',
    progress: 12,
    dueDate: '2026-11-21',
    members: ['Jordan Davis', 'Sam Kim'],
    tasks: [
      { id: 'interview-plan', title: 'Draft interview questions', status: 'To do', assignee: 'Jordan Davis', dueDate: '2026-10-30' },
    ],
  },
]

export const sampleArchivedProjects = [
  {
    id: 'spring-launch',
    name: 'Spring launch',
    description: 'Introduced the first Nexora public preview.',
    color: 'pink',
    status: 'Archived',
    progress: 100,
    dueDate: '2026-06-14',
    members: ['Leta Tesfaye', 'Sam Kim'],
    archivedAt: 'Jun 20, 2026',
    tasks: [],
  },
]
