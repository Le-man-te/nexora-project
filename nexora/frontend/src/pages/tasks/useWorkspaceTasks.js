import { useCallback, useEffect, useState } from 'react'
import { getCurrentUser } from '../../features/auth/auth.api.js'
import {
  listWorkspaceMembers,
  listWorkspaces,
} from '../../features/workspaces/components/workspaces.api.js'
import {
  getActiveWorkspaceId,
  setActiveWorkspaceId,
} from '../../features/workspaces/workspaceState.js'
import { listProjects } from '../projects/projects.api.js'
import { createTask, listTasks, updateTask } from './task.api.js'

const STATUS_LABELS = {
  todo: 'To do',
  in_progress: 'In progress',
  in_review: 'In review',
  done: 'Done',
}
const STATUS_VALUES = Object.fromEntries(
  Object.entries(STATUS_LABELS).map(([value, label]) => [label, value]),
)

function mapTask(task, projectsById, membersById) {
  const project = projectsById.get(task.projectId)
  const assignee = membersById.get(task.assignedTo)
  return {
    ...task,
    project: project?.name || 'Unknown project',
    assignee: assignee?.name || 'Unassigned',
    initials: assignee?.name
      ? assignee.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
      : '—',
    status: STATUS_LABELS[task.status] || task.status,
    priority: task.priority ? task.priority[0].toUpperCase() + task.priority.slice(1) : 'Medium',
    dueDate: task.dueDate || '',
  }
}

function useWorkspaceTasks() {
  const [workspaceId, setWorkspaceId] = useState('')
  const [workspaceName, setWorkspaceName] = useState('')
  const [projects, setProjects] = useState([])
  const [members, setMembers] = useState([])
  const [tasks, setTasks] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadData = useCallback(async (signal) => {
    const workspaceResult = await listWorkspaces({ signal })
    const availableWorkspaces = workspaceResult.workspaces || []
    const storedId = getActiveWorkspaceId()
    const workspace = availableWorkspaces.find((item) => item.id === storedId)
      || availableWorkspaces[0]
    if (!workspace) {
      setWorkspaceId('')
      setWorkspaceName('')
      setProjects([])
      setMembers([])
      setTasks([])
      setError('Create or join a workspace before adding projects and tasks.')
      return
    }

    setActiveWorkspaceId(workspace.id)
    setWorkspaceId(workspace.id)
    setWorkspaceName(workspace.name)
    const [projectResult, taskResult, memberResult, userResult] = await Promise.all([
      listProjects({ workspaceId: workspace.id }, { signal }),
      listTasks({ workspaceId: workspace.id }, { signal }),
      listWorkspaceMembers(workspace.id, { signal }),
      getCurrentUser({ signal }),
    ])
    const nextProjects = projectResult.projects || []
    const projectById = new Map(nextProjects.map((project) => [project.id, project]))
    const nextMembers = memberResult.members || []
    const memberById = new Map(nextMembers.map((member) => [member.id, member]))
    setProjects(nextProjects)
    setMembers(nextMembers)
    setTasks((taskResult.tasks || []).map((task) => mapTask(task, projectById, memberById)))
    setUser(userResult.user)
    setError('')
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    loadData(controller.signal)
      .catch((loadError) => {
        if (!controller.signal.aborted) setError(loadError.message || 'Could not load workspace tasks.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [loadData])

  const saveTask = useCallback(async (task, changes) => {
    const payload = {}
    if (Object.hasOwn(changes, 'status')) payload.status = STATUS_VALUES[changes.status] || changes.status
    if (Object.hasOwn(changes, 'priority')) payload.priority = changes.priority.toLowerCase()
    if (Object.hasOwn(changes, 'title')) payload.title = changes.title
    if (Object.hasOwn(changes, 'description')) payload.description = changes.description || null
    if (Object.hasOwn(changes, 'assignedTo')) payload.assignedTo = changes.assignedTo || null
    if (Object.hasOwn(changes, 'dueDate')) payload.dueDate = changes.dueDate || null

    const { task: savedTask } = await updateTask(task.id, payload)
    const projectById = new Map(projects.map((project) => [project.id, project]))
    const memberById = new Map(members.map((member) => [member.id, member]))
    const mappedTask = mapTask(savedTask, projectById, memberById)
    setTasks((current) => current.map((item) => item.id === task.id ? mappedTask : item))
    return mappedTask
  }, [members, projects])

  const addTask = useCallback(async (values) => {
    const payload = {
      ...values,
      status: 'todo',
      priority: values.priority.toLowerCase(),
    }
    const { task: savedTask } = await createTask(payload)
    const projectById = new Map(projects.map((project) => [project.id, project]))
    const memberById = new Map(members.map((member) => [member.id, member]))
    const mappedTask = mapTask(savedTask, projectById, memberById)
    setTasks((current) => [mappedTask, ...current])
    return mappedTask
  }, [members, projects])

  return {
    workspaceId,
    workspaceName,
    projects,
    members,
    tasks,
    user,
    loading,
    error,
    setError,
    saveTask,
    addTask,
  }
}

export default useWorkspaceTasks
