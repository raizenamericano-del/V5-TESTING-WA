#!/usr/bin/env node
import path from 'node:path'
import process from 'node:process'
import { collectProjectFiles, writeProjectZip } from './project-archive.mjs'

const root = process.cwd()
const destination = path.resolve(root, process.argv[2] || 'MultiWA-Workspace.zip')
try {
  const files = collectProjectFiles(root).filter((relative) => path.resolve(root, relative) !== destination)
  const result = writeProjectZip(root, files, destination)
  console.log(`ZIP siap: ${destination}`)
  console.log(`${result.files} berkas sumber · ${(result.bytes / 1024 / 1024).toFixed(2)} MB`)
  console.log('Tanpa .git, node_modules, .next, kredensial .env, database, data runtime, atau log.')
} catch (error) {
  console.error('ZIP tidak dapat dibuat:', error instanceof Error ? error.message : error)
  process.exitCode = 1
}
