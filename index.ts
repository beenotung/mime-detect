import type { exec, spawn } from 'child_process'
import { ext_to_mime } from './mime.types'
import { mime_to_ext } from './mime.ext'

export function enableTypescriptMime(mime = 'text/typescript') {
  ext_to_mime.ts = mime
}

export interface DetectMimeCallback {
  (error: Error, mime?: string): void
  (error: null, mime: string): void
}

let binarySuffix = '; charset=binary'
let plainTextPrefix = 'text/plain'
let binaryPrefix = 'application/octet-stream'

export function detectFileMime(file: string, cb: DetectMimeCallback): void
export function detectFileMime(file: string): Promise<string>
export function detectFileMime(
  file: string,
  cb?: DetectMimeCallback,
): undefined | Promise<string> {
  if (!cb) {
    return new Promise<string>((resolve, reject) =>
      detectFileMime(file, (error, mime) =>
        error ? reject(error) : resolve(mime!),
      ),
    )
  }
  let { spawn } = child_process()
  let child = spawn('file', ['-bE', '--mime', file])
  let stdout = ''
  let stderr = ''
  child.stdout.on('data', chunk => (stdout += chunk))
  child.stderr.on('data', chunk => (stderr += chunk))
  child.on('close', code => {
    if (code !== 0) {
      let message = (stdout + ' ' + stderr).trim()
      if (message.includes('No such file or directory')) {
        cb(new Error('No such file or directory'))
        return
      }
      cb(new Error(message))
      return
    }
    let mime = stdout.trim()
    if (mime.endsWith(binarySuffix)) {
      mime = mime.slice(0, mime.length - binarySuffix.length)
    }
    mime = detectFilenameMime(file, mime)
    cb(null, mime)
  })
}

export function detectFilenameMime(
  file: string,
  mime: string = binaryPrefix,
): string {
  let prefix = mime.startsWith(plainTextPrefix)
    ? plainTextPrefix
    : mime.startsWith(binaryPrefix)
    ? binaryPrefix
    : undefined

  if (prefix) {
    let ext = file.split('.').pop()!
    let result = ext_to_mime[ext as 'txt']
    if (result) {
      mime = result + mime.slice(prefix.length)
    }
  }
  return mime
}

export function detectBufferMime(buffer: Buffer, cb: DetectMimeCallback): void
export function detectBufferMime(buffer: Buffer): Promise<string>
export function detectBufferMime(
  buffer: Buffer,
  cb?: DetectMimeCallback,
): undefined | Promise<string> {
  if (!cb) {
    return new Promise<string>((resolve, reject) =>
      detectBufferMime(buffer, (error, mime) =>
        error ? reject(error) : resolve(mime!),
      ),
    )
  }
  if (buffer.length === 0) {
    cb(null, binaryPrefix)
    return
  }
  let { exec } = child_process()
  let childError: any
  let child = exec(`file -bE --mime -`, {}, (error, stdout, stderr) => {
    if (childError) return
    if (error) {
      let message = (stdout + ' ' + stderr).trim()
      cb(message ? new Error(message) : error)
      return
    }
    let mime = stdout.trim()
    if (mime.endsWith(binarySuffix)) {
      mime = mime.slice(0, mime.length - binarySuffix.length)
    }
    cb(null, mime)
  })
  if (child.stdin) {
    child.stdin.write(buffer)
    child.stdin.on('error', (error: any) => {
      if (error.code === 'EPIPE') {
        // early terminate before the mime is already detected
        return
      }
      childError = error
      cb(error)
    })
  }
}

/**
 * @description return file extension name without dot
 * e.g. "audio/mp4" -> "m4a"
 * e.g. "video/x-matroska" -> "mkv"
 * e.g. "image/jpeg" -> "jpg"
 * e.g. "application/octet-stream" -> "bin"
 */
export function mimeToExt(mime: string): string {
  mime = mime.split(';')[0]
  let ext = mime_to_ext[mime as 'audio/mp4']
  if (ext) return ext
  let exts = Object.entries(ext_to_mime)
    .filter(([key, value]) => value == mime)
    .map(([key]) => key)
  if (exts.length > 1) {
    console.warn(`multiple extensions matched:`, { mime, exts })
  }
  if (exts.length == 1) {
    return exts[0]
  }
  return mime.split('/').pop()!
}

// using eval to avoid error when bundling with esbuild
// at least detectFilenameMime() is usable in browser
function child_process(): { exec: typeof exec; spawn: typeof spawn } {
  return eval('require("child_process")')
}
