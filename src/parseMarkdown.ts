import type {ResolvedMarkdownMapSection, ResolvedMarkdownMapTree} from '#src/lib/types/MarkdownMapSection.ts'

import createSection from '#src/lib/createSection.ts'
import createTree from '#src/lib/createTree.ts'
import splitLines from '#src/lib/splitLines.ts'

export type ParsedMarkdown = {
  orphanContent: Array<string>
  tree: ResolvedMarkdownMapTree
}

const getContentPieces = (lines: Array<string>): Array<string> => {
  const pieces: Array<string> = []
  let pieceLines: Array<string> = []
  const flushPiece = () => {
    if (!pieceLines.length) {
      return
    }
    pieces.push(pieceLines.join('\n'))
    pieceLines = []
  }
  for (const line of lines) {
    if (!line.trim()) {
      flushPiece()
      continue
    }
    pieceLines.push(line)
  }
  flushPiece()
  return pieces
}

export default (markdown: string): ParsedMarkdown => {
  const orphanContent: Array<string> = []
  const tree = createTree()
  const stack: Array<ResolvedMarkdownMapSection> = []
  let currentSection: ResolvedMarkdownMapSection | undefined
  let contentLines: Array<string> = []
  let fence: {
    character: string
    length: number
  } | undefined
  const flushContent = () => {
    const content = getContentPieces(contentLines)
    contentLines = []
    if (!content.length) {
      return
    }
    if (!currentSection) {
      orphanContent.push(...content)
      return
    }
    currentSection.content.push(...content)
  }
  for (const line of splitLines(markdown)) {
    const possibleFence = /^ {0,3}(`{3,}|~{3,})/.exec(line)
    if (fence) {
      contentLines.push(line)
      if (possibleFence?.[1]?.[0] === fence.character && possibleFence[1].length >= fence.length && /^ {0,3}(`+|~+)[\t ]*$/.test(line)) {
        fence = undefined
      }
      continue
    }
    if (possibleFence?.[1]) {
      fence = {
        character: possibleFence[1][0],
        length: possibleFence[1].length,
      }
      contentLines.push(line)
      continue
    }
    const heading = /^(#+)[\t ]+(.+?)[\t ]*#*[\t ]*$/.exec(line)
    if (!heading?.[1] || !heading[2] || heading[1].length > 6) {
      contentLines.push(line)
      continue
    }
    flushContent()
    const depth = heading[1].length
    if (depth > stack.length + 1) {
      throw new TypeError(`Heading level ${depth} cannot follow heading level ${stack.length}.`)
    }
    const name = heading[2]
    const parentTree = depth === 1 ? tree : stack[depth - 2].sections
    if (Object.hasOwn(parentTree, name)) {
      throw new TypeError(`Duplicate sibling section: ${name}`)
    }
    currentSection = createSection()
    parentTree[name] = currentSection
    stack.length = depth - 1
    stack.push(currentSection)
  }
  flushContent()
  return {
    orphanContent,
    tree,
  }
}
