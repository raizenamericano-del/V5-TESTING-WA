import fs from 'node:fs'
import path from 'node:path'
import { deflateRawSync } from 'node:zlib'

const IGNORED_DIRS = new Set([
  '.git', 'node_modules', '.next', '.nuxt', '.output', '.cache', '.local', '.npm', '.arena',
  '.venv', '__pycache__', '.pytest_cache', '.mypy_cache', '.ruff_cache', '.turbo', '.vite',
  '.vscode', '.idea', '.vercel', 'coverage', 'build', 'dist', 'out', 'target', 'logs',
  'test-results', 'playwright-report', '.screenshots', 'backups',
])

export function isExcluded(relative) {
  const normalized = relative.replaceAll('\\', '/')
  const parts = normalized.split('/')
  const name = parts.at(-1)
  if (parts.some((part) => IGNORED_DIRS.has(part))) return true
  if (parts[0] === 'data' && name !== '.gitkeep') return true
  if (name !== '.env.example' && (/^\.env(?:$|\.)/.test(name) || /\.env$/i.test(name))) return true
  if (['.DS_Store', 'Thumbs.db', '.zip-manifest', '.eslintcache', '.netrc', '.git-credentials'].includes(name)) return true
  if (/\.(?:db|sqlite|sqlite3)(?:[-.](?:journal|wal|shm))?$/i.test(name)) return true
  if (/\.(?:log|zip|tgz|tsbuildinfo|pyc|p12|pfx|pem|key)$/i.test(name)) return true
  if (/^(?:credentials|secrets|service-account)(?:[-.].*)?\.json$/i.test(name)) return true
  return false
}

/** Include new/untracked source files too. Never read links or sensitive runtime data. */
export function collectProjectFiles(root) {
  const result = []
  function visit(directory, prefix = '') {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const relative = prefix ? `${prefix}/${entry.name}` : entry.name
      if (entry.isSymbolicLink()) continue
      if (entry.isDirectory()) {
        if (!IGNORED_DIRS.has(entry.name)) visit(path.join(directory, entry.name), relative)
      } else if (entry.isFile() && !isExcluded(relative)) result.push(relative)
    }
  }
  visit(root)
  return result.sort()
}

const CRC_TABLE = Array.from({ length: 256 }, (_, value) => {
  let crc = value
  for (let bit = 0; bit < 8; bit++) crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1
  return crc >>> 0
})
export function crc32(buffer) {
  let crc = 0xffffffff
  for (const byte of buffer) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}
function dosDate(date) {
  const year = Math.min(2107, Math.max(1980, date.getUTCFullYear()))
  return {
    time: (date.getUTCHours() << 11) | (date.getUTCMinutes() << 5) | (date.getUTCSeconds() >> 1),
    date: ((year - 1980) << 9) | ((date.getUTCMonth() + 1) << 5) | date.getUTCDate(),
  }
}

/** Small standard ZIP writer using only Node built-ins (works on Windows/macOS/Linux). */
export function writeProjectZip(root, files, destination, prefix = 'MultiWA-Workspace') {
  if (files.length > 65535) throw new Error('Too many files for a standard ZIP archive')
  const localParts = []
  const directoryParts = []
  let offset = 0
  for (const relative of files) {
    if (isExcluded(relative)) throw new Error(`Refusing to archive excluded file: ${relative}`)
    const absolute = path.resolve(root, relative)
    if (!absolute.startsWith(`${path.resolve(root)}${path.sep}`)) throw new Error('Path outside project')
    const stat = fs.lstatSync(absolute)
    if (!stat.isFile() || stat.isSymbolicLink()) throw new Error('Only regular files can be archived')
    const content = fs.readFileSync(absolute)
    const compressed = deflateRawSync(content, { level: 9 })
    const name = Buffer.from(`${prefix}/${relative}`, 'utf8')
    const checksum = crc32(content)
    const stamp = dosDate(stat.mtime)
    const local = Buffer.alloc(30)
    local.writeUInt32LE(0x04034b50, 0)
    local.writeUInt16LE(20, 4)
    local.writeUInt16LE(0x0800, 6)
    local.writeUInt16LE(8, 8)
    local.writeUInt16LE(stamp.time, 10)
    local.writeUInt16LE(stamp.date, 12)
    local.writeUInt32LE(checksum, 14)
    local.writeUInt32LE(compressed.length, 18)
    local.writeUInt32LE(content.length, 22)
    local.writeUInt16LE(name.length, 26)
    localParts.push(local, name, compressed)
    const central = Buffer.alloc(46)
    central.writeUInt32LE(0x02014b50, 0)
    central.writeUInt16LE(0x0314, 4)
    central.writeUInt16LE(20, 6)
    central.writeUInt16LE(0x0800, 8)
    central.writeUInt16LE(8, 10)
    central.writeUInt16LE(stamp.time, 12)
    central.writeUInt16LE(stamp.date, 14)
    central.writeUInt32LE(checksum, 16)
    central.writeUInt32LE(compressed.length, 20)
    central.writeUInt32LE(content.length, 24)
    central.writeUInt16LE(name.length, 28)
    central.writeUInt32LE(((0o100000 | (stat.mode & 0o777)) << 16) >>> 0, 38)
    central.writeUInt32LE(offset, 42)
    directoryParts.push(central, name)
    offset += local.length + name.length + compressed.length
  }
  const directory = Buffer.concat(directoryParts)
  const end = Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50, 0)
  end.writeUInt16LE(files.length, 8)
  end.writeUInt16LE(files.length, 10)
  end.writeUInt32LE(directory.length, 12)
  end.writeUInt32LE(offset, 16)
  fs.mkdirSync(path.dirname(path.resolve(destination)), { recursive: true })
  fs.writeFileSync(destination, Buffer.concat([...localParts, directory, end]))
  return { files: files.length, bytes: fs.statSync(destination).size }
}
