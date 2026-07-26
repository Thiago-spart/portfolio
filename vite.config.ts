import { defineConfig } from 'vite'
import { configDefaults } from 'vitest/config'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [tailwindcss(), tanstackStart(), viteReact()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    passWithNoTests: true,
    // Git worktrees can live under .claude/worktrees/** inside this checkout;
    // each has its own node_modules/React copy, so picking up their test
    // files here causes cross-contamination ("Invalid hook call").
    exclude: [...configDefaults.exclude, '.claude/**'],
  },
})

export default config
