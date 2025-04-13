"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import rehypeSanitize from "rehype-sanitize"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { tomorrow, oneLight } from "react-syntax-highlighter/dist/cjs/styles/prism"
import { useTheme } from "@/components/theme-provider"

interface MarkdownPreviewProps {
  markdown: string
}

export default function MarkdownPreview({ markdown }: MarkdownPreviewProps) {
  const { theme } = useTheme()
  const syntaxTheme = theme === "dark" ? tomorrow : oneLight

  return (
    <div className="prose prose-sm md:prose-base lg:prose-lg dark:prose-invert max-w-none markdown-preview">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "")
            return !inline && match ? (
              <SyntaxHighlighter
                style={syntaxTheme}
                language={match[1]}
                PreTag="div"
                {...props}
                customStyle={{
                  margin: "1em 0",
                  borderRadius: "0.375rem",
                }}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            )
          },
          img({ node, ...props }) {
            return <img className="rounded-md" {...props} alt={props.alt || ""} />
          },
          a({ node, ...props }) {
            return <a target="_blank" rel="noopener noreferrer" {...props} />
          },
          table({ node, ...props }) {
            return (
              <div className="overflow-x-auto my-4 border rounded">
                <table className="min-w-full divide-y divide-gray-200" {...props} />
              </div>
            )
          },
          th({ node, ...props }) {
            return <th className="px-4 py-2 bg-gray-100 dark:bg-gray-800" {...props} />
          },
          td({ node, ...props }) {
            return <td className="px-4 py-2 border-t" {...props} />
          },
          // Custom component for task lists
          li({ node, className, ...props }) {
            if (
              props.children &&
              typeof props.children[0] === "object" &&
              props.children[0].props &&
              props.children[0].props.children &&
              Array.isArray(props.children[0].props.children) &&
              props.children[0].props.children[0] === "[" &&
              (props.children[0].props.children[1] === "x" || props.children[0].props.children[1] === " ") &&
              props.children[0].props.children[2] === "]"
            ) {
              const checked = props.children[0].props.children[1] === "x"
              return (
                <li className={`flex items-start ${className || ""}`} {...props}>
                  <input type="checkbox" checked={checked} readOnly className="mt-1 mr-2" />
                  <span>{props.children[0].props.children.slice(3)}</span>
                </li>
              )
            }
            return <li className={className} {...props} />
          },
          blockquote({ node, ...props }) {
            return (
              <blockquote className="pl-4 border-l-4 border-gray-300 dark:border-gray-700 italic my-4" {...props} />
            )
          },
          h1({ node, ...props }) {
            return <h1 className="text-3xl font-bold mt-6 mb-4" {...props} />
          },
          h2({ node, ...props }) {
            return <h2 className="text-2xl font-bold mt-5 mb-3" {...props} />
          },
          h3({ node, ...props }) {
            return <h3 className="text-xl font-bold mt-4 mb-2" {...props} />
          },
          ul({ node, ...props }) {
            return <ul className="list-disc pl-6 my-4" {...props} />
          },
          ol({ node, ...props }) {
            return <ol className="list-decimal pl-6 my-4" {...props} />
          },
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  )
}
