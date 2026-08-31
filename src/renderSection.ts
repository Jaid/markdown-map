import type {ResolvedMarkdownMapSection} from '#src/lib/types/MarkdownMapSection.ts'
import type {RenderSectionOptions} from '#src/lib/types/RenderSectionOptions.ts'

import flattenString from 'flatten-string'

import {renderTree, resolveRenderOptions} from '#src/renderMarkdown.ts'

export default (name: string, section: ResolvedMarkdownMapSection, options: RenderSectionOptions = {}) => {
  const {header = true, ...renderOptions} = options
  const resolvedOptions = resolveRenderOptions(renderOptions)
  const depth = resolvedOptions.startDepth
  const childSections = renderTree(section.sections, depth + 1, resolvedOptions)
  const body = resolvedOptions.contentPlacement === 'bottom' && Object.keys(section.sections).length ? flattenString.paragraphs(childSections, section.content) : flattenString.paragraphs(section.content, childSections)
  if (!header) {
    return body
  }
  if (resolvedOptions.omitEmpty && !section.content.length && !Object.keys(section.sections).length) {
    return ''
  }
  return flattenString.paragraphs(`${'#'.repeat(depth)} ${name}`, body)
}
