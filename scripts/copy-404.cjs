const fs = require('node:fs')
const path = require('node:path')

const distDir = path.resolve(__dirname, '..', 'dist')
const indexFile = path.join(distDir, 'index.html')
const notFoundFile = path.join(distDir, '404.html')

if (fs.existsSync(indexFile)) {
    fs.copyFileSync(indexFile, notFoundFile)
} else {
    console.error('Missing dist/index.html; run the Vite build first.')
    process.exitCode = 1
}
