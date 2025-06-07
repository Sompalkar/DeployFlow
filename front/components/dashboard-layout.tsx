"use client"

import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Rocket, Home, FolderOpen, Settings, User, LogOut, Bell, Search } from "lucide-react"
import Link from "next/link"
import { useRecoilState } from "recoil"
import { authState } from "@/lib/atoms"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [auth, setAuth] = useRecoilState(authState)
  const router = useRouter()

  const handleLogout = () => {
    setAuth({
      isAuthenticated: false,
      user: null,
      token: null,
    })
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Rocket className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  DeployFlow
                </span>
              </Link>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input placeholder="Search projects..." className="pl-10 w-64" />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="w-4 h-4" />
              </Button>
              <div className="flex items-center space-x-2">
                <Avatar className="w-8 h-8">
                  <AvatarFallback>{auth.user?.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{auth.user?.username}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <nav className="p-6 space-y-2">
            <Link href="/dashboard">
              <Button variant="ghost" className="w-full justify-start">
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Link href="/dashboard/projects">
              <Button variant="ghost" className="w-full justify-start">
                <FolderOpen className="w-4 h-4 mr-2" />
                Projects
              </Button>
            </Link>
            <Link href="/dashboard/settings">
              <Button variant="ghost" className="w-full justify-start">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </Link>
            <Link href="/dashboard/profile">
              <Button variant="ghost" className="w-full justify-start">
                <User className="w-4 h-4 mr-2" />
                Profile
              </Button>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
