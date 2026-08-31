import type {Markdown} from '#src/lib/types/Markdown.ts'
import type {MarkdownMapSection, ResolvedMarkdownMapSection, ResolvedMarkdownMapTree} from '#src/lib/types/MarkdownMapSection.ts'
import type {RenderOptions} from '#src/lib/types/RenderOptions.ts'
import type {RenderSectionOptions} from '#src/lib/types/RenderSectionOptions.ts'
import type {OptionalSection, Section} from '#src/lib/types/Section.ts'
import type {Arrayable} from 'type-fest'

import cloneSection from '#src/lib/cloneSection.ts'
import cloneTree from '#src/lib/cloneTree.ts'
import createSection from '#src/lib/createSection.ts'
import toArray from '#src/lib/toArray.ts'
import parseMarkdown from '#src/parseMarkdown.ts'
import renderMarkdown from '#src/renderMarkdown.ts'
import renderMarkdownSection from '#src/renderSection.ts'

export default class MarkdownMap {
  static render(input: Markdown, options: RenderOptions = {}) {
    return new MarkdownMap(input).render(options)
  }

  readonly #orphanContent: Array<string>
  readonly #tree: ResolvedMarkdownMapTree

  constructor(initial: Markdown = {}) {
    if (typeof initial === 'string') {
      const parsed = parseMarkdown(initial)
      this.#orphanContent = parsed.orphanContent
      this.#tree = parsed.tree
      return
    }
    this.#orphanContent = []
    this.#tree = cloneTree(initial)
  }

  clearSection(section: Section) {
    const target = this.#getSection(section)
    if (target) {
      target.content.length = 0
    }
    return this
  }

  deleteSection(section: Section) {
    const path = this.#normalizePath(section)
    const sectionName = path.pop()!
    let tree = this.#tree
    for (const name of path) {
      const target = Object.hasOwn(tree, name) ? tree[name] : undefined
      if (!target) {
        return this
      }
      tree = target.sections
    }
    delete tree[sectionName]
    return this
  }

  ensureSection(section: Section) {
    this.#ensureSection(section)
    return this
  }

  extendSection(section: OptionalSection, content: Arrayable<string>) {
    if (section === undefined) {
      this.#orphanContent.push(...toArray(content))
      return this
    }
    const target = this.#ensureSection(section)
    target.content.push(...toArray(content))
    return this
  }

  get(section: Section): MarkdownMapSection | undefined {
    const target = this.#getSection(section)
    return target ? cloneSection(target) : undefined
  }

  renameSection(section: Section, newName: string) {
    const path = this.#normalizePath(section)
    const sectionName = path.pop()!
    let tree = this.#tree
    for (const name of path) {
      const target = Object.hasOwn(tree, name) ? tree[name] : undefined
      if (!target) {
        return this
      }
      tree = target.sections
    }
    if (!Object.hasOwn(tree, sectionName) || sectionName === newName) {
      return this
    }
    if (Object.hasOwn(tree, newName)) {
      throw new TypeError(`Section already exists: ${newName}`)
    }
    const entries = Object.entries(tree)
    for (const name of Object.keys(tree)) {
      delete tree[name]
    }
    for (const [name, target] of entries) {
      tree[name === sectionName ? newName : name] = target
    }
    return this
  }

  render(options: RenderOptions = {}) {
    return renderMarkdown(this.#tree, this.#orphanContent, options)
  }

  renderSection(section: Section, options: RenderSectionOptions = {}) {
    const path = this.#normalizePath(section)
    const target = this.#getSection(path)
    if (!target) {
      return ''
    }
    const startDepth = options.startDepth ?? path.length
    return renderMarkdownSection(path.at(-1)!, target, {
      ...options,
      startDepth,
    })
  }

  setSectionPriority(section: Section, priority: number) {
    const target = this.#ensureSection(section)
    target.priority = priority
    return this
  }

  toString() {
    return this.render()
  }

  #ensureSection(section: Section) {
    const path = this.#normalizePath(section)
    let tree = this.#tree
    let target: ResolvedMarkdownMapSection | undefined
    for (const name of path) {
      target = Object.hasOwn(tree, name) ? tree[name] : undefined
      if (!target) {
        target = createSection()
        tree[name] = target
      }
      tree = target.sections
    }
    return target!
  }

  #getSection(section: Section) {
    const path = this.#normalizePath(section)
    let tree = this.#tree
    let target: ResolvedMarkdownMapSection | undefined
    for (const name of path) {
      target = Object.hasOwn(tree, name) ? tree[name] : undefined
      if (!target) {
        return
      }
      tree = target.sections
    }
    return target
  }

  #normalizePath(section: Section) {
    const path = toArray(section)
    if (!path.length) {
      throw new TypeError('Section path must not be empty.')
    }
    return [...path]
  }
}
