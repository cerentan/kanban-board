"use client"

import { AuthProvider } from "@/contexts/auth-context"
import { BoardProvider } from "@/contexts/board-context"
import { Dashboard } from "@/components/dashboard"

export default function Home() {
  return (
    <AuthProvider>
      <BoardProvider>
        <Dashboard />
      </BoardProvider>
    </AuthProvider>
  )
}
