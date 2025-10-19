import { Plugin } from 'vite'
import { readFileSync } from 'fs'

export function glsl(): Plugin {
  return {
    name: 'vite-plugin-glsl',
    load(id) {
      if (id.endsWith('.glsl') || id.endsWith('.vert') || id.endsWith('.frag')) {
        const code = readFileSync(id, 'utf-8')
        return `export default ${JSON.stringify(code)};`
      }
    }
  }
}