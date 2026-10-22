import { useNavigate } from 'react-router-dom'
import ProjectsPageShell from './ProjectsPageShell.jsx'
import ProjectForm from './components/ProjectForm.jsx'
import './ProjectsPages.css'

function CreateProjectPage({ onCreate }) {
  const navigate = useNavigate()
  function submitProject(project) {
    onCreate?.(project)
    navigate('/projects', {
      state: {
        createdProject: project,
      },
    })
  }

  return (
    <ProjectsPageShell>
      <span className="projects-eyebrow">PROJECT SETUP</span>
      <header className="projects-page-heading">
        <div>
          <h1>Create a project</h1>
          <p>Give your team a shared goal to work toward.</p>
        </div>
      </header>

      <ProjectForm onSubmit={submitProject} />
    </ProjectsPageShell>
  )
}

export default CreateProjectPage
