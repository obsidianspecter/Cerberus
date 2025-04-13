"use client"

import { useState, useEffect } from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import MarkdownEditor from "@/components/markdown-editor"
import { Button } from "@/components/ui/button"

export default function Home() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Ensure theme is only accessed client-side
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <main className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-14 items-center px-4 sm:px-6">
          <h1 className="text-xl font-semibold">Cerberus</h1>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>
      <div className="container flex-1 py-4 px-4 sm:px-6">
        <MarkdownEditor />
      </div>
    </main>
  )
}
