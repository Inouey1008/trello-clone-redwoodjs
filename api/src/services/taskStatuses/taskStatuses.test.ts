import type { TaskStatus } from '@prisma/client'

import {
  taskStatuses,
  taskStatus,
  createTaskStatus,
  updateTaskStatus,
  deleteTaskStatus,
} from './taskStatuses'
import type { StandardScenario } from './taskStatuses.scenarios'

// Generated boilerplate tests do not account for all circumstances
// and can fail without adjustments, e.g. Float.
//           Please refer to the RedwoodJS Testing Docs:
//       https://redwoodjs.com/docs/testing#testing-services
// https://redwoodjs.com/docs/testing#jest-expect-type-considerations

describe('taskStatuses', () => {
  scenario('returns all taskStatuses', async (scenario: StandardScenario) => {
    const result = await taskStatuses()

    expect(result.length).toEqual(Object.keys(scenario.taskStatus).length)
  })

  scenario(
    'returns a single taskStatus',
    async (scenario: StandardScenario) => {
      const result = await taskStatus({ id: scenario.taskStatus.one.id })

      expect(result).toEqual(scenario.taskStatus.one)
    }
  )

  scenario('creates a taskStatus', async (scenario: StandardScenario) => {
    const result = await createTaskStatus({
      input: {
        title: 'String',
        projectId: scenario.taskStatus.two.projectId,
        updatedAt: '2025-09-24T15:47:08.995Z',
      },
    })

    expect(result.title).toEqual('String')
    expect(result.projectId).toEqual(scenario.taskStatus.two.projectId)
    expect(result.updatedAt).toEqual(new Date('2025-09-24T15:47:08.995Z'))
  })

  scenario('updates a taskStatus', async (scenario: StandardScenario) => {
    const original = (await taskStatus({
      id: scenario.taskStatus.one.id,
    })) as TaskStatus
    const result = await updateTaskStatus({
      id: original.id,
      input: { title: 'String2' },
    })

    expect(result.title).toEqual('String2')
  })

  scenario('deletes a taskStatus', async (scenario: StandardScenario) => {
    const original = (await deleteTaskStatus({
      id: scenario.taskStatus.one.id,
    })) as TaskStatus
    const result = await taskStatus({ id: original.id })

    expect(result).toEqual(null)
  })
})
