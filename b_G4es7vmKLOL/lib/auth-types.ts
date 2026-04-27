export interface User {
  id: string
  email: string
  name: string
  createdAt: string
}

export interface StoredUser extends User {
  password: string
}

export interface Board {
  id: string
  name: string
  userId: string
  createdAt: string
}

export interface BoardData {
  tasks: Record<string, Task>
  columns: Record<string, Column>
  columnOrder: string[]
}

export type TaskLabel = "urgent" | "development" | "design" | null

export interface Task {
  id: string
  title: string
  description: string
  columnId: string
  label?: TaskLabel
}

export const TASK_LABELS: Record<string, { name: string; color: string; bgColor: string }> = {
  urgent: { name: "Acil", color: "text-red-700 dark:text-red-400", bgColor: "bg-red-100 dark:bg-red-900/50" },
  development: { name: "Geliştirme", color: "text-blue-700 dark:text-blue-400", bgColor: "bg-blue-100 dark:bg-blue-900/50" },
  design: { name: "Tasarım", color: "text-purple-700 dark:text-purple-400", bgColor: "bg-purple-100 dark:bg-purple-900/50" },
}

export interface Column {
  id: string
  title: string
  taskIds: string[]
}

export const AUTH_STORAGE_KEY = "taskflow-users"
export const CURRENT_USER_KEY = "taskflow-current-user"
export const BOARDS_STORAGE_KEY = "taskflow-boards"

export function getBoardStorageKey(boardId: string): string {
  return `taskflow-board-${boardId}`
}

export const defaultColumns: BoardData = {
  tasks: {},
  columns: {
    "column-1": {
      id: "column-1",
      title: "Yapılacaklar",
      taskIds: [],
    },
    "column-2": {
      id: "column-2",
      title: "Devam Edenler",
      taskIds: [],
    },
    "column-3": {
      id: "column-3",
      title: "Bitenler",
      taskIds: [],
    },
  },
  columnOrder: ["column-1", "column-2", "column-3"],
}
