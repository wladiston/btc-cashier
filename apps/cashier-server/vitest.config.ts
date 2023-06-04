import tsconfigPaths from 'vite-tsconfig-paths'
import {defineProject} from 'vitest/config'

process.env.LOG_LEVEL = 'error'

export default defineProject({
  plugins: [tsconfigPaths()],
  test: {
    name: 'cashier-server',
    include: ['tests/**/*.test.ts', 'app/**/*.test.ts'],
    exclude: [
      'build/**/*',
      // If you want to test a route, you are probably looking for an integration test.
      'app/routes/**/*.test.ts',
    ],
    setupFiles: ['./tests/setup.unit.ts'],
  },
})
