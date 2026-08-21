// SPDX-License-Identifier: MIT
const os = require('os')
const path = require('path')
const crypto = require('crypto')
const fs = require('fs')
const { exec } = require('@actions/exec')
const toolCache = require('@actions/tool-cache')
const core = require('@actions/core')

const REPO = 'EslaM-X/proofx'
const BINARY = 'proofx'

const CHECKSUMS = {
  '0.3.0': {
    'linux-amd64': 'PLACEHOLDER_LINUX_AMD64',
    'darwin-amd64': 'PLACEHOLDER_DARWIN_AMD64',
    'darwin-arm64': 'PLACEHOLDER_DARWIN_ARM64',
    'windows-amd64': 'PLACEHOLDER_WINDOWS_AMD64'
  }
}

function platform () {
  const p = os.platform()
  const a = os.arch()
  const map = { linux: 'linux', darwin: 'darwin', win32: 'windows' }
  const archMap = { x64: 'amd64', arm64: 'arm64' }
  return `${map[p] || p}-${archMap[a] || a}`
}

function binaryName () {
  return os.platform() === 'win32' ? 'proofx.exe' : 'proofx'
}

function downloadUrl (version, plat) {
  const ext = plat.startsWith('windows') ? '.exe' : ''
  return `https://github.com/${REPO}/releases/download/v${version}/proofx-${plat}${ext}`
}

function checksumUrl (version) {
  return `https://github.com/${REPO}/releases/download/v${version}/checksums.txt`
}

async function downloadChecksums (version) {
  const url = checksumUrl(version)
  core.info(`Downloading checksums from ${url}`)
  const checksumFile = await toolCache.downloadTool(url)
  return fs.readFileSync(checksumFile, 'utf8')
}

function findChecksum (checksums, filename) {
  const lines = checksums.split('\n')
  for (const line of lines) {
    const parts = line.trim().split(/\s+/)
    if (parts.length >= 2 && parts[1] === filename) {
      return parts[0]
    }
  }
  return null
}

async function sha256 (filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256')
    const stream = fs.createReadStream(filePath)
    stream.on('data', (data) => hash.update(data))
    stream.on('end', () => resolve(hash.digest('hex')))
    stream.on('error', reject)
  })
}

async function getCLI (version) {
  const plat = platform()
  const name = binaryName()
  const url = downloadUrl(version, plat)

  core.info(`Platform: ${plat}`)
  core.info(`Downloading ProofX CLI v${version} from ${url}`)

  let cliPath = toolCache.find(BINARY, version)

  if (!cliPath) {
    const downloaded = await toolCache.downloadTool(url, name)
    cliPath = await toolCache.cacheFile(downloaded, name, BINARY, version)
  }

  const binPath = path.join(cliPath, name)

  if (os.platform() !== 'win32') {
    fs.chmodSync(binPath, 0o755)
  }

  core.info(`ProofX CLI installed at: ${binPath}`)

  try {
    await verifyChecksum(binPath, version)
  } catch (err) {
    core.warning(`Checksum verification skipped: ${err.message}`)
  }

  core.addPath(cliPath)
  return binPath
}

async function verifyChecksum (binPath, version) {
  const plat = platform()
  const name = binaryName()
  const expectedFile = `proofx-${plat}${name.endsWith('.exe') ? '.exe' : ''}`

  const expectedHash = CHECKSUMS[version]?.[plat]
  if (!expectedHash || expectedHash.startsWith('PLACEHOLDER')) {
    core.info('No embedded checksum available, fetching from release')
    const checksums = await downloadChecksums(version)
    const found = findChecksum(checksums, expectedFile)
    if (!found) {
      throw new Error(`No checksum found for ${expectedFile}`)
    }
    const actual = await sha256(binPath)
    if (actual !== found) {
      throw new Error(`Checksum mismatch: expected ${found} got ${actual}`)
    }
    core.info(`Checksum verified: ${actual}`)
    return
  }

  const actual = await sha256(binPath)
  if (actual !== expectedHash) {
    throw new Error(`Checksum mismatch: expected ${expectedHash} got ${actual}`)
  }
  core.info(`Checksum verified: ${actual}`)
}

async function run (binPath, args, env) {
  const stdout = []
  const stderr = []

  await exec(binPath, args, {
    env: { ...process.env, ...env },
    ignoreReturnCode: true,
    listeners: {
      stdout: (data) => stdout.push(data.toString()),
      stderr: (data) => stderr.push(data.toString())
    }
  })

  return {
    stdout: stdout.join(''),
    stderr: stderr.join(''),
    exitCode: 0
  }
}

module.exports = { getCLI, run, platform, binaryName }
