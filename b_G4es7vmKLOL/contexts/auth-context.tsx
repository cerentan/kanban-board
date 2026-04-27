"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import {
  User,
  StoredUser,
  AUTH_STORAGE_KEY,
  CURRENT_USER_KEY,
} from "@/lib/auth-types"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => { success: boolean; error?: string }
  register: (email: string, password: string, name: string) => { success: boolean; error?: string }
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem(CURRENT_USER_KEY)
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        localStorage.removeItem(CURRENT_USER_KEY)
      }
    }
    setIsLoading(false)
  }, [])

  const getUsers = useCallback((): StoredUser[] => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY)
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        return []
      }
    }
    return []
  }, [])

  const saveUsers = useCallback((users: StoredUser[]) => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(users))
  }, [])

  const register = useCallback(
    (email: string, password: string, name: string): { success: boolean; error?: string } => {
      const users = getUsers()
      
      if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
        return { success: false, error: "Bu e-posta adresi zaten kullanılıyor" }
      }

      if (password.length < 6) {
        return { success: false, error: "Şifre en az 6 karakter olmalıdır" }
      }

      const newUser: StoredUser = {
        id: `user-${Date.now()}`,
        email: email.toLowerCase(),
        name,
        password,
        createdAt: new Date().toISOString(),
      }

      saveUsers([...users, newUser])

      const { password: _, ...userWithoutPassword } = newUser
      setUser(userWithoutPassword)
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword))

      return { success: true }
    },
    [getUsers, saveUsers]
  )

  const login = useCallback(
    (email: string, password: string): { success: boolean; error?: string } => {
      const users = getUsers()
      const foundUser = users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      )

      if (!foundUser) {
        return { success: false, error: "E-posta veya şifre hatalı" }
      }

      const { password: _, ...userWithoutPassword } = foundUser
      setUser(userWithoutPassword)
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword))

      return { success: true }
    },
    [getUsers]
  )

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem(CURRENT_USER_KEY)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
