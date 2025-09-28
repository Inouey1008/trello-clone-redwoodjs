import type { Prisma, Task } from '@prisma/client'

import type { ScenarioData } from '@redwoodjs/testing/api'

export const standard = defineScenario<Prisma.TaskCreateArgs>({
  task: {
    one: {
      data: {
        title: 'String',
        updatedAt: '2025-09-25T06:14:02.840Z',
        project: {
          create: { title: 'String', updatedAt: '2025-09-25T06:14:02.843Z' },
        },
      },
    },
    two: {
      data: {
        title: 'String',
        updatedAt: '2025-09-25T06:14:02.843Z',
        project: {
          create: { title: 'String', updatedAt: '2025-09-25T06:14:02.846Z' },
        },
      },
    },
  },
})

export type StandardScenario = ScenarioData<Task, 'task'>
