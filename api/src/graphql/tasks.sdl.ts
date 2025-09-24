export const schema = gql`
  type Task {
    id: String!
    title: String!
    detail: String
    projectId: String!
    project: Project!
    statusId: String
    status: TaskStatus
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Query {
    tasks: [Task!]!
    task(id: String!): Task
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
    createTask(input: CreateTaskInput!): Task!
    updateTask(id: String!, input: UpdateTaskInput!): Task!
    deleteTask(id: String!): Task!
  }
`
