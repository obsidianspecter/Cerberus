"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Save, FileUp, FileIcon as FilePdf } from "lucide-react"
import CodeMirrorEditor from "@/components/code-mirror-editor"
import MarkdownPreview from "@/components/markdown-preview"
import { useToast } from "@/hooks/use-toast"
import { useMobile } from "@/hooks/use-mobile"

const DEFAULT_MARKDOWN = `# Welcome to Cerberus

## Features

- **Live Preview**: See your changes in real-time
- **Syntax Highlighting**: For code blocks
- **Split Pane Layout**: Resize as needed
- **Light/Dark Mode**: Toggle with the button in the header
- **Local Storage**: Your content is saved automatically

## Markdown Examples

### Lists

- Item 1
- Item 2
  - Nested item
  - Another nested item
- Item 3

### Code Blocks

\`\`\`javascript
function hello() {
  console.log("Hello, world!");
}
\`\`\`

### Tables

| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |

### Task Lists

- [x] Completed task
- [ ] Incomplete task

### Blockquotes

> This is a blockquote.
> It can span multiple lines.

### Links and Images

[Visit GitHub](https://github.com)

![Placeholder Image](/placeholder.svg?height=200&width=400)
`

export default function MarkdownEditor() {
  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN)
  const [activeTab, setActiveTab] = useState("split")
  const previewRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const isMobile = useMobile()

  // Load from localStorage on mount
  useEffect(() => {
    const savedMarkdown = localStorage.getItem("cerberus-content")
    if (savedMarkdown) {
      setMarkdown(savedMarkdown)
    }
  }, [])

  // Save to localStorage when markdown changes
  useEffect(() => {
    localStorage.setItem("cerberus-content", markdown)
  }, [markdown])

  const handleSave = () => {
    const blob = new Blob([markdown], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "cerberus-document.md"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Document saved",
      description: "Your markdown file has been downloaded.",
    })
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      if (content) {
        setMarkdown(content)
        toast({
          title: "File loaded",
          description: `${file.name} has been loaded successfully.`,
        })
      }
    }
    reader.readAsText(file)

    // Reset the input value so the same file can be uploaded again
    e.target.value = ""
  }

  // Simple approach: Use browser's print functionality
  const handleExportPdf = () => {
    // Make sure we're in preview mode to have the content fully rendered
    setActiveTab("preview")

    toast({
      title: "Preparing PDF",
      description: "Opening print dialog...",
    })

    // Use setTimeout to ensure the tab change and rendering is complete
    setTimeout(() => {
      if (!previewRef.current) {
        toast({
          title: "Export failed",
          description: "Could not find content to export.",
          variant: "destructive",
        })
        return
      }

      try {
        // Create a new window for printing
        const printWindow = window.open("", "_blank")
        if (!printWindow) {
          toast({
            title: "Export failed",
            description: "Could not open print window. Please check your popup blocker settings.",
            variant: "destructive",
          })
          return
        }

        // Get the content
        const content = previewRef.current.innerHTML

        // Write the content to the new window with proper styling
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Cerberus - Document Export</title>
            <style>
              body {
                font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.5;
                padding: 2rem;
                max-width: 210mm;
                margin: 0 auto;
              }
              
              h1, h2, h3, h4, h5, h6 {
                margin-top: 1.5em;
                margin-bottom: 0.5em;
                font-weight: 600;
              }
              
              h1 { font-size: 2em; }
              h2 { font-size: 1.5em; }
              h3 { font-size: 1.25em; }
              
              p { margin: 1em 0; }
              
              pre {
                background-color: #f5f5f5;
                padding: 1em;
                border-radius: 0.25em;
                overflow-x: auto;
              }
              
              code {
                font-family: monospace;
                background-color: #f5f5f5;
                padding: 0.2em 0.4em;
                border-radius: 0.25em;
              }
              
              blockquote {
                border-left: 4px solid #e5e7eb;
                padding-left: 1em;
                margin: 1em 0;
                font-style: italic;
              }
              
              table {
                border-collapse: collapse;
                width: 100%;
                margin: 1em 0;
              }
              
              th, td {
                border: 1px solid #e5e7eb;
                padding: 0.5em;
                text-align: left;
              }
              
              th {
                background-color: #f3f4f6;
              }
              
              ul, ol {
                margin: 1em 0;
                padding-left: 2em;
              }
              
              img {
                max-width: 100%;
                height: auto;
              }
              
              @media print {
                @page {
                  size: A4;
                  margin: 20mm;
                }
                
                body {
                  padding: 0;
                }
                
                pre, code, blockquote, table, ul, ol {
                  page-break-inside: avoid;
                }
                
                h1, h2, h3, h4, h5, h6 {
                  page-break-after: avoid;
                }
              }
            </style>
          </head>
          <body>
            <div class="markdown-content">
              ${content}
            </div>
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                  window.close();
                }, 250);
              };
            </script>
          </body>
          </html>
        `)

        printWindow.document.close()
      } catch (error) {
        console.error("PDF generation error:", error)
        toast({
          title: "Export failed",
          description: "There was an error generating your PDF. Please try again later.",
          variant: "destructive",
        })
      }
    }, 500)
  }

  // Render action buttons based on screen size
  const renderActionButtons = () => (
    <>
      <Button variant="outline" size={isMobile ? "icon" : "sm"} onClick={handleSave}>
        <Save className={isMobile ? "h-4 w-4" : "mr-2 h-4 w-4"} />
        {!isMobile && "Save"}
      </Button>
      <Button
        variant="outline"
        size={isMobile ? "icon" : "sm"}
        onClick={() => document.getElementById("file-upload")?.click()}
      >
        <FileUp className={isMobile ? "h-4 w-4" : "mr-2 h-4 w-4"} />
        {!isMobile && "Open"}
      </Button>
      <Button variant="outline" size={isMobile ? "icon" : "sm"} onClick={handleExportPdf}>
        <FilePdf className={isMobile ? "h-4 w-4" : "mr-2 h-4 w-4"} />
        {!isMobile && "Export PDF"}
      </Button>
      <input id="file-upload" type="file" accept=".md,.markdown" className="hidden" onChange={handleFileUpload} />
    </>
  )

  return (
    <>
      <div className="flex h-[calc(100vh-8rem)] flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <TabsList className="h-9">
              <TabsTrigger value="split">Split View</TabsTrigger>
              <TabsTrigger value="edit">Edit</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            {/* Desktop action buttons */}
            <div className="hidden sm:flex items-center gap-2">{renderActionButtons()}</div>

            {/* Mobile action buttons */}
            <div className="flex sm:hidden items-center justify-between">
              <div className="flex items-center gap-2">{renderActionButtons()}</div>
            </div>
          </div>

          <div className="flex-1 overflow-hidden rounded-md border">
            <TabsContent value="split" className="h-full data-[state=active]:flex">
              <ResizablePanelGroup direction="horizontal" className="h-full">
                <ResizablePanel defaultSize={50} minSize={30}>
                  <div className="h-full">
                    <CodeMirrorEditor value={markdown} onChange={setMarkdown} />
                  </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={50} minSize={30}>
                  <div className="h-full overflow-auto p-4">
                    <div ref={previewRef}>
                      <MarkdownPreview markdown={markdown} />
                    </div>
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </TabsContent>

            <TabsContent value="edit" className="h-full data-[state=active]:block">
              <CodeMirrorEditor value={markdown} onChange={setMarkdown} />
            </TabsContent>

            <TabsContent value="preview" className="h-full data-[state=active]:block">
              <div className="h-full overflow-auto p-4">
                <div ref={previewRef}>
                  <MarkdownPreview markdown={markdown} />
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </>
  )
}
