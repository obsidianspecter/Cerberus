"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"

interface ThemeContextProps {
  theme: "light" | "dark" | "system"
  setTheme: (theme: "light" | "dark" | "system") => void
}

const ThemeContext = createContext<ThemeContextProps>({
  theme: "system",
  setTheme: () => {},
})

export const ThemeProvider = ({
  children,
  ...props
}: {
  children: React.ReactNode
  attribute: string
  defaultTheme: string
  enableSystem: boolean
  disableTransitionOnChange: boolean
}) => {
  const [theme, setTheme] = useState<ThemeContextProps["theme"]>("system")

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme")
    if (storedTheme) {
      setTheme(storedTheme as ThemeContextProps["theme"])
    } else {
      setTheme("system")
    }
  }, [])

  useEffect(() => {
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      document.documentElement.setAttribute("class", systemTheme)
    } else if (theme === "dark" || theme === "light") {
      document.documentElement.setAttribute("class", theme)
    }
    localStorage.setItem("theme", theme)
  }, [theme])

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
