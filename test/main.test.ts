import {expect, test} from 'bun:test'

const {default: MarkdownMap} = await import('#src/main.ts')
test('renders nested sections and content', () => {
  const markdown = (new MarkdownMap)
    .extendSection('My Repo', ['Introduction', 'More details'])
    .extendSection(['My Repo', 'Development', 'Testing'], ['Run Bun tests.', 'Run ESLint.'])
  expect(markdown.toString()).toBe('# My Repo\n\nIntroduction\n\nMore details\n\n## Development\n\n### Testing\n\nRun Bun tests.\n\nRun ESLint.')
})
test('ensureSection creates otherwise empty sections', () => {
  const markdown = (new MarkdownMap).ensureSection(['Project', 'Development'])
  expect(markdown.render({omitEmpty: false})).toBe('# Project\n\n## Development')
})
test('clearSection removes content while preserving children', () => {
  const markdown = (new MarkdownMap)
    .extendSection('Project', 'Overview')
    .extendSection(['Project', 'Development'], 'Development notes')
    .clearSection('Project')
  expect(markdown.toString()).toBe('# Project\n\n## Development\n\nDevelopment notes')
})
test('deleteSection removes the selected subtree', () => {
  const markdown = (new MarkdownMap)
    .extendSection(['Project', 'Development'], 'Development notes')
    .extendSection(['Project', 'Usage'], 'Usage notes')
    .deleteSection(['Project', 'Development'])
  expect(markdown.toString()).toBe('# Project\n\n## Usage\n\nUsage notes')
})
test('priority changes render order without changing insertion order', () => {
  const markdown = (new MarkdownMap)
    .extendSection('First', 'First content')
    .extendSection('Second', 'Second content')
    .setSectionPriority('Second', 10)
  expect(markdown.toString()).toBe('# Second\n\nSecond content\n\n# First\n\nFirst content')
  markdown.setSectionPriority('Second', 0)
  expect(markdown.toString()).toBe('# First\n\nFirst content\n\n# Second\n\nSecond content')
})
test('priority applies among sibling sections', () => {
  const markdown = (new MarkdownMap)
    .ensureSection('Project')
    .extendSection(['Project', 'First'], 'First content')
    .extendSection(['Project', 'Second'], 'Second content')
    .setSectionPriority(['Project', 'Second'], 1)
  expect(markdown.toString()).toBe('# Project\n\n## Second\n\nSecond content\n\n## First\n\nFirst content')
})
test('constructor accepts initial tree state', () => {
  const markdown = new MarkdownMap({
    Project: {
      content: ['Overview'],
      priority: 0,
      sections: {
        Development: {
          content: ['Development notes'],
          priority: 0,
          sections: {},
        },
      },
    },
  })
  expect(markdown.toString()).toBe('# Project\n\nOverview\n\n## Development\n\nDevelopment notes')
})
test('constructor accepts Markdown text', () => {
  const input = '# Project\n\nOverview\n\n## Development\n\nDevelopment notes\n\n```md\n# Not a section\n```\n\n## Usage\n\nUsage notes'
  const markdown = new MarkdownMap(input)
  expect(markdown.toString()).toBe(input)
})
test('constructor clones initial tree state', () => {
  const state = {
    Project: {
      content: ['Overview'],
      priority: 0,
      sections: {},
    },
  }
  const markdown = new MarkdownMap(state)
  state.Project.content.push('External mutation')
  expect(markdown.toString()).toBe('# Project\n\nOverview')
})
test('Markdown constructor normalizes CRLF and preserves tilde fences', () => {
  const input = '# Project\r\n\r\n~~~md\r\n# Not a section\r\n~~~\r\n\r\n## Usage\r\n\r\nUsage notes'
  const markdown = new MarkdownMap(input)
  expect(markdown.toString()).toBe('# Project\n\n~~~md\n# Not a section\n~~~\n\n## Usage\n\nUsage notes')
})
test('toString uses default render options', () => {
  const markdown = (new MarkdownMap)
    .extendSection('Project', 'Overview')
    .ensureSection('Empty')
  expect(markdown.toString()).toBe(markdown.render())
  expect(markdown.toString()).toBe('# Project\n\nOverview')
})
test('render supports a custom start depth', () => {
  const markdown = (new MarkdownMap).extendSection(['Project', 'Usage'], 'Usage notes')
  expect(markdown.render({startDepth: 2})).toBe('## Project\n\n### Usage\n\nUsage notes')
})
test('render can place non-leaf content at the bottom', () => {
  const markdown = (new MarkdownMap)
    .extendSection('Project', 'Overview')
    .extendSection(['Project', 'Usage'], 'Usage notes')
  expect(markdown.render({contentPlacement: 'bottom'})).toBe('# Project\n\n## Usage\n\nUsage notes\n\nOverview')
})
test('render omits empty leaf sections by default', () => {
  const markdown = (new MarkdownMap)
    .extendSection('Project', 'Overview')
    .ensureSection('Empty')
  expect(markdown.render()).toBe('# Project\n\nOverview')
  expect(markdown.render({omitEmpty: false})).toBe('# Project\n\nOverview\n\n# Empty')
})
test('render validates startDepth', () => {
  const markdown = new MarkdownMap
  expect(() => markdown.render({startDepth: 0})).toThrow('startDepth must be a positive integer.')
  expect(() => markdown.render({startDepth: 1.5})).toThrow('startDepth must be a positive integer.')
})
test('extendSection supports orphan content', () => {
  const markdown = (new MarkdownMap)
    .extendSection(undefined, ['Introduction', 'More details'])
    .extendSection('Project', 'Overview')
  expect(markdown.toString()).toBe('Introduction\n\nMore details\n\n# Project\n\nOverview')
  expect(markdown.render({contentPlacement: 'bottom'})).toBe('# Project\n\nOverview\n\nIntroduction\n\nMore details')
})
test('Markdown constructor tracks orphan content', () => {
  const input = 'Introduction\n\nMore details\n\n# Project\n\nOverview'
  const markdown = new MarkdownMap(input)
  expect(markdown.toString()).toBe(input)
})
test('renderSection renders at the natural section depth', () => {
  const markdown = (new MarkdownMap)
    .extendSection(['Project', 'Development'], 'Development notes')
    .extendSection(['Project', 'Development', 'Testing'], 'Testing notes')
  expect(markdown.renderSection(['Project', 'Development'])).toBe('## Development\n\nDevelopment notes\n\n### Testing\n\nTesting notes')
})
test('renderSection can render an isolated Markdown document', () => {
  const markdown = (new MarkdownMap)
    .extendSection(['Project', 'Development'], 'Development notes')
    .extendSection(['Project', 'Development', 'Testing'], 'Testing notes')
  expect(markdown.renderSection(['Project', 'Development'], {startDepth: 1})).toBe('# Development\n\nDevelopment notes\n\n## Testing\n\nTesting notes')
})
test('renderSection can omit the selected section header', () => {
  const markdown = (new MarkdownMap)
    .extendSection(['Project', 'Development'], 'Development notes')
    .extendSection(['Project', 'Development', 'Testing'], 'Testing notes')
  expect(markdown.renderSection(['Project', 'Development'], {header: false})).toBe('Development notes\n\n### Testing\n\nTesting notes')
})
