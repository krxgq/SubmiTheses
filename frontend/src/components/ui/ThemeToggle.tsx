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
          className="p-2 rounded-lg transition-colors hover:bg-muted text-foreground-muted"
          disabled
        >
          <Sun className="w-4 h-4" />
        </button>
        <button
          className="p-2 rounded-lg transition-colors hover:bg-muted text-foreground-muted"
          disabled
        >
          <Moon className="w-4 h-4" />
        </button>
        <button
          className="p-2 rounded-lg transition-colors hover:bg-muted text-foreground-muted"
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
            ? "bg-muted text-primary"
            : "hover:bg-muted text-foreground-muted hover:text-foreground"
          }`}
        title="Light mode"
      >
        <Sun className="w-4 h-4" />
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={`p-2 rounded-lg transition-colors ${theme === "dark"
            ? "bg-muted dark:bg-muted-dark text-primary"
            : "hover:bg-muted dark:hover:bg-muted-dark text-foreground-muted hover:text-foreground"
          }`}
        title="Dark mode"
      >
        <Moon className="w-4 h-4" />
      </button>
      <button
        onClick={() => setTheme("system")}
        className={`p-2 rounded-lg transition-colors ${theme === "system"
            ? "bg-muted dark:bg-muted-dark text-primary"
            : "hover:bg-muted dark:hover:bg-muted-dark text-foreground-muted hover:text-foreground"
          }`}
        title="System preference"
      >
        <Monitor className="w-4 h-4" />
      </button>
    </div>
  )
}