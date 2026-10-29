import { createBrowserRouter } from 'react-router-dom'
import DashboardPage from '../pages/dashboard/DashboardPage.jsx'
import CreateWorkSpacePage from '../pages/search/workspaces/CreateWorkSpacePage.jsx'
import WorkSpaceListPage from '../pages/search/workspaces/WorkSpaceListPage.jsx'
import WorkSpaceMembersPage from '../pages/search/workspaces/WorkSpaceMembersPage.jsx'
import WorkSpaceSettingPage from '../pages/search/workspaces/WorkSpaceSettingPage.jsx'
import AboutPage from '../pages/public/AboutPage.jsx'
import FeaturesPage from '../pages/public/FeaturesPage.jsx'
import LandingPage from '../pages/public/LandingPage.jsx'
import NotFoundPage from '../pages/public/NotFoundPge.jsx'
import { PrivacyPage, TermsPage } from '../pages/public/LegalPages.jsx'
import CalendarPage from '../pages/tasks/CalendarPage.jsx'
import MyTasksPage from '../pages/tasks/MyTasksPage.jsx'
import TaskDetailsPage from '../pages/tasks/TaskDetalsPage.jsx'
import TasksPage from '../pages/tasks/TasksPage.jsx'
import SearchResultPage from '../pages/search/SearchResultPage.jsx'
import ArchivedProjectsPage from '../pages/projects/ArchivedProjectsPage.jsx'
import CreateProjectPage from '../pages/projects/CreateProjectPage.jsx'
import ProjectDetailPage from '../pages/projects/ProjectDetailPage.jsx'
import ProjectsPage from '../pages/projects/projectsPage.jsx'
import NotesPage from '../pages/notes/NotesPage.jsx'
import NoteEditorPage from '../pages/notes/NoteEditorPage.jsx'
import NoteDetailsPage from '../pages/notes/NoteDetailsPage.jsx'
import DocumentsPage from '../pages/documents/DocumentsPage.jsx'
import NotificationsPage from '../pages/notifications/NotificationsPage.jsx'
import ActivityPage from '../pages/collaborations/ActivityPage.jsx'
import InvitationPage from '../pages/collaborations/InvitationPge.jsx'
import LoginPage from '../pages/auth/LoginPage.jsx'
import RegisterPage from '../pages/auth/RegisterPage.jsx'
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPge.jsx'
import ResetPasswordPage from '../pages/auth/ResetPasswordPage.jsx'
import VerifyEmailPage from '../pages/auth/VerifyEmailPage.jsx'
import AnalyticsRoute from '../pages/analytics/AnalyticsRoute.jsx'
import AiAssistantRoute from '../pages/ai/AiAssistantRoute.jsx'
import UnauthorizedPage from '../pages/errors/UnauthorizedPage.jsx'
import ForbiddenPage from '../pages/errors/ForbiddenPge.jsx'
import ServerErrorPage from '../pages/errors/ServerErrorPage.jsx'
import AdminPage from '../pages/admin/AdminPage.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />,
  },
  {
    path: '/verify-email',
    element: <VerifyEmailPage />,
  },
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />,
  },
  {
    path: '/forbidden',
    element: <ForbiddenPage />,
  },
  {
    path: '/server-error',
    element: <ServerErrorPage />,
  },
  {
    path: '/dashboard',
    element: <DashboardPage />,
  },
  {
    path: '/admin',
    element: <AdminPage />,
  },
  {
    path: '/analytics',
    element: <AnalyticsRoute />,
  },
  {
    path: '/ai',
    element: <AiAssistantRoute />,
  },
  {
    path: '/tasks',
    element: <TasksPage />,
  },
  {
    path: '/tasks/:taskId',
    element: <TaskDetailsPage />,
  },
  {
    path: '/my-tasks',
    element: <MyTasksPage />,
  },
  {
    path: '/calendar',
    element: <CalendarPage />,
  },
  {
    path: '/search',
    element: <SearchResultPage />,
  },
  {
    path: '/projects',
    element: <ProjectsPage />,
  },
  {
    path: '/projects/new',
    element: <CreateProjectPage />,
  },
  {
    path: '/projects/archived',
    element: <ArchivedProjectsPage />,
  },
  {
    path: '/projects/:projectId',
    element: <ProjectDetailPage />,
  },
  {
    path: '/notes',
    element: <NotesPage />,
  },
  {
    path: '/notes/new',
    element: <NoteEditorPage />,
  },
  {
    path: '/notes/:noteId/edit',
    element: <NoteEditorPage />,
  },
  {
    path: '/notes/:noteId',
    element: <NoteDetailsPage />,
  },
  {
    path: '/documents',
    element: <DocumentsPage />,
  },
  {
    path: '/notifications',
    element: <NotificationsPage />,
  },
  {
    path: '/collaborations/activity',
    element: <ActivityPage />,
  },
  {
    path: '/collaborations/invitations',
    element: <InvitationPage />,
  },
  {
    path: '/features',
    element: <FeaturesPage />,
  },
  {
    path: '/about',
    element: <AboutPage />,
  },
  {
    path: '/privacy',
    element: <PrivacyPage />,
  },
  {
    path: '/terms',
    element: <TermsPage />,
  },
  {
    path: '/workspaces/create',
    element: <CreateWorkSpacePage />,
  },
  {
    path: '/workspaces',
    element: <WorkSpaceListPage />,
  },
  {
    path: '/workspaces/members',
    element: <WorkSpaceMembersPage />,
  },
  {
    path: '/workspaces/settings',
    element: <WorkSpaceSettingPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])

export default router