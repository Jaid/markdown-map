import type {ResolvedMarkdownMapTree} from '#src/lib/types/MarkdownMapSection.ts'
import type {RenderOptions} from '#src/lib/types/RenderOptions.ts'

import flattenString from 'flatten-string'

export const defaultRenderOptions: Required<RenderOptions> = {
  contentPlacement: 'top',
  omitEmpty: true,
  startDepth: 1,
}

export const resolveRenderOptions = (options: RenderOptions = {}): Required<RenderOptions> => {
  const resolvedOptions = {
    ...defaultRenderOptions,
    ...options,
  }
  if (!Number.isInteger(resolvedOptions.startDepth) || resolvedOptions.startDepth < 1) {
    throw new TypeError('startDepth must be a positive integer.')
  }
  return resolvedOptions
}

export const renderTree = (tree: ResolvedMarkdownMapTree, depth: number, options: Required<RenderOptions>): Array<string> => {
  return Object.entries(tree)
    .filter(([, section]) => !options.omitEmpty || section.content.length > 0 || Object.keys(section.sections).length > 0)
    .toSorted(([, sectionA], [, sectionB]) => sectionB.priority - sectionA.priority)
    .map(([name, section]) => {
      const heading = `${'#'.repeat(depth)} ${name}`
      const childSections = renderTree(section.sections, depth + 1, options)
      if (options.contentPlacement === 'bottom' && Object.keys(section.sections).length) {
        return flattenString.paragraphs(heading, childSections, section.content)
      }
      return flattenString.paragraphs(heading, section.content, childSections)
    })
}

export default (tree: ResolvedMarkdownMapTree, orphanContent: Array<string>, options: RenderOptions = {}) => {
  const resolvedOptions = resolveRenderOptions(options)
  const sections = renderTree(tree, resolvedOptions.startDepth, resolvedOptions)
  if (resolvedOptions.contentPlacement === 'bottom') {
    return flattenString.paragraphs(sections, orphanContent)
  }
  return flattenString.paragraphs(orphanContent, sections)
}
