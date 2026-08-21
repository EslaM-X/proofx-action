// SPDX-License-Identifier: MIT
const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const { platform, binaryName } = require('../src/cli')

describe('cli', () => {
  it('detects platform', () => {
    const plat = platform()
    assert.ok(plat.includes('-'))
    assert.ok(plat.length > 3)
  })

  it('detects binary name', () => {
    const name = binaryName()
    assert.ok(typeof name === 'string')
    assert.ok(name.length > 0)
  })
})
