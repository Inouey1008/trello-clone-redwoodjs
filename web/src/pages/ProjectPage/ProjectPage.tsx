import ProjectCell from 'src/components/ProjectCell'

type ProjectPageProps = {
  id: string
}

const ProjectPage = ({ id }: ProjectPageProps) => {
  return <ProjectCell id={id} />
}

export default ProjectPage
