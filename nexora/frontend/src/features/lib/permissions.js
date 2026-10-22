import { WORKSPACE_ROLES } from './constants.js'

export const PERMISSIONS = Object.freeze({
  WORKSPACE_MANAGE: 'workspace:manage',
  MEMBER_MANAGE: 'member:manage',
  PROJECT_CREATE: 'project:create',
  PROJECT_EDIT: 'project:edit',
  PROJECT_DELETE: 'project:delete',
  TASK_CREATE: 'task:create',
  TASK_EDIT: 'task:edit',
  TASK_DELETE: 'task:delete',
  CONTENT_VIEW: 'content:view',
})

const ALL_PERMISSIONS = Object.freeze(Object.values(PERMISSIONS))

const ROLE_PERMISSIONS = Object.freeze({
  [WORKSPACE_ROLES.OWNER]: ALL_PERMISSIONS,
  [WORKSPACE_ROLES.ADMIN]: [
    PERMISSIONS.MEMBER_MANAGE,
    PERMISSIONS.PROJECT_CREATE,
    PERMISSIONS.PROJECT_EDIT,
    PERMISSIONS.PROJECT_DELETE,
    PERMISSIONS.TASK_CREATE,
    PERMISSIONS.TASK_EDIT,
    PERMISSIONS.TASK_DELETE,
    PERMISSIONS.CONTENT_VIEW,
  ],
  [WORKSPACE_ROLES.MEMBER]: [
    PERMISSIONS.PROJECT_CREATE,
    PERMISSIONS.PROJECT_EDIT,
    PERMISSIONS.TASK_CREATE,
    PERMISSIONS.TASK_EDIT,
    PERMISSIONS.CONTENT_VIEW,
  ],
  [WORKSPACE_ROLES.VIEWER]: [PERMISSIONS.CONTENT_VIEW],
})

export function getRolePermissions(role) {
  return ROLE_PERMISSIONS[String(role ?? '').toLowerCase()] ?? []
}

export function hasPermission(userOrRole, permission) {
  if (typeof permission !== 'string' || !permission) return false
  const role = typeof userOrRole === 'string'
    ? userOrRole
    : userOrRole?.role
  const permissions = [
    ...getRolePermissions(role),
    ...(Array.isArray(userOrRole?.permissions) ? userOrRole.permissions : []),
  ]
  return permissions.includes(permission)
}

export function hasAnyPermission(userOrRole, permissions = []) {
  return permissions.some((permission) => hasPermission(userOrRole, permission))
}

export function hasAllPermissions(userOrRole, permissions = []) {
  return permissions.every((permission) => hasPermission(userOrRole, permission))
}