import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mdx from '@mdx-js/rollup'

export default defineConfig({
    plugins: [
        mdx(),      // enable .mdx imports
        react()
    ],
    // for GitHub Pages, set base when deploying to a repo subpath:
    // base: '/<your-repo-name>/'
})
