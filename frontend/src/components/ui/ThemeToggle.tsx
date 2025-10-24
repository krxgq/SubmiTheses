"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Prevent hydration mismatch by only rendering theme-dependent content after mounting
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Return a placeholder with consistent styling during SSR
    return (
      <div className="flex items-center space-x-2">
        <button
          className="p-2 rounded-lg transition-colors hover:bg-background-hover text-secondary"
          disabled
        >
          <Sun className="w-4 h-4" />
        </button>
        <button
          className="p-2 rounded-lg transition-colors hover:bg-background-hover text-secondary"
          disabled
        >
          <Moon className="w-4 h-4" />
        </button>
        <button
          className="p-2 rounded-lg transition-colors hover:bg-background-hover text-secondary"
          disabled
        >
          <Monitor className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => setTheme("light")}
        className={`p-2 rounded-lg transition-colors ${theme === "light"
            ? "bg-background-secondary text-primary"
            : "hover:bg-background-hover text-secondary hover:text-primary"
          }`}
        title="Light mode"
      >
        <Sun className="w-4 h-4" />
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={`p-2 rounded-lg transition-colors ${theme === "dark"
            ? "bg-background-secondary text-primary"
            : "hover:bg-background-hover text-secondary hover:text-primary"
          }`}
        title="Dark mode"
      >
        <Moon className="w-4 h-4" />
      </button>
      <button
        onClick={() => setTheme("system")}
        className={`p-2 rounded-lg transition-colors ${theme === "system"
            ? "bg-background-secondary text-primary"
            : "hover:bg-background-hover text-secondary hover:text-primary"
          }`}
        title="System preference"
      >
        <Monitor className="w-4 h-4" />
      </button>
    </div>
  )
}