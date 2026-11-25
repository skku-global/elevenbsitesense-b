import { build } from 'vite-react-ssg/node'

// Read the same vite.config.js without bundling its imports through esbuild.
// The runner loader works when parent-directory access is restricted on Windows.
await build({}, { configLoader: 'runner' })
