import type { Prisma, TaskStatus } from '@prisma/client'

import type { ScenarioData } from '@redwoodjs/testing/api'

export const standard = defineScenario<Prisma.TaskStatusCreateArgs>({
  taskStatus: {
    one: {
      data: {
        title: 'String',
        updatedAt: '2025-09-24T15:47:09.034Z',
        project: {
          create: { title: 'String', updatedAt: '2025-09-24T15:47:09.037Z' },
        },
      },
    },
    two: {
      data: {
        title: 'String',
        updatedAt: '2025-09-24T15:47:09.037Z',
        project: {
          create: { title: 'String', updatedAt: '2025-09-24T15:47:09.041Z' },
        },
      },
    },
  },
})

export type StandardScenario = ScenarioData<TaskStatus, 'taskStatus'>
