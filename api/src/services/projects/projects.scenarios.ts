import type { Prisma, Project } from '@prisma/client'

import type { ScenarioData } from '@redwoodjs/testing/api'

export const standard = defineScenario<Prisma.ProjectCreateArgs>({
  project: {
    one: { data: { title: 'String', updatedAt: '2025-09-24T15:46:16.589Z' } },
    two: { data: { title: 'String', updatedAt: '2025-09-24T15:46:16.589Z' } },
  },
})

export type StandardScenario = ScenarioData<Project, 'project'>
