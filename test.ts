import { readdirSync, readFileSync } from 'fs'
import { join } from 'path'
import { detectBufferMime, detectFileMime, detectFilenameMime } from './index'

let failed = false

let samples: Record<string, [bufferMime: string, fileMime: string] | string> = {
  'data.csv': ['text/plain', 'text/csv'],
  'data.json': 'application/json',
  'image.bmp': 'image/bmp',
  'image.gif': 'image/gif',
  'image.jpg': 'image/jpeg',
  'image.png': 'image/png',
  'image.svg': 'image/svg',
  'image.xhtml': 'text/xml',
  'image.html': 'text/html',
  'web-doc.html': 'text/html',
  'web-html.html': 'text/html',
  'web-map.html': ['text/plain', 'text/html'],
  '$HOME.txt': 'text/plain',
  empty: ['application/octet-stream', 'inode/x-empty'],
}

async function main() {
  let files = readdirSync('sample')
  async function test(file: string) {
    let type = samples[file] || '?'
    let bufferMime = Array.isArray(type) ? type[0] : type
    let fileMime = Array.isArray(type) ? type[1] : type
    file = join('sample', file)
    let buffer = readFileSync(file)
    let res = await detectBufferMime(buffer)
    if (!res.startsWith(bufferMime)) {
      failed = true
      console.error(
        `detectBufferMime on ${file} failed: expect ${type}, got ${res}`,
      )
      return
    }
    res = await detectFileMime(file)
    if (!res.startsWith(fileMime)) {
      failed = true
      console.error(
        `detectFileMime on ${file} failed: expect ${type}, got ${res}`,
      )
      return
    }
    console.log(`passed:`, file, type)
  }
  for (let file of files) {
    await test(file).catch(error => console.error('failed:', { file, error }))
  }
  if (failed) {
    process.exit(1)
  }
}
main()
