"use client"

import { useState, useEffect, useCallback } from "react"
import { KanbanData, Task, STORAGE_KEY, initialData } from "@/lib/kanban-types"

export function useKanbanStore() {
  const [data, setData] = useState<KanbanData>(initialData)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load data from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as KanbanData
        setData(parsed)
      } catch {
        setData(initialData)
      }
    }
    setIsLoaded(true)
  }, [])

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    }
  }, [data, isLoaded])

  const addTask = useCallback((columnId: string, title: string, description: string) => {
    const taskId = `task-${Date.now()}`
    const newTask: Task = {
      id: taskId,
      title,
      description,
      columnId,
    }

    setData((prev) => ({
      ...prev,
      tasks: {
        ...prev.tasks,
        [taskId]: newTask,
      },
      columns: {
        ...prev.columns,
        [columnId]: {
          ...prev.columns[columnId],
          taskIds: [...prev.columns[columnId].taskIds, taskId],
        },
      },
    }))
  }, [])

  const updateTask = useCallback((taskId: string, title: string, description: string) => {
    setData((prev) => ({
      ...prev,
      tasks: {
        ...prev.tasks,
        [taskId]: {
          ...prev.tasks[taskId],
          title,
          description,
        },
      },
    }))
  }, [])

  const deleteTask = useCallback((taskId: string) => {
    setData((prev) => {
      const task = prev.tasks[taskId]
      if (!task) return prev

      const { [taskId]: removed, ...remainingTasks } = prev.tasks
      const column = prev.columns[task.columnId]

      return {
        ...prev,
        tasks: remainingTasks,
        columns: {
          ...prev.columns,
          [task.columnId]: {
            ...column,
            taskIds: column.taskIds.filter((id) => id !== taskId),
          },
        },
      }
    })
  }, [])

  const moveTask = useCallback(
    (taskId: string, sourceColumnId: string, destColumnId: string, newIndex: number) => {
      setData((prev) => {
        const sourceColumn = prev.columns[sourceColumnId]
        const destColumn = prev.columns[destColumnId]

        const sourceTaskIds = sourceColumn.taskIds.filter((id) => id !== taskId)

        let destTaskIds: string[]
        if (sourceColumnId === destColumnId) {
          destTaskIds = [...sourceTaskIds]
          destTaskIds.splice(newIndex, 0, taskId)
        } else {
          destTaskIds = [...destColumn.taskIds]
          destTaskIds.splice(newIndex, 0, taskId)
        }

        return {
          ...prev,
          tasks: {
            ...prev.tasks,
            [taskId]: {
              ...prev.tasks[taskId],
              columnId: destColumnId,
            },
          },
          columns: {
            ...prev.columns,
            [sourceColumnId]: {
              ...sourceColumn,
              taskIds: sourceColumnId === destColumnId ? destTaskIds : sourceTaskIds,
            },
            ...(sourceColumnId !== destColumnId && {
              [destColumnId]: {
                ...destColumn,
                taskIds: destTaskIds,
              },
            }),
          },
        }
      })
    },
    []
  )

  return {
    data,
    isLoaded,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
  }
}
