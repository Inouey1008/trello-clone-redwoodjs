import React, { useEffect, useState } from 'react'

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
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

  const style = {
    transform: `translate3d(${transform?.x ?? 0}px, ${transform?.y ?? 0}px, 0)`,
    opacity: isDragging ? 0.5 : 1,
    border: '1px solid #eee',
    padding: '8px',
    margin: '8px 0',
    backgroundColor: 'white',
    cursor: 'grab',
  }

  return (
    <li ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <h4>{task.title}</h4>
      {task.detail && <p>{task.detail}</p>}
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

  const style = {
    backgroundColor: isOver ? '#f0f0f0' : 'transparent',
    minHeight: '100px',
    padding: '10px',
    border: '1px solid #ccc',
    flex: 1,
  }

  return (
    <article ref={setNodeRef} style={style}>
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

  const sensors = useSensors(useSensor(PointerSensor))

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
      <div>
        <header>
          <h1>{project.title}</h1>
          {project.detail && <p>{project.detail}</p>}
        </header>
        <section>
          <h2>バックログ</h2>
          <DroppableContainer id="backlog">
            {backlogTasks.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {backlogTasks.map((task) => (
                  <DraggableTask key={task.id} task={task} />
                ))}
              </ul>
            ) : (
              <p>バックログにタスクはありません</p>
            )}
          </DroppableContainer>
        </section>
        <section>
          <h2>カンバンボード</h2>
          <div style={{ display: 'flex', gap: '20px' }}>
            {project.statuses.map((status) => (
              <DroppableContainer key={status.id} id={status.id}>
                <h3>{status.title}</h3>
                {tasksByStatus[status.id]?.length > 0 ? (
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {tasksByStatus[status.id].map((task) => (
                      <DraggableTask key={task.id} task={task} />
                    ))}
                  </ul>
                ) : (
                  <p>タスクなし</p>
                )}
              </DroppableContainer>
            ))}
          </div>
        </section>
      </div>
      <DragOverlay>
        {activeTask ? (
          <div
            style={{
              border: '1px solid #eee',
              padding: '8px',
              backgroundColor: 'white',
              opacity: 0.8,
            }}
          >
            <h4>{activeTask.title}</h4>
            {activeTask.detail && <p>{activeTask.detail}</p>}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
