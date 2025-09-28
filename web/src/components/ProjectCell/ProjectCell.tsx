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

export const Success = ({
  project,
}: CellSuccessProps<FindProjectQuery, FindProjectQueryVariables>) => {
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

  return (
    <div>
      {/* プロジェクト情報 */}
      <header>
        <h1>{project.title}</h1>
        {project.detail && <p>{project.detail}</p>}
      </header>

      {/* バックログセクション */}
      <section>
        <h2>バックログ</h2>
        {backlogTasks.length > 0 ? (
          <ul>
            {backlogTasks.map((task) => (
              <li key={task.id}>
                <h3>{task.title}</h3>
                {task.detail && <p>{task.detail}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <p>バックログにタスクはありません</p>
        )}
      </section>

      {/* カンバンボードセクション */}
      <section>
        <h2>カンバンボード</h2>
        <div style={{ display: 'flex', gap: '20px' }}>
          {project.statuses.map((status) => (
            <article
              key={status.id}
              style={{ flex: 1, border: '1px solid #ccc', padding: '10px' }}
            >
              <h3>{status.title}</h3>
              {tasksByStatus[status.id]?.length > 0 ? (
                <ul>
                  {tasksByStatus[status.id].map((task) => (
                    <li
                      key={task.id}
                      style={{
                        border: '1px solid #eee',
                        padding: '8px',
                        margin: '8px 0',
                      }}
                    >
                      <h4>{task.title}</h4>
                      {task.detail && <p>{task.detail}</p>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>タスクなし</p>
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
