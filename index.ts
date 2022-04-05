import { exec } from 'child_process'
import { default as mimeType } from 'mime-type/with-db'

mimeType.types['ts'] = 'text/typescript'

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
  exec(`file -bE --mime ${JSON.stringify(file)}`, (error, stdout, stderr) => {
    if (error) {
      if (stdout.includes('No such file or directory')) {
        cb(new Error('No such file or directory'))
        return
      }
      let message = (stdout + ' ' + stderr).trim()
      cb(message ? new Error(message) : error)
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
  mime: string = 'application/octet-stream',
): string {
  let prefix = mime.startsWith(plainTextPrefix)
    ? plainTextPrefix
    : mime.startsWith(binaryPrefix)
    ? binaryPrefix
    : undefined

  if (prefix) {
    let result = mimeType.lookup(file)
    if (typeof result === 'string') {
      mime = result + mime.slice(prefix.length)
    } else if (Array.isArray(result) && result[0]) {
      mime = result[0] + mime.slice(prefix.length)
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
  let child = exec(`file -bE --mime -`, (error, stdout, stderr) => {
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
  }
}
