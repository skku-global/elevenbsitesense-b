import { realpathSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { build } from 'vite-react-ssg/node'

// Read the same vite.config.js without bundling its imports through esbuild.
// Use the same resolved project root for HTML input and Vite's output paths.
const root = realpathSync(fileURLToPath(new URL('../', import.meta.url)))
await build({}, { configLoader: 'runner', root })
