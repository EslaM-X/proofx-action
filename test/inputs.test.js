// SPDX-License-Identifier: MIT
const { describe, it } = require('node:test')
const assert = require('node:assert/strict')

process.env.INPUT_PROOF = ''
process.env.INPUT_COLLECT = 'false'
process.env.INPUT_PROVE = 'false'
process.env.INPUT_VERIFY = 'true'
process.env['INPUT_FAIL-ON-UNVERIFIED'] = 'true'
process.env['INPUT_UPLOAD-PROOF'] = 'true'
process.env.INPUT_VERSION = '0.3.0'

const { getAll, validate } = require('../src/inputs')

describe('inputs', () => {
  it('parses default inputs', () => {
    const inputs = getAll()
    assert.equal(inputs.proof, '')
    assert.equal(inputs.collect, false)
    assert.equal(inputs.prove, false)
    assert.equal(inputs.verify, true)
    assert.equal(inputs.failOnUnverified, true)
    assert.equal(inputs.uploadProof, true)
    assert.equal(inputs.version, '0.3.0')
  })

  it('validates version format', () => {
    assert.throws(
      () => validate({ version: 'bad', proof: '', collect: false, prove: false, verify: true, failOnUnverified: true }),
      /Invalid version/
    )
  })

  it('rejects proof + collect together', () => {
    assert.throws(
      () => validate({ version: '0.3.0', proof: './proof.json', collect: true, prove: false, verify: true, failOnUnverified: true }),
      /Cannot use "proof" and "collect" together/
    )
  })

  it('accepts valid inputs', () => {
    assert.doesNotThrow(() => validate({
      version: '0.3.0',
      proof: '',
      collect: true,
      prove: true,
      verify: true,
      failOnUnverified: true
    }))
  })
})
