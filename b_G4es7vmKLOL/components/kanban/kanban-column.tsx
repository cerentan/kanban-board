"use client"

import { useState } from "react"
import { useDroppable } from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { Column, Task } from "@/lib/kanban-types"
import { TaskCard } from "./task-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, X } from "lucide-react"

interface KanbanColumnProps {
  column: Column
  tasks: Task[]
  onAddTask: (columnId: string, title: string, description: string) => void
  onUpdateTask: (taskId: string, title: string, description: string) => void
  onDeleteTask: (taskId: string) => void
}

export function KanbanColumn({
  column,
  tasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
}: KanbanColumnProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newDescription, setNewDescription] = useState("")

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: "column",
      column,
    },
  })

  const handleAdd = () => {
    if (newTitle.trim()) {
      onAddTask(column.id, newTitle.trim(), newDescription.trim())
      setNewTitle("")
      setNewDescription("")
      setIsAdding(false)
    }
  }

  const handleCancel = () => {
    setNewTitle("")
    setNewDescription("")
    setIsAdding(false)
  }

  const columnColors: Record<string, string> = {
    "column-1": "bg-blue-500",
    "column-2": "bg-amber-500",
    "column-3": "bg-emerald-500",
  }

  return (
    <div className="flex flex-col w-80 min-w-[320px] shrink-0">
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className={`w-3 h-3 rounded-full ${columnColors[column.id] || "bg-primary"}`} />
        <h2 className="font-semibold text-foreground">{column.title}</h2>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 bg-muted/50 rounded-lg p-2 min-h-[200px] transition-colors ${
          isOver ? "bg-muted ring-2 ring-primary ring-dashed" : ""
        }`}
      >
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onUpdate={onUpdateTask}
                onDelete={onDeleteTask}
              />
            ))}
          </div>
        </SortableContext>

        {isAdding ? (
          <div className="mt-2 bg-card rounded-lg p-3 space-y-2 border border-border">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Görev başlığı"
              className="text-sm"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleAdd()
                }
                if (e.key === "Escape") {
                  handleCancel()
                }
              }}
            />
            <Textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Açıklama (opsiyonel)"
              className="text-sm min-h-[60px] resize-none"
            />
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="ghost" onClick={handleCancel}>
                <X className="h-4 w-4" />
              </Button>
              <Button size="sm" onClick={handleAdd}>
                Ekle
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="ghost"
            className="w-full mt-2 text-muted-foreground hover:text-foreground justify-start"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Kart ekle
          </Button>
        )}
      </div>
    </div>
  )
}
