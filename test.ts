import { readdirSync, readFileSync } from 'fs'
import { join } from 'path'
import { detectBufferMime, detectFileMime, detectFilenameMime } from './index'

readdirSync('sample').forEach(file => {
  file = join('sample', file)
  let buffer = readFileSync(file)
  detectBufferMime(buffer, (error, mime) => {
    // detectFileMime(file, (error, mime) => {
    if (error || mime?.includes('plain')) {
      console.log({
        file,
        error,
        contentMime: mime,
        guess: mime ? detectFilenameMime(file, mime) : mime,
      })
    }
  })
})
