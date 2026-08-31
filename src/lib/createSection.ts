import type {MarkdownMapSection} from '#src/lib/types/MarkdownMapSection.ts'

import createTree from '#src/lib/createTree.ts'

export default (): MarkdownMapSection => {
  return {
    content: [],
    priority: 0,
    sections: createTree(),
  }
}
