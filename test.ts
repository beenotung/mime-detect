import { readdirSync, readFileSync } from 'fs'
import { join } from 'path'
import {
  detectBufferMime,
  detectFileMime,
  detectFilenameMime,
  mimeToExt,
} from './index'
import { ext_to_mime } from './mime.types'

let failed = false

let mimeSamples: Record<
  string,
  [bufferMime: string[] | string, fileMime: string] | string
> = {
  'data.csv': [['text/plain', 'text/csv'], 'text/csv'],
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
  'large.txt': 'text/plain',
  'empty': ['application/octet-stream', 'inode/x-empty'],
}

let extSamples: Record<string, string> = {
  'audio/mp4': 'm4a',
  'audio/mpeg': 'mp3',
  'audio/vnd.wave': 'wav',
  'video/vnd.avi': 'avi',
  'video/quicktime': 'mov',
  'video/x-matroska': 'mkv',
  'video/3gpp': '3gp',
  'video/x-flv': 'flv',
  'video/mp4': 'mp4',
  'text/plain': 'txt',
  'text/csv': 'csv',
  'application/json': 'json',
  'image/bmp': 'bmp',
  'image/gif': 'gif',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/svg': 'svg',
  'text/html': 'html',
  'text/xml': 'xml',
}

async function main() {
  let files = readdirSync('sample')
  async function testMime(file: string) {
    let type = mimeSamples[file] || '?'
    let bufferMimes = [Array.isArray(type) ? type[0] : type].flatMap(s => s)
    let fileMime = Array.isArray(type) ? type[1] : type
    file = join('sample', file)
    let buffer = readFileSync(file)
    let res = await detectBufferMime(buffer)
    if (!bufferMimes.some(mime => res.startsWith(mime))) {
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
    await testMime(file).catch(error =>
      console.error('failed:', { file, error }),
    )
  }
  for (let mime in extSamples) {
    let ext = extSamples[mime]
    let res = mimeToExt(mime)
    if (res !== ext) {
      failed = true
      console.error(`mimeToExt on ${mime} failed: expect ${ext}, got ${res}`)
      continue
    }
    console.log(`passed:`, mime, ext)
  }
  // for (let ext in ext_to_mime) {
  //   let mime = ext_to_mime[ext as 'txt']
  //   let res = mimeToExt(mime)
  //   if (res !== ext) {
  //     failed = true
  //     console.error(`mimeToExt on ${mime} failed: expect ${ext}, got ${res}`)
  //     continue
  //   }
  //   console.log(`passed:`, mime, ext)
  // }
  if (failed) {
    process.exit(1)
  }
}
main()
