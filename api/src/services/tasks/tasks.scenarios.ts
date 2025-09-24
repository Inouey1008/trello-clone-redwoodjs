import type { Prisma, Task } from '@prisma/client'

import type { ScenarioData } from '@redwoodjs/testing/api'

export const standard = defineScenario<Prisma.TaskCreateArgs>({
  task: {
    one: {
      data: {
        title: 'String',
        updatedAt: '2025-09-24T15:47:10.573Z',
        Project: {
          create: { title: 'String', updatedAt: '2025-09-24T15:47:10.577Z' },
        },
      },
    },
    two: {
      data: {
        title: 'String',
        updatedAt: '2025-09-24T15:47:10.577Z',
        Project: {
          create: { title: 'String', updatedAt: '2025-09-24T15:47:10.581Z' },
        },
      },
    },
  },
})

export type StandardScenario = ScenarioData<Task, 'task'>
