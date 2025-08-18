import { defineConfig } from 'tsdown'

export default defineConfig({
	outputOptions: { name: 'portex' },
	entry: ['./packages/index.ts'],
	outDir: 'dest',
	format: ['esm', 'umd', 'iife'],
	platform: 'browser',
	fixedExtension: true,
	minify: true, // Whether to minify the output
})
