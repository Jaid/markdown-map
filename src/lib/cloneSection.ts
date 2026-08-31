import type {MarkdownMapSection, ResolvedMarkdownMapSection} from '#src/lib/types/MarkdownMapSection.ts'

import createTree from '#src/lib/createTree.ts'

const cloneSection = (section: MarkdownMapSection): ResolvedMarkdownMapSection => {
  const sections = createTree()
  for (const [name, childSection] of Object.entries(section.sections ?? {})) {
    sections[name] = cloneSection(childSection)
  }
  return {
    content: [...section.content ?? []],
    priority: section.priority ?? 0,
    sections,
  }
}

export default cloneSection
