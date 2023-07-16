import {defineConfig} from 'tsup'

export default defineConfig({
  entryPoints: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  minify: true,
  clean: true,
  legacyOutput: true,
  env:
    process.env.PUBLISHING === 'true'
      ? {
          PUBLISHING: 'true',
        }
      : undefined,
})