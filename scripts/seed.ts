import { db } from 'api/src/lib/db'

// Manually apply seeds via the `yarn rw prisma db seed` command.
//
// Seeds automatically run the first time you run the `yarn rw prisma migrate dev`
// command and every time you run the `yarn rw prisma migrate reset` command.
//
// See https://redwoodjs.com/docs/database-seeds for more info

export default async () => {
  try {
    // Clear project data
    const project = await db.project.create({
      data: {
        title: 'サンプルプロジェクト',
        detail: 'サンプルプロジェクト詳細',
      },
    })

    // Create task status data
    const todoStatus = await db.taskStatus.create({
      data: {
        title: 'ToDo',
        detail: '未着手',
        projectId: project.id,
      },
    })

    const doingStatus = await db.taskStatus.create({
      data: {
        title: 'Doing',
        detail: '進行中',
        projectId: project.id,
      },
    })

    const doneStatus = await db.taskStatus.create({
      data: {
        title: 'Done',
        detail: '完了',
        projectId: project.id,
      },
    })

    // Create task
    const tasks = [
      {
        title: 'Backlogタスク1',
        detail: 'Backlogタスク1の詳細',
        projectId: project.id,
        statusId: null, // バックログ
      },
      {
        title: 'Backlogタスク2',
        detail: 'Backlogタスク2の詳細',
        projectId: project.id,
        statusId: null, // バックログ
      },
      {
        title: 'ToDoタスク',
        detail: 'ToDoタスクの詳細',
        projectId: project.id,
        statusId: todoStatus.id,
      },
      {
        title: 'Doingタスク',
        detail: 'Doingタスクの詳細',
        projectId: project.id,
        statusId: doingStatus.id,
      },
      {
        title: 'Doneタスク',
        detail: 'Doneタスクの詳細',
        projectId: project.id,
        statusId: doneStatus.id,
      },
    ]

    await db.task.createMany({ data: tasks })

    console.info('DB seeded successfully')
  } catch (error) {
    console.error(error)
  }
}
