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
    taskStatuses: [TaskStatus!]! @requireAuth
    taskStatus(id: String!): TaskStatus @requireAuth
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
    createTaskStatus(input: CreateTaskStatusInput!): TaskStatus! @requireAuth
    updateTaskStatus(id: String!, input: UpdateTaskStatusInput!): TaskStatus!
      @requireAuth
    deleteTaskStatus(id: String!): TaskStatus! @requireAuth
  }
`
