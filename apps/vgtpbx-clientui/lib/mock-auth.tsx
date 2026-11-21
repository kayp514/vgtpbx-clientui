"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export type UserRole = "admin" | "superuser" | "member"

interface User {
  id: string
  name: string
  email: string
  role: UserRole
  permissions: string[]
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  hasPermission: (permission: string) => boolean
  hasRole: (role: UserRole | UserRole[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock user for demonstration
const MOCK_USER: User = {
  id: "1",
  name: "Admin User",
  email: "admin@vogatpbx.com",
  role: "admin",
  permissions: ["*"],
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // In a real app, this would fetch the user from an API
    const fetchUser = async () => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      setUser(MOCK_USER)
      setIsLoading(false)
    }

    fetchUser()
  }, [])

  const hasPermission = (permission: string) => {
    if (!user) return false
    if (user.role === "admin") return true
    if (user.permissions.includes("*")) return true
    return user.permissions.includes(permission)
  }

  const hasRole = (role: UserRole | UserRole[]) => {
    if (!user) return false
    if (Array.isArray(role)) {
      return role.includes(user.role)
    }
    return user.role === role
  }

  return <AuthContext.Provider value={{ user, isLoading, hasPermission, hasRole }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

