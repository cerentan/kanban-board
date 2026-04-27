"use client"

import { useState } from "react"
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from "@dnd-kit/core"
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { useBoard } from "@/contexts/board-context"
import { useAuth } from "@/contexts/auth-context"
import { BoardColumn } from "./board-column"
import { Task, TASK_LABELS } from "@/lib/auth-types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldLabel } from "@/components/ui/field"
import { GripVertical, ArrowLeft, Plus, LayoutGrid, LogOut } from "lucide-react"

export function BoardView() {
  const { user, logout } = useAuth()
  const {
    currentBoard,
    boardData,
    selectBoard,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    addColumn,
    updateColumn,
    deleteColumn,
  } = useBoard()

  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [isAddColumnOpen, setIsAddColumnOpen] = useState(false)
  const [newColumnName, setNewColumnName] = useState("")

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8,
    },
  })
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250,
      tolerance: 5,
    },
  })
  const keyboardSensor = useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  })
  const sensors = useSensors(pointerSensor, touchSensor, keyboardSensor)

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    if (!boardData) return
    const task = boardData.tasks[active.id as string]
    if (task) {
      setActiveTask(task)
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over || !boardData) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeTaskData = boardData.tasks[activeId]
    if (!activeTaskData) return

    const overColumn = boardData.columns[overId]
    if (overColumn) {
      if (activeTaskData.columnId !== overId) {
        moveTask(activeId, activeTaskData.columnId, overId, overColumn.taskIds.length)
      }
      return
    }

    const overTask = boardData.tasks[overId]
    if (overTask && activeTaskData.columnId !== overTask.columnId) {
      const overColumnData = boardData.columns[overTask.columnId]
      const overIndex = overColumnData.taskIds.indexOf(overId)
      moveTask(activeId, activeTaskData.columnId, overTask.columnId, overIndex)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over || !boardData) return

    const activeId = active.id as string
    const overId = over.id as string

    if (activeId === overId) return

    const activeTaskData = boardData.tasks[activeId]
    if (!activeTaskData) return

    const overTask = boardData.tasks[overId]
    if (overTask && activeTaskData.columnId === overTask.columnId) {
      const column = boardData.columns[activeTaskData.columnId]
      const overIndex = column.taskIds.indexOf(overId)
      moveTask(activeId, activeTaskData.columnId, activeTaskData.columnId, overIndex)
    }
  }

  const handleAddColumn = () => {
    if (newColumnName.trim()) {
      addColumn(newColumnName.trim())
      setNewColumnName("")
      setIsAddColumnOpen(false)
    }
  }

  const handleGoBack = () => {
    // Clear current board selection
    selectBoard("")
    window.location.reload()
  }

  if (!currentBoard || !boardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Yukleniyor...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between px-2 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" onClick={handleGoBack}>
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="p-1 sm:p-1.5 bg-primary/10 rounded-lg hidden sm:block">
                <LayoutGrid className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div>
                <h1 className="font-semibold text-foreground text-sm sm:text-base truncate max-w-[120px] sm:max-w-none">{currentBoard.name}</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">{user?.name}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Dialog open={isAddColumnOpen} onOpenChange={setIsAddColumnOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 text-xs sm:text-sm">
                  <Plus className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Sütun Ekle</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Yeni Sütun Ekle</DialogTitle>
                  <DialogDescription>
                    Tahtanıza yeni bir sütun ekleyin
                  </DialogDescription>
                </DialogHeader>
                <Field>
                  <FieldLabel htmlFor="column-name">Sütun Adı</FieldLabel>
                  <Input
                    id="column-name"
                    placeholder="Örn: İnceleme"
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddColumn()}
                  />
                </Field>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddColumnOpen(false)}>
                    İptal
                  </Button>
                  <Button onClick={handleAddColumn} disabled={!newColumnName.trim()}>
                    Ekle
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button variant="ghost" size="sm" className="h-8 text-xs sm:text-sm" onClick={logout}>
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Çıkış</span>
            </Button>
          </div>
        </div>
      </header>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
          <div className="flex gap-3 sm:gap-4 p-3 sm:p-6 min-h-[calc(100vh-65px)] pb-6">
            {boardData.columnOrder.map((columnId, index) => {
              const column = boardData.columns[columnId]
              if (!column) return null
              const tasks = column.taskIds
                .map((taskId) => boardData.tasks[taskId])
                .filter(Boolean)

              return (
                <BoardColumn
                  key={column.id}
                  column={column}
                  tasks={tasks}
                  index={index}
                  onAddTask={addTask}
                  onUpdateTask={updateTask}
                  onDeleteTask={deleteTask}
                  onUpdateColumn={updateColumn}
                  onDeleteColumn={deleteColumn}
                />
              )
            })}

            <div className="w-72 sm:w-80 min-w-[288px] sm:min-w-[320px] shrink-0">
              <Button
                variant="outline"
                className="w-full h-12 border-dashed text-muted-foreground hover:text-foreground"
                onClick={() => setIsAddColumnOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Yeni Sütun
              </Button>
            </div>
          </div>
        </div>

        <DragOverlay>
          {activeTask && (
            <Card className="bg-card border-border shadow-2xl ring-2 ring-primary rotate-3 cursor-grabbing w-72 opacity-95">
              <CardHeader className="p-3 pb-1 flex flex-row items-start gap-2">
                <GripVertical className="h-4 w-4 mt-1 text-muted-foreground" />
                <div className="flex-1">
                  {activeTask.label && TASK_LABELS[activeTask.label] && (
                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full mb-1 ${TASK_LABELS[activeTask.label].bgColor} ${TASK_LABELS[activeTask.label].color}`}>
                      {TASK_LABELS[activeTask.label].name}
                    </span>
                  )}
                  <CardTitle className="text-sm font-medium leading-tight">
                    {activeTask.title}
                  </CardTitle>
                </div>
              </CardHeader>
              {activeTask.description && (
                <CardContent className="p-3 pt-1 pl-9">
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {activeTask.description}
                  </p>
                </CardContent>
              )}
            </Card>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
