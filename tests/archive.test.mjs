import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { inflateRawSync } from 'node:zlib'
import { collectProjectFiles, isExcluded, writeProjectZip, crc32 } from '../scripts/project-archive.mjs'

test('runtime, secrets, databases, and generated files are excluded', () => {
  for (const file of ['.env', '.env.local', '.env.production', '.env.preview', 'backup.env', 'prisma/dev.db', 'prisma/dev.db-wal', 'data/auth/session/creds.json', 'data/vapid.json', 'data/media/photo.jpg', '.git/config', 'node_modules/react/index.js', '.next/server/app.js', 'test-results/a.png', 'debug.log', 'old.zip', 'private.pem']) assert.ok(isExcluded(file), file)
})
test('source files, examples, licensing, and new brand assets are included', () => {
  for (const file of ['.env.example', '.gitignore', 'LICENSE', 'README.md', 'app/page.tsx', 'public/fonts/manrope-latin.woff2', 'public/fonts/OFL-Manrope.txt', 'public/brand/logo.svg', 'components/brand.tsx', 'data/.gitkeep']) assert.ok(!isExcluded(file), file)
})
test('new source files are collected without staging in git', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'multiwa-archive-'))
  try {
    fs.mkdirSync(path.join(root, 'components')); fs.writeFileSync(path.join(root, 'components', 'brand.tsx'), 'export const Brand = 1')
    fs.mkdirSync(path.join(root, 'node_modules')); fs.writeFileSync(path.join(root, 'node_modules', 'secret.js'), 'excluded')
    fs.writeFileSync(path.join(root, '.env'), 'excluded'); fs.writeFileSync(path.join(root, '.env.example'), 'example')
    assert.deepEqual(collectProjectFiles(root), ['.env.example', 'components/brand.tsx'])
  } finally { fs.rmSync(root, { recursive: true, force: true }) }
})
test('ZIP payload round-trips with UTF-8 filenames and correct CRC', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'multiwa-zip-'))
  try {
    const text = 'MultiWA — ruang kerja komunikasi.'
    fs.writeFileSync(path.join(root, 'panduan.txt'), text)
    const destination = path.join(root, 'test.zip')
    const result = writeProjectZip(root, ['panduan.txt'], destination)
    assert.equal(result.files, 1)
    const zip = fs.readFileSync(destination)
    assert.equal(zip.readUInt32LE(0), 0x04034b50)
    const nameLength = zip.readUInt16LE(26)
    assert.equal(zip.subarray(30, 30 + nameLength).toString(), 'MultiWA-Workspace/panduan.txt')
    const compressedLength = zip.readUInt32LE(18)
    const restored = inflateRawSync(zip.subarray(30 + nameLength, 30 + nameLength + compressedLength))
    assert.equal(restored.toString(), text)
    assert.equal(crc32(restored), zip.readUInt32LE(14))
    assert.equal(zip.readUInt32LE(zip.length - 22), 0x06054b50)
  } finally { fs.rmSync(root, { recursive: true, force: true }) }
})
test('sensitive files cannot be manually added to the archive', () => {
  assert.throws(() => writeProjectZip(process.cwd(), ['.env'], path.join(os.tmpdir(), 'invalid.zip')), /excluded/)
})
test('CRC32 matches the standard test vector', () => { assert.equal(crc32(Buffer.from('123456789')), 0xcbf43926) })
