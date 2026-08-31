import type {MarkdownMapTree, ResolvedMarkdownMapTree} from '#src/lib/types/MarkdownMapSection.ts'

import createTree from '#src/lib/createTree.ts'

const cloneTree = (tree: MarkdownMapTree): ResolvedMarkdownMapTree => {
  const clonedTree = createTree()
  for (const [name, section] of Object.entries(tree)) {
    clonedTree[name] = {
      content: [...section.content ?? []],
      priority: section.priority ?? 0,
      sections: cloneTree(section.sections ?? {}),
    }
  }
  return clonedTree
}

export default cloneTree
