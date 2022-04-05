# mime-detect

Detect mime type and encoding (aka Content-Type) from buffer, file content and filename.

[![npm Package Version](https://img.shields.io/npm/v/mime-detect.svg?maxAge=2592000)](https://www.npmjs.com/package/mime-detect)

Powered by:

- [file](https://man7.org/linux/man-pages/man1/file.1.html) (Inspired by [mimetype-magic](https://www.npmjs.com/package/mimetype-magic))
- [mime-type](https://www.npmjs.com/package/mime-type) and [mime-db](https://www.npmjs.com/package/mime-db)

## Installation

```bash
npm i mime-detect
```

Alternatively, you can also install it [pnpm](https://www.npmjs.com/package/pnpm) or [yarn](https://www.npmjs.com/package/yarn) for better DX.

## Usage Example

```typescript
import { readdirSync, readFileSync } from 'fs'
import { join } from 'path'
import {
  detectBufferMime,
  detectFileMime,
  detectFilenameMime,
} from 'mime-detect'

// return Promise<string> if not given callback
console.log(await detectFileMime('image.jpg'))
// print 'image/jpeg'

// also support callback-style for less async overhead
detectFileMime('index.html', (error, mime) => console.log(mime))
// print 'text/html; charset=us-ascii'

// also can detect from in-memory binary data
let mime = await detectBufferMime(buffer)

// If the mime is text/plain or application/octet-stream, it can determine mime from filename. Otherwise, the original mime will be returned
mime = detectFilenameMime('users.csv', mime)
```

## Typescript Signatures

```typescript
export function detectFileMime(file: string, cb: DetectMimeCallback): void
export function detectFileMime(file: string): Promise<string>

export function detectFilenameMime(file: string, mime?: string): string

export function detectBufferMime(buffer: Buffer, cb: DetectMimeCallback): void
export function detectBufferMime(buffer: Buffer): Promise<string>

export interface DetectMimeCallback {
  (error: Error, mime?: string): void
  (error: null, mime: string): void
}
```

## License

This project is licensed with [BSD-2-Clause](./LICENSE)

This is free, libre, and open-source software. It comes down to four essential freedoms [[ref]](https://seirdy.one/2021/01/27/whatsapp-and-the-domestication-of-users.html#fnref:2):

- The freedom to run the program as you wish, for any purpose
- The freedom to study how the program works, and change it so it does your computing as you wish
- The freedom to redistribute copies so you can help others
- The freedom to distribute copies of your modified versions to others
