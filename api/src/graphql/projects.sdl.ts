export const schema = gql`
  type Project {
    id: String!
    title: String!
    detail: String
    tasks: [Task]!
    statuses: [TaskStatus]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Query {
    projects: [Project!]!
    project(id: String!): Project
  }

  input CreateProjectInput {
    title: String!
    detail: String
  }

  input UpdateProjectInput {
    title: String
    detail: String
  }

  type Mutation {
    createProject(input: CreateProjectInput!): Project!
    updateProject(id: String!, input: UpdateProjectInput!): Project!
    deleteProject(id: String!): Project!
  }
`
