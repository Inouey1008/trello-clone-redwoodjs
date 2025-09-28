export const schema = gql`
  type TaskStatus {
    id: String!
    title: String!
    detail: String
    projectId: String!
    project: Project!
    tasks: [Task]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Query {
    taskStatuses: [TaskStatus!]! @skipAuth
    taskStatus(id: String!): TaskStatus @skipAuth
  }

  input CreateTaskStatusInput {
    title: String!
    detail: String
    projectId: String!
  }

  input UpdateTaskStatusInput {
    title: String
    detail: String
    projectId: String
  }

  type Mutation {
    createTaskStatus(input: CreateTaskStatusInput!): TaskStatus! @skipAuth
    updateTaskStatus(id: String!, input: UpdateTaskStatusInput!): TaskStatus!
      @skipAuth
    deleteTaskStatus(id: String!): TaskStatus! @skipAuth
  }
`
