export interface Task {
  id: string
  title: string
  description: string
  columnId: string
}

export interface Column {
  id: string
  title: string
  taskIds: string[]
}

export interface KanbanData {
  tasks: Record<string, Task>
  columns: Record<string, Column>
  columnOrder: string[]
}

export const STORAGE_KEY = "kanban-board-data"

export const initialData: KanbanData = {
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
