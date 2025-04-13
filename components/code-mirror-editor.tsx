"use client"

import { useEffect, useState } from "react"
import { EditorView, basicSetup } from "codemirror"
import { EditorState } from "@codemirror/state"
import { markdown, markdownLanguage } from "@codemirror/lang-markdown"
import { languages } from "@codemirror/language-data"
import { oneDark } from "@codemirror/theme-one-dark"
import { lineNumbers } from "@codemirror/view"
import { useTheme } from "@/components/theme-provider"

interface CodeMirrorEditorProps {
  value: string
  onChange: (value: string) => void
}

export default function CodeMirrorEditor({ value, onChange }: CodeMirrorEditorProps) {
  const { theme } = useTheme()
  const [element, setElement] = useState<HTMLElement | null>(null)
  const [editor, setEditor] = useState<EditorView | null>(null)

  useEffect(() => {
    if (!element) return

    // Clean up previous editor instance
    if (editor) {
      editor.destroy()
    }

    const extensions = [
      basicSetup,
      lineNumbers(),
      markdown({
        base: markdownLanguage,
        codeLanguages: languages,
        addKeymap: true,
      }),
      EditorView.updateListener.of((update) => {
        if (update.changes) {
          onChange(update.state.doc.toString())
        }
      }),
      EditorView.lineWrapping,
    ]

    // Add dark theme if needed
    if (theme === "dark") {
      extensions.push(oneDark)
    }

    const state = EditorState.create({
      doc: value,
      extensions,
    })

    const view = new EditorView({
      state,
      parent: element,
    })

    setEditor(view)

    return () => {
      view.destroy()
    }
  }, [element, theme])

  // Update editor content when value prop changes (if not from editor itself)
  useEffect(() => {
    if (editor && editor.state.doc.toString() !== value) {
      editor.dispatch({
        changes: { from: 0, to: editor.state.doc.length, insert: value },
      })
    }
  }, [value, editor])

  return <div ref={setElement} className="h-full w-full overflow-auto" />
}
