import { defineConfig } from 'tsdown'

export default defineConfig({
	outputOptions: { name: 'portex' },
	entry: ['./packages/index.ts'],
	outDir: 'dest',
	format: ['esm', 'umd', 'iife'],
	platform: 'browser',
	minify: false, // Whether to minify the output
})
