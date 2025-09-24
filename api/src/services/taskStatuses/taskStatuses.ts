import type {
  QueryResolvers,
  MutationResolvers,
  TaskStatusRelationResolvers,
} from 'types/graphql'

import { db } from 'src/lib/db'

export const taskStatuses: QueryResolvers['taskStatuses'] = () => {
  return db.taskStatus.findMany()
}

export const taskStatus: QueryResolvers['taskStatus'] = ({ id }) => {
  return db.taskStatus.findUnique({
    where: { id },
  })
}

export const createTaskStatus: MutationResolvers['createTaskStatus'] = ({
  input,
}) => {
  return db.taskStatus.create({
    data: input,
  })
}

export const updateTaskStatus: MutationResolvers['updateTaskStatus'] = ({
  id,
  input,
}) => {
  return db.taskStatus.update({
    data: input,
    where: { id },
  })
}

export const deleteTaskStatus: MutationResolvers['deleteTaskStatus'] = ({
  id,
}) => {
  return db.taskStatus.delete({
    where: { id },
  })
}

export const TaskStatus: TaskStatusRelationResolvers = {
  project: (_obj, { root }) => {
    return db.taskStatus.findUnique({ where: { id: root?.id } }).project()
  },
  tasks: (_obj, { root }) => {
    return db.taskStatus.findUnique({ where: { id: root?.id } }).tasks()
  },
}
