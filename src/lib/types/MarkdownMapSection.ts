export type MarkdownMapSection = {
  content?: Array<string>
  priority?: number
  sections?: MarkdownMapTree
}

export type MarkdownMapTree = Record<string, MarkdownMapSection>

export type ResolvedMarkdownMapSection = {
  content: Array<string>
  priority: number
  sections: ResolvedMarkdownMapTree
}

export type ResolvedMarkdownMapTree = Record<string, ResolvedMarkdownMapSection>
