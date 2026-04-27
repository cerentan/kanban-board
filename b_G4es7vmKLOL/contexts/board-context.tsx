"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import {
  Board,
  BoardData,
  Task,
  Column,
  TaskLabel,
  BOARDS_STORAGE_KEY,
  getBoardStorageKey,
  defaultColumns,
} from "@/lib/auth-types"
import { useAuth } from "./auth-context"

interface BoardContextType {
  boards: Board[]
  currentBoard: Board | null
  boardData: BoardData | null
  isLoading: boolean
  createBoard: (name: string) => Board
  deleteBoard: (boardId: string) => void
  selectBoard: (boardId: string) => void
  updateBoardName: (boardId: string, name: string) => void
  addTask: (columnId: string, title: string, description: string, label?: TaskLabel) => void
  updateTask: (taskId: string, title: string, description: string, label?: TaskLabel) => void
  deleteTask: (taskId: string) => void
  moveTask: (taskId: string, sourceColumnId: string, destColumnId: string, newIndex: number) => void
  addColumn: (title: string) => void
  updateColumn: (columnId: string, title: string) => void
  deleteColumn: (columnId: string) => void
}

const BoardContext = createContext<BoardContextType | undefined>(undefined)

export function BoardProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [boards, setBoards] = useState<Board[]>([])
  const [currentBoard, setCurrentBoard] = useState<Board | null>(null)
  const [boardData, setBoardData] = useState<BoardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load user's boards
  useEffect(() => {
    if (!user) {
      setBoards([])
      setCurrentBoard(null)
      setBoardData(null)
      setIsLoading(false)
      return
    }

    const stored = localStorage.getItem(BOARDS_STORAGE_KEY)
    if (stored) {
      try {
        const allBoards: Board[] = JSON.parse(stored)
        const userBoards = allBoards.filter((b) => b.userId === user.id)
        setBoards(userBoards)
      } catch {
        setBoards([])
      }
    }
    setIsLoading(false)
  }, [user])

  // Load board data when currentBoard changes
  useEffect(() => {
    if (!currentBoard) {
      setBoardData(null)
      return
    }

    const stored = localStorage.getItem(getBoardStorageKey(currentBoard.id))
    if (stored) {
      try {
        setBoardData(JSON.parse(stored))
      } catch {
        setBoardData(defaultColumns)
      }
    } else {
      setBoardData(defaultColumns)
    }
  }, [currentBoard])

  // Save board data
  useEffect(() => {
    if (currentBoard && boardData) {
      localStorage.setItem(getBoardStorageKey(currentBoard.id), JSON.stringify(boardData))
    }
  }, [boardData, currentBoard])

  const saveBoards = useCallback((newBoards: Board[]) => {
    const stored = localStorage.getItem(BOARDS_STORAGE_KEY)
    let allBoards: Board[] = []
    if (stored) {
      try {
        allBoards = JSON.parse(stored)
      } catch {
        allBoards = []
      }
    }

    // Remove current user's boards and add new ones
    const otherBoards = allBoards.filter((b) => !newBoards.some((nb) => nb.id === b.id) && b.userId !== user?.id)
    localStorage.setItem(BOARDS_STORAGE_KEY, JSON.stringify([...otherBoards, ...newBoards]))
  }, [user])

  const createBoard = useCallback(
    (name: string): Board => {
      if (!user) throw new Error("User not authenticated")

      const newBoard: Board = {
        id: `board-${Date.now()}`,
        name,
        userId: user.id,
        createdAt: new Date().toISOString(),
      }

      const newBoards = [...boards, newBoard]
      setBoards(newBoards)
      saveBoards(newBoards)

      // Initialize board with default columns
      localStorage.setItem(getBoardStorageKey(newBoard.id), JSON.stringify(defaultColumns))

      return newBoard
    },
    [user, boards, saveBoards]
  )

  const deleteBoard = useCallback(
    (boardId: string) => {
      const newBoards = boards.filter((b) => b.id !== boardId)
      setBoards(newBoards)
      saveBoards(newBoards)
      localStorage.removeItem(getBoardStorageKey(boardId))

      if (currentBoard?.id === boardId) {
        setCurrentBoard(null)
        setBoardData(null)
      }
    },
    [boards, currentBoard, saveBoards]
  )

  const selectBoard = useCallback(
    (boardId: string) => {
      const board = boards.find((b) => b.id === boardId)
      if (board) {
        setCurrentBoard(board)
      }
    },
    [boards]
  )

  const updateBoardName = useCallback(
    (boardId: string, name: string) => {
      const newBoards = boards.map((b) => (b.id === boardId ? { ...b, name } : b))
      setBoards(newBoards)
      saveBoards(newBoards)

      if (currentBoard?.id === boardId) {
        setCurrentBoard({ ...currentBoard, name })
      }
    },
    [boards, currentBoard, saveBoards]
  )

  const addTask = useCallback(
    (columnId: string, title: string, description: string, label?: TaskLabel) => {
      if (!boardData) return

      const taskId = `task-${Date.now()}`
      const newTask: Task = {
        id: taskId,
        title,
        description,
        columnId,
        label: label || null,
      }

      setBoardData({
        ...boardData,
        tasks: {
          ...boardData.tasks,
          [taskId]: newTask,
        },
        columns: {
          ...boardData.columns,
          [columnId]: {
            ...boardData.columns[columnId],
            taskIds: [...boardData.columns[columnId].taskIds, taskId],
          },
        },
      })
    },
    [boardData]
  )

  const updateTask = useCallback(
    (taskId: string, title: string, description: string, label?: TaskLabel) => {
      if (!boardData) return

      setBoardData({
        ...boardData,
        tasks: {
          ...boardData.tasks,
          [taskId]: {
            ...boardData.tasks[taskId],
            title,
            description,
            label: label !== undefined ? label : boardData.tasks[taskId].label,
          },
        },
      })
    },
    [boardData]
  )

  const deleteTask = useCallback(
    (taskId: string) => {
      if (!boardData) return

      const task = boardData.tasks[taskId]
      if (!task) return

      const { [taskId]: removed, ...remainingTasks } = boardData.tasks
      const column = boardData.columns[task.columnId]

      setBoardData({
        ...boardData,
        tasks: remainingTasks,
        columns: {
          ...boardData.columns,
          [task.columnId]: {
            ...column,
            taskIds: column.taskIds.filter((id) => id !== taskId),
          },
        },
      })
    },
    [boardData]
  )

  const moveTask = useCallback(
    (taskId: string, sourceColumnId: string, destColumnId: string, newIndex: number) => {
      if (!boardData) return

      const sourceColumn = boardData.columns[sourceColumnId]
      const destColumn = boardData.columns[destColumnId]

      const sourceTaskIds = sourceColumn.taskIds.filter((id) => id !== taskId)

      let destTaskIds: string[]
      if (sourceColumnId === destColumnId) {
        destTaskIds = [...sourceTaskIds]
        destTaskIds.splice(newIndex, 0, taskId)
      } else {
        destTaskIds = [...destColumn.taskIds]
        destTaskIds.splice(newIndex, 0, taskId)
      }

      setBoardData({
        ...boardData,
        tasks: {
          ...boardData.tasks,
          [taskId]: {
            ...boardData.tasks[taskId],
            columnId: destColumnId,
          },
        },
        columns: {
          ...boardData.columns,
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
      })
    },
    [boardData]
  )

  const addColumn = useCallback(
    (title: string) => {
      if (!boardData) return

      const columnId = `column-${Date.now()}`
      const newColumn: Column = {
        id: columnId,
        title,
        taskIds: [],
      }

      setBoardData({
        ...boardData,
        columns: {
          ...boardData.columns,
          [columnId]: newColumn,
        },
        columnOrder: [...boardData.columnOrder, columnId],
      })
    },
    [boardData]
  )

  const updateColumn = useCallback(
    (columnId: string, title: string) => {
      if (!boardData) return

      setBoardData({
        ...boardData,
        columns: {
          ...boardData.columns,
          [columnId]: {
            ...boardData.columns[columnId],
            title,
          },
        },
      })
    },
    [boardData]
  )

  const deleteColumn = useCallback(
    (columnId: string) => {
      if (!boardData) return

      const column = boardData.columns[columnId]
      const tasksToRemove = column.taskIds

      const { [columnId]: removed, ...remainingColumns } = boardData.columns
      const remainingTasks = { ...boardData.tasks }
      tasksToRemove.forEach((taskId) => {
        delete remainingTasks[taskId]
      })

      setBoardData({
        tasks: remainingTasks,
        columns: remainingColumns,
        columnOrder: boardData.columnOrder.filter((id) => id !== columnId),
      })
    },
    [boardData]
  )

  return (
    <BoardContext.Provider
      value={{
        boards,
        currentBoard,
        boardData,
        isLoading,
        createBoard,
        deleteBoard,
        selectBoard,
        updateBoardName,
        addTask,
        updateTask,
        deleteTask,
        moveTask,
        addColumn,
        updateColumn,
        deleteColumn,
      }}
    >
      {children}
    </BoardContext.Provider>
  )
}

export function useBoard() {
  const context = useContext(BoardContext)
  if (context === undefined) {
    throw new Error("useBoard must be used within a BoardProvider")
  }
  return context
}
