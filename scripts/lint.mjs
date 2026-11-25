import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import parser from '@babel/parser'
import traverseModule from '@babel/traverse'

// Babel is already supplied by @vitejs/plugin-react. No lint dependency added.
const traverse = traverseModule.default || traverseModule
const globals = new Set([...Object.getOwnPropertyNames(globalThis), 'window', 'document', 'navigator', 'localStorage', 'IntersectionObserver', 'requestAnimationFrame', 'cancelAnimationFrame', 'Image'])
const files = ['src', 'scripts'].flatMap((directory) => readdirSync(directory, { recursive: true })
  .filter((file) => /\.(?:js|jsx|mjs)$/.test(file)).map((file) => join(directory, file)))
const errors = []

for (const file of files) {
  try {
    const ast = parser.parse(readFileSync(file, 'utf8'), { sourceType: 'module', plugins: ['jsx'] })
    const jsxReferences = new Set()
    const report = (path, message) => errors.push(`${file}:${path.node.loc?.start.line || 1}: ${message}`)
    traverse(ast, {
      ReferencedIdentifier(path) {
        const name = path.node.name
        if (!globals.has(name) && !path.scope.hasBinding(name)) report(path, `Undefined identifier ${name}`)
      },
      JSXOpeningElement(path) {
        let name = path.node.name
        while (name.type === 'JSXMemberExpression') name = name.object
        if (name.type === 'JSXIdentifier' && /^[A-Z]/.test(name.name)) {
          jsxReferences.add(name.name)
          if (!path.scope.hasBinding(name.name) && !globals.has(name.name)) report(path, `Undefined component ${name.name}`)
        }
      },
      DebuggerStatement(path) { report(path, 'Debugger statement in source') },
      Program: {
        exit(path) {
          for (const [name, binding] of Object.entries(path.scope.bindings)) {
            if (binding.kind === 'module' && !binding.referenced && !jsxReferences.has(name)) report(binding.path, `Unused import ${name}`)
          }
        },
      },
    })
  } catch (error) {
    errors.push(`${file}: ${error.message}`)
  }
}

if (errors.length) {
  console.error(errors.join('\n'))
  process.exitCode = 1
} else {
  console.log(`Source lint passed for ${files.length} files: syntax, undefined references/components, unused imports and debugger statements.`)
}
