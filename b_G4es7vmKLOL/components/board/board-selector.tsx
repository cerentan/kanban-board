"use client"

import { useState } from "react"
import { useBoard } from "@/contexts/board-context"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Field, FieldLabel } from "@/components/ui/field"
import { Plus, LayoutGrid, MoreVertical, Pencil, Trash2, LogOut } from "lucide-react"

export function BoardSelector() {
  const { user, logout } = useAuth()
  const { boards, createBoard, deleteBoard, selectBoard, updateBoardName } = useBoard()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [newBoardName, setNewBoardName] = useState("")
  const [editingBoard, setEditingBoard] = useState<{ id: string; name: string } | null>(null)

  const handleCreate = () => {
    if (newBoardName.trim()) {
      const board = createBoard(newBoardName.trim())
      selectBoard(board.id)
      setNewBoardName("")
      setIsCreateOpen(false)
    }
  }

  const handleEdit = () => {
    if (editingBoard && editingBoard.name.trim()) {
      updateBoardName(editingBoard.id, editingBoard.name.trim())
      setEditingBoard(null)
      setIsEditOpen(false)
    }
  }

  const handleDelete = (boardId: string) => {
    if (confirm("Bu tahtayı silmek istediğinizden emin misiniz?")) {
      deleteBoard(boardId)
    }
  }

  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <LayoutGrid className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">TaskFlow</h1>
              <p className="text-sm text-muted-foreground">
                Hoş geldiniz, {user?.name}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={logout}>
            <LogOut className="h-4 w-4 mr-2" />
            Çıkış Yap
          </Button>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Tahtalarınız</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Card className="border-dashed border-2 hover:border-primary/50 hover:bg-muted/50 transition-colors cursor-pointer">
                  <CardContent className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                    <Plus className="h-8 w-8 mb-2" />
                    <span className="font-medium">Yeni Tahta Oluştur</span>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Yeni Tahta Oluştur</DialogTitle>
                  <DialogDescription>
                    Yeni bir Kanban tahtası oluşturun
                  </DialogDescription>
                </DialogHeader>
                <Field>
                  <FieldLabel htmlFor="board-name">Tahta Adı</FieldLabel>
                  <Input
                    id="board-name"
                    placeholder="Örn: Proje Yönetimi"
                    value={newBoardName}
                    onChange={(e) => setNewBoardName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  />
                </Field>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    İptal
                  </Button>
                  <Button onClick={handleCreate} disabled={!newBoardName.trim()}>
                    Oluştur
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {boards.map((board) => (
              <Card
                key={board.id}
                className="hover:shadow-md transition-shadow cursor-pointer group"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle
                      className="text-base font-semibold cursor-pointer hover:text-primary transition-colors"
                      onClick={() => selectBoard(board.id)}
                    >
                      {board.name}
                    </CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingBoard({ id: board.id, name: board.name })
                            setIsEditOpen(true)
                          }}
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Düzenle
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(board.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Sil
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardDescription className="text-xs">
                    {new Date(board.createdAt).toLocaleDateString("tr-TR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={() => selectBoard(board.id)}
                  >
                    Tahtayı Aç
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {boards.length === 0 && (
            <p className="text-center text-muted-foreground mt-8">
              Henüz bir tahtanız yok. Yeni bir tahta oluşturarak başlayın.
            </p>
          )}
        </div>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tahtayı Düzenle</DialogTitle>
            <DialogDescription>
              Tahta adını değiştirin
            </DialogDescription>
          </DialogHeader>
          <Field>
            <FieldLabel htmlFor="edit-board-name">Tahta Adı</FieldLabel>
            <Input
              id="edit-board-name"
              value={editingBoard?.name || ""}
              onChange={(e) =>
                setEditingBoard((prev) =>
                  prev ? { ...prev, name: e.target.value } : null
                )
              }
              onKeyDown={(e) => e.key === "Enter" && handleEdit()}
            />
          </Field>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleEdit} disabled={!editingBoard?.name.trim()}>
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
