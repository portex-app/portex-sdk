// check-hidden-chars.js
import fs from 'fs'
import path from 'path'

const TARGET_DIR = path.resolve('packages')

// 零宽字符集合
const ZERO_WIDTH_CHARS = {
	'\u200B': 'ZERO WIDTH SPACE (U+200B)',
	'\u200C': 'ZERO WIDTH NON-JOINER (U+200C)',
	'\u200D': 'ZERO WIDTH JOINER (U+200D)',
	'\uFEFF': 'ZERO WIDTH NO-BREAK SPACE (BOM / U+FEFF)',
}

function scanFile(filePath) {
	const buffer = fs.readFileSync(filePath)

	// 检查 BOM (EF BB BF)
	if (buffer.slice(0, 3).toString('hex') === 'efbbbf') {
		console.log(`❌ [BOM] ${filePath}`)
	}

	const content = buffer.toString('utf8')
	for (const [char, desc] of Object.entries(ZERO_WIDTH_CHARS)) {
		if (content.includes(char)) {
			console.log(`❌ [${desc}] in ${filePath}`)
		}
	}
}

function scanDir(dir) {
	const entries = fs.readdirSync(dir, { withFileTypes: true })
	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name)
		if (entry.isDirectory()) {
			scanDir(fullPath)
		} else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
			scanFile(fullPath)
		}
	}
}

console.log(`🔍 Scanning ${TARGET_DIR} for hidden characters...`)
scanDir(TARGET_DIR)
console.log('✅ Scan complete.')
