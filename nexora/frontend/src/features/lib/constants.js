export const APP_NAME = 'Nexora'

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api')
  .replace(/\/+$/, '')

export const STORAGE_KEYS = Object.freeze({
  theme: 'nexora:theme',
  activeWorkspace: 'nexora:active-workspace',
})

export const THEMES = Object.freeze({
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
})

export const WORKSPACE_ROLES = Object.freeze({
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
  VIEWER: 'viewer',
})

export const PROJECT_STATUSES = Object.freeze([
  'Planning',
  'In progress',
  'Done',
  'Archived',
])