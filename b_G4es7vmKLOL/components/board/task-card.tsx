"use client"

import { useState } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Task, TaskLabel, TASK_LABELS } from "@/lib/auth-types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { GripVertical, Pencil, Trash2, Check, X } from "lucide-react"

interface TaskCardProps {
  task: Task
  onUpdate: (taskId: string, title: string, description: string, label?: TaskLabel) => void
  onDelete: (taskId: string) => void
}

export function TaskCard({ task, onUpdate, onDelete }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description)
  const [label, setLabel] = useState<TaskLabel>(task.label || null)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "task",
      task,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleSave = () => {
    if (title.trim()) {
      onUpdate(task.id, title.trim(), description.trim(), label)
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    setTitle(task.title)
    setDescription(task.description)
    setLabel(task.label || null)
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <Card className="bg-card border-border shadow-sm">
        <CardContent className="p-3 space-y-2">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Görev başlıgı"
            className="text-sm"
            autoFocus
          />
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Açıklama (opsiyonel)"
            className="text-sm min-h-[60px] resize-none"
          />
          <Select
            value={label || "none"}
            onValueChange={(value) => setLabel(value === "none" ? null : value as TaskLabel)}
          >
            <SelectTrigger className="text-sm h-9">
              <SelectValue placeholder="Etiket sec" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Etiket yok</SelectItem>
              {Object.entries(TASK_LABELS).map(([key, labelInfo]) => (
                <SelectItem key={key} value={key}>
                  <span className={`inline-flex items-center gap-2 ${labelInfo.color}`}>
                    <span className={`w-2 h-2 rounded-full ${labelInfo.bgColor}`} />
                    {labelInfo.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2 justify-end">
            <Button size="sm" variant="ghost" onClick={handleCancel}>
              <X className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Check className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-card border-border shadow-sm group cursor-grab active:cursor-grabbing transition-all duration-200 touch-none select-none ${isDragging ? "opacity-60 shadow-2xl ring-2 ring-primary scale-105 rotate-2" : "hover:shadow-md"
        }`}
    >
      <CardHeader className="p-3 pb-1 flex flex-row items-start gap-2">
        <div className="mt-1 text-muted-foreground">
          <GripVertical className="h-4 w-4" />
        </div>
        <div className="flex-1">
          {task.label && TASK_LABELS[task.label] && (
            <span className={`inline-block text-xs px-2 py-0.5 rounded-full mb-1 ${TASK_LABELS[task.label].bgColor} ${TASK_LABELS[task.label].color}`}>
              {TASK_LABELS[task.label].name}
            </span>
          )}
          <CardTitle className="text-sm font-medium leading-tight">
            {task.title}
          </CardTitle>
        </div>
        <div
          className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation()
              setIsEditing(true)
            }}
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(task.id)
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      {task.description && (
        <CardContent className="p-3 pt-1 pl-9">
          <p className="text-xs text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        </CardContent>
      )}
    </Card>
  )
}
