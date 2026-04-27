"use client"

import { useState } from "react"
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from "@dnd-kit/core"
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { useKanbanStore } from "@/hooks/use-kanban-store"
import { KanbanColumn } from "./kanban-column"
import { Task } from "@/lib/kanban-types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GripVertical } from "lucide-react"

export function KanbanBoard() {
  const { data, isLoaded, addTask, updateTask, deleteTask, moveTask } = useKanbanStore()
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const task = data.tasks[active.id as string]
    if (task) {
      setActiveTask(task)
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeTask = data.tasks[activeId]
    if (!activeTask) return

    // Check if we're over a column
    const overColumn = data.columns[overId]
    if (overColumn) {
      // Moving to an empty column or end of column
      if (activeTask.columnId !== overId) {
        moveTask(activeId, activeTask.columnId, overId, overColumn.taskIds.length)
      }
      return
    }

    // Check if we're over another task
    const overTask = data.tasks[overId]
    if (overTask && activeTask.columnId !== overTask.columnId) {
      const overColumnData = data.columns[overTask.columnId]
      const overIndex = overColumnData.taskIds.indexOf(overId)
      moveTask(activeId, activeTask.columnId, overTask.columnId, overIndex)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    if (activeId === overId) return

    const activeTask = data.tasks[activeId]
    if (!activeTask) return

    // Handle reordering within same column
    const overTask = data.tasks[overId]
    if (overTask && activeTask.columnId === overTask.columnId) {
      const column = data.columns[activeTask.columnId]
      const overIndex = column.taskIds.indexOf(overId)
      moveTask(activeId, activeTask.columnId, activeTask.columnId, overIndex)
    }
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Yükleniyor...</div>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 p-6 overflow-x-auto min-h-[calc(100vh-120px)]">
        {data.columnOrder.map((columnId) => {
          const column = data.columns[columnId]
          const tasks = column.taskIds.map((taskId) => data.tasks[taskId]).filter(Boolean)

          return (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={tasks}
              onAddTask={addTask}
              onUpdateTask={updateTask}
              onDeleteTask={deleteTask}
            />
          )
        })}
      </div>

      <DragOverlay>
        {activeTask && (
          <Card className="bg-card border-border shadow-lg ring-2 ring-primary rotate-3 cursor-grabbing">
            <CardHeader className="p-3 pb-1 flex flex-row items-start gap-2">
              <GripVertical className="h-4 w-4 mt-1 text-muted-foreground" />
              <CardTitle className="text-sm font-medium flex-1 leading-tight">
                {activeTask.title}
              </CardTitle>
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
  )
}
