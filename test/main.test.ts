import {expect, test} from 'bun:test'

const {default: markdownMap} = await import('#src/main.ts')

test('should run', () => {
  const result = markdownMap()
  expect(result).toBe('markdown-map') // TODO Test actual functionality
})
