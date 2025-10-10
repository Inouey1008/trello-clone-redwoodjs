import React, { useEffect, useState } from 'react'

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { FindProjectQuery, FindProjectQueryVariables } from 'types/graphql'

import type {
  CellSuccessProps,
  CellFailureProps,
  TypedDocumentNode,
} from '@redwoodjs/web'
import { useMutation } from '@redwoodjs/web'

export const QUERY: TypedDocumentNode<
  FindProjectQuery,
  FindProjectQueryVariables
> = gql`
  query FindProjectQuery($id: String!) {
    project: project(id: $id) {
      id
      title
      detail
      createdAt
      updatedAt
      tasks {
        id
        title
        detail
        statusId
        createdAt
        status {
          id
          title
          detail
        }
      }
      statuses {
        id
        title
        detail
      }
    }
  }
`

const UPDATE_TASK_MUTATION = gql`
  mutation UpdateTaskMutation($id: String!, $input: UpdateTaskInput!) {
    updateTask(id: $id, input: $input) {
      id
      statusId
    }
  }
`

const CREATE_TASK_MUTATION = gql`
  mutation CreateTaskMutation($input: CreateTaskInput!) {
    createTask(input: $input) {
      id
      title
      detail
      projectId
      statusId
    }
  }
`

const DELETE_TASK_MUTATION = gql`
  mutation DeleteTaskMutation($id: String!) {
    deleteTask(id: $id) {
      id
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => <div>Empty</div>

export const Failure = ({
  error,
}: CellFailureProps<FindProjectQueryVariables>) => (
  <div style={{ color: 'red' }}>Error: {error?.message}</div>
)

const DraggableTask = ({
  task,
}: {
  task: FindProjectQuery['project']['tasks'][0]
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
    })

  const transformStyle = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined

  return (
    <li
      ref={setNodeRef}
      style={transformStyle}
      className={`
        bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3
        cursor-grab active:cursor-grabbing
        ${
          isDragging
            ? 'opacity-60'
            : 'hover:shadow-md transition-shadow duration-150'
        }
      `}
      {...listeners}
      {...attributes}
    >
      <h4 className="font-medium text-gray-900 text-sm leading-tight mb-1">
        {task.title}
      </h4>
      {task.detail && (
        <p className="text-xs text-gray-600 leading-relaxed">{task.detail}</p>
      )}
    </li>
  )
}

const DroppableContainer = ({
  id,
  children,
}: {
  id: string
  children: React.ReactNode
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
  })

  return (
    <article
      ref={setNodeRef}
      className={`
        flex-1 min-h-32 p-4 rounded-xl
        transition-all duration-200 ease-in-out
        ${
          id === 'backlog'
            ? 'bg-slate-50 border-2 border-dashed border-slate-300'
            : 'bg-gray-50 border border-gray-200'
        }
        ${
          isOver
            ? 'bg-blue-50 border-blue-300 shadow-md ring-2 ring-blue-200'
            : ''
        }
      `}
    >
      {children}
    </article>
  )
}

export const Success = ({
  project,
}: CellSuccessProps<FindProjectQuery, FindProjectQueryVariables>) => {
  const [activeTask, setActiveTask] = useState<
    (typeof project.tasks)[0] | null
  >(null)

  const [localTasks, setLocalTasks] = useState(project.tasks)

  const [updateTask] = useMutation(UPDATE_TASK_MUTATION, {
    refetchQueries: [{ query: QUERY, variables: { id: project.id } }],
    awaitRefetchQueries: true,
    onError: (error) => {
      console.error('Task update failed:', error)
      setLocalTasks(project.tasks)
      alert('タスクの更新に失敗しました')
    },
  })

  useEffect(() => {
    setLocalTasks(project.tasks)
  }, [project.tasks])

  const backlogTasks = localTasks.filter((task) => {
    return task.statusId === null
  })

  const tasksByStatus = project.statuses.reduce(
    (acc, status) => {
      acc[status.id] = localTasks.filter((task) => task.statusId === status.id)
      return acc
    },
    {} as Record<string, typeof localTasks>
  )

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 1,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 0,
        tolerance: 1,
      },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const task = project.tasks.find((t) => t.id === active.id)
    setActiveTask(task || null)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const taskId = active.id as string
    const newStatusId = over.id === 'backlog' ? null : (over.id as string)

    const currentTask = localTasks.find((task) => task.id === taskId)
    if (!currentTask || currentTask.statusId === newStatusId) return

    const updatedTasks = localTasks.map((task) => {
      return task.id === taskId ? { ...task, statusId: newStatusId } : task
    })
    setLocalTasks(updatedTasks)

    try {
      await updateTask({
        variables: {
          id: taskId,
          input: { statusId: newStatusId },
        },
      })
    } catch (error) {
      console.error('Update task failed:', error)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            {project.title}
          </h1>
          {project.detail && (
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {project.detail}
            </p>
          )}
        </header>
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
            <span className="bg-slate-100 p-2 rounded-lg mr-3">📋</span>
            Backlog
          </h2>
          <DroppableContainer id="backlog">
            {backlogTasks.length > 0 ? (
              <ul className="space-y-2">
                {backlogTasks.map((task) => (
                  <DraggableTask key={task.id} task={task} />
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-center py-8 italic">
                バックログにタスクはありません
              </p>
            )}
          </DroppableContainer>
        </section>
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
            <span className="bg-blue-100 p-2 rounded-lg mr-3">🚀</span>
            Kanban board
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {project.statuses.map((status) => (
              <DroppableContainer key={status.id} id={status.id}>
                <h3 className="font-semibold text-gray-700 mb-4 text-center bg-white py-2 px-4 rounded-lg shadow-sm border border-gray-100">
                  {status.title}
                </h3>
                {tasksByStatus[status.id]?.length > 0 ? (
                  <ul className="space-y-2">
                    {tasksByStatus[status.id].map((task) => (
                      <DraggableTask key={task.id} task={task} />
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400 text-center py-8 text-sm italic">
                    タスクなし
                  </p>
                )}
              </DroppableContainer>
            ))}
          </div>
        </section>
      </div>
      <DragOverlay>
        {activeTask ? (
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-3">
            <h4 className="font-medium text-gray-900 text-sm leading-tight mb-1">
              {activeTask.title}
            </h4>
            {activeTask.detail && (
              <p className="text-xs text-gray-600 leading-relaxed">
                {activeTask.detail}
              </p>
            )}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
