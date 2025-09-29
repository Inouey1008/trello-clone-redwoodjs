import { useState } from 'react'

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

export const Loading = () => <div>Loading...</div>

export const Empty = () => <div>Empty</div>

export const Failure = ({
  error,
}: CellFailureProps<FindProjectQueryVariables>) => (
  <div style={{ color: 'red' }}>Error: {error?.message}</div>
)

// ドラッグ可能なタスクコンポーネント
const DraggableTask = ({ task }: { task: any }) => {
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

// ドロップ可能なコンテナコンポーネント
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

  // バックログタスク（statusId が null）
  const backlogTasks = project.tasks.filter((task) => task.statusId === null)

  // ステータス別タスク
  const tasksByStatus = project.statuses.reduce(
    (acc, status) => {
      acc[status.id] = project.tasks.filter(
        (task) => task.statusId === status.id
      )
      return acc
    },
    {} as Record<string, typeof project.tasks>
  )

  // ドラッグ&ドロップのセンサー設定
  const sensors = useSensors(useSensor(PointerSensor))

  // ドラッグ開始時の処理
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const task = project.tasks.find((t) => t.id === active.id)
    setActiveTask(task || null)
  }

  // ドラッグ終了時の処理
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const taskId = active.id as string
    const newStatusId = over.id === 'backlog' ? null : (over.id as string)

    // TODO: タスクのステータス更新ミューテーションを実行
    console.log(`Task ${taskId} moved to ${newStatusId || 'backlog'}`)
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div>
        {/* プロジェクト情報 */}
        <header>
          <h1>{project.title}</h1>
          {project.detail && <p>{project.detail}</p>}
        </header>

        {/* バックログセクション */}
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

        {/* カンバンボードセクション */}
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

      {/* ドラッグ中のオーバーレイ */}
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
