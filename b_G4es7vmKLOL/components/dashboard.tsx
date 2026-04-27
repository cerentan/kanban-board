"use client"

import { useAuth } from "@/contexts/auth-context"
import { useBoard } from "@/contexts/board-context"
import { AuthForm } from "@/components/auth/auth-form"
import { BoardSelector } from "@/components/board/board-selector"
import { BoardView } from "@/components/board/board-view"
import { Spinner } from "@/components/ui/spinner"

export function Dashboard() {
  const { user, isLoading: authLoading } = useAuth()
  const { currentBoard, isLoading: boardLoading } = useBoard()

  if (authLoading || boardLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="h-8 w-8 text-primary" />
          <p className="text-muted-foreground">Yukleniyor...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm />
  }

  if (!currentBoard) {
    return <BoardSelector />
  }

  return <BoardView />
}
