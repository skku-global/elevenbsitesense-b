import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Pre-render every route to its own folder (/tiling/index.html) so each page is real HTML for Google.
  ssgOptions: { dirStyle: 'nested', formatting: 'minify' },
})
