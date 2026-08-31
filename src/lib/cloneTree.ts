import type {MarkdownMapTree, ResolvedMarkdownMapTree} from '#src/lib/types/MarkdownMapSection.ts'

import cloneSection from '#src/lib/cloneSection.ts'
import createTree from '#src/lib/createTree.ts'

const cloneTree = (tree: MarkdownMapTree): ResolvedMarkdownMapTree => {
  const clonedTree = createTree()
  for (const [name, section] of Object.entries(tree)) {
    clonedTree[name] = cloneSection(section)
  }
  return clonedTree
}

export default cloneTree
