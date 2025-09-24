export const schema = gql`
  type Task {
    id: String!
    title: String!
    detail: String
    projectId: String!
    Project: Project!
    statusId: String
    status: TaskStatus
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Query {
    tasks: [Task!]! @requireAuth
    task(id: String!): Task @requireAuth
  }

  input CreateTaskInput {
    title: String!
    detail: String
    projectId: String!
    statusId: String
  }

  input UpdateTaskInput {
    title: String
    detail: String
    projectId: String
    statusId: String
  }

  type Mutation {
    createTask(input: CreateTaskInput!): Task! @requireAuth
    updateTask(id: String!, input: UpdateTaskInput!): Task! @requireAuth
    deleteTask(id: String!): Task! @requireAuth
  }
`
