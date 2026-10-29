import { useCallback, useEffect, useState } from 'react'
import {
  listWorkspaceMembers,
  listWorkspaces,
} from '../../features/workspaces/components/workspaces.api.js'
import {
  getActiveWorkspaceId,
  setActiveWorkspaceId,
} from '../../features/workspaces/workspaceState.js'
import { listArchivedProjects, listProjects } from './projects.api.js'
import { listTasks } from '../tasks/task.api.js'

const PROJECT_STATUSES = {
  planning: 'Planning',
  in_progress: 'In progress',
  on_hold: 'On hold',
  completed: 'Completed',
}
const TASK_STATUSES = {
  todo: 'To do',
  in_progress: 'In progress',
  in_review: 'In review',
  done: 'Done',
}
const COLORS = ['violet', 'blue', 'orange', 'green']

function mapProjects(projects, tasks, members) {
  const taskProjectIds = new Set(tasks.map((task) => task.projectId))
  const membersById = new Map(members.map((member) => [member.id, member.name]))
  const tasksByProject = new Map()
  for (const task of tasks) {
    const projectTasks = tasksByProject.get(task.projectId) || []
    projectTasks.push({
      ...task,
      status: TASK_STATUSES[task.status] || task.status,
      assignee: membersById.get(task.assignedTo) || 'Unassigned',
    })
    tasksByProject.set(task.projectId, projectTasks)
  }

  return projects.map((project, index) => {
    const projectTasks = tasksByProject.get(project.id) || []
    const completed = projectTasks.filter((task) => task.status === 'Done').length
    return {
      ...project,
      status: PROJECT_STATUSES[project.status] || project.status,
      dueDate: project.dueDate || '',
      color: COLORS[index % COLORS.length],
      progress: projectTasks.length ? Math.round((completed / projectTasks.length) * 100) : 0,
      members: members.map((member) => member.name),
      tasks: projectTasks,
      archivedAt: project.archivedAt
        ? new Date(project.archivedAt).toLocaleDateString()
        : '',
      taskCount: taskProjectIds.has(project.id) ? projectTasks.length : 0,
    }
  })
}

function useWorkspaceProjects({ archived = false } = {}) {
  const [projects, setProjects] = useState([])
  const [workspaceId, setWorkspaceId] = useState('')
  const [workspaceName, setWorkspaceName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async (signal) => {
    const workspaceResult = await listWorkspaces({ signal })
    const workspaces = workspaceResult.workspaces || []
    const storedId = getActiveWorkspaceId()
    const workspace = workspaces.find((item) => item.id === storedId) || workspaces[0]
    if (!workspace) {
      setProjects([])
      setWorkspaceId('')
      setWorkspaceName('')
      setError('Create or join a workspace before managing projects.')
      return
    }

    setActiveWorkspaceId(workspace.id)
    setWorkspaceId(workspace.id)
    setWorkspaceName(workspace.name)
    const [projectResult, taskResult, memberResult] = await Promise.all([
      archived
        ? listArchivedProjects({ workspaceId: workspace.id }, { signal })
        : listProjects({ workspaceId: workspace.id }, { signal }),
      listTasks({ workspaceId: workspace.id }, { signal }),
      listWorkspaceMembers(workspace.id, { signal }),
    ])
    setProjects(mapProjects(
      projectResult.projects || [],
      taskResult.tasks || [],
      memberResult.members || [],
    ))
    setError('')
  }, [archived])

  useEffect(() => {
    const controller = new AbortController()
    refresh(controller.signal)
      .catch((loadError) => {
        if (!controller.signal.aborted) setError(loadError.message || 'Could not load projects.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [refresh])

  return { projects, workspaceId, workspaceName, loading, error, setError, refresh }
}

export default useWorkspaceProjects
