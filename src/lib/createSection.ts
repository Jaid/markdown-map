import type {ResolvedMarkdownMapSection} from '#src/lib/types/MarkdownMapSection.ts'

import createTree from '#src/lib/createTree.ts'

export default (): ResolvedMarkdownMapSection => {
  return {
    content: [],
    priority: 0,
    sections: createTree(),
  }
}
