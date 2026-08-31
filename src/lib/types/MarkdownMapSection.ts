export type MarkdownMapSection = {
  content: Array<string>
  priority: number
  sections: MarkdownMapTree
}

export type MarkdownMapTree = Record<string, MarkdownMapSection>
