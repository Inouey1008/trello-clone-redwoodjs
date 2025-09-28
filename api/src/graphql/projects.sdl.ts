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
    projects: [Project!]! @skipAuth
    project(id: String!): Project @skipAuth
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
    createProject(input: CreateProjectInput!): Project! @skipAuth
    updateProject(id: String!, input: UpdateProjectInput!): Project! @skipAuth
    deleteProject(id: String!): Project! @skipAuth
  }
`
