"use client"

import { useState } from "react"
import { useDroppable } from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { Column, Task, TaskLabel, TASK_LABELS } from "@/lib/auth-types"
import { TaskCard } from "./task-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, X, MoreHorizontal, Pencil, Trash2, Check } from "lucide-react"

interface BoardColumnProps {
  column: Column
  tasks: Task[]
  index: number
  onAddTask: (columnId: string, title: string, description: string, label?: TaskLabel) => void
  onUpdateTask: (taskId: string, title: string, description: string, label?: TaskLabel) => void
  onDeleteTask: (taskId: string) => void
  onUpdateColumn: (columnId: string, title: string) => void
  onDeleteColumn: (columnId: string) => void
}

const columnColors = [
  "bg-blue-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-purple-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-orange-500",
  "bg-teal-500",
]

export function BoardColumn({
  column,
  tasks,
  index,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onUpdateColumn,
  onDeleteColumn,
}: BoardColumnProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [newLabel, setNewLabel] = useState<TaskLabel>(null)
  const [columnTitle, setColumnTitle] = useState(column.title)

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: "column",
      column,
    },
  })

  const handleAdd = () => {
    if (newTitle.trim()) {
      onAddTask(column.id, newTitle.trim(), newDescription.trim(), newLabel)
      setNewTitle("")
      setNewDescription("")
      setNewLabel(null)
      setIsAdding(false)
    }
  }

  const handleCancel = () => {
    setNewTitle("")
    setNewDescription("")
    setNewLabel(null)
    setIsAdding(false)
  }

  const handleSaveColumnTitle = () => {
    if (columnTitle.trim()) {
      onUpdateColumn(column.id, columnTitle.trim())
      setIsEditingTitle(false)
    }
  }

  const handleCancelColumnEdit = () => {
    setColumnTitle(column.title)
    setIsEditingTitle(false)
  }

  return (
    <div className="flex flex-col w-72 sm:w-80 min-w-[288px] sm:min-w-[320px] shrink-0">
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className={`w-3 h-3 rounded-full ${columnColors[index % columnColors.length]}`} />
        {isEditingTitle ? (
          <div className="flex items-center gap-1 flex-1">
            <Input
              value={columnTitle}
              onChange={(e) => setColumnTitle(e.target.value)}
              className="h-7 text-sm font-semibold"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveColumnTitle()
                if (e.key === "Escape") handleCancelColumnEdit()
              }}
            />
            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleSaveColumnTitle}>
              <Check className="h-3 w-3" />
            </Button>
            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleCancelColumnEdit}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <>
            <h2 className="font-semibold text-foreground flex-1">{column.title}</h2>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {tasks.length}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditingTitle(true)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Yeniden Adlandır
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    if (confirm("Bu sütunu ve tum kartlarini silmek istediginizden emin misiniz?")) {
                      onDeleteColumn(column.id)
                    }
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Sütunu Sil
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 bg-muted/50 rounded-lg p-2 min-h-[200px] transition-colors ${isOver ? "bg-muted ring-2 ring-primary ring-dashed" : ""
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
            <Select
              value={newLabel || "none"}
              onValueChange={(value) => setNewLabel(value === "none" ? null : value as TaskLabel)}
            >
              <SelectTrigger className="text-sm h-9">
                <SelectValue placeholder="Etiket sec (opsiyonel)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Etiket yok</SelectItem>
                {Object.entries(TASK_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    <span className={`inline-flex items-center gap-2 ${label.color}`}>
                      <span className={`w-2 h-2 rounded-full ${label.bgColor}`} />
                      {label.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
