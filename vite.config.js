import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { localContact } from './scripts/local-contact.mjs'

export default defineConfig({
  plugins: [react(), localContact],
  // Pre-render every route to its own folder (/tiling/index.html) so each page is real HTML for Google.
  ssgOptions: { dirStyle: 'nested', formatting: 'minify' },
})
