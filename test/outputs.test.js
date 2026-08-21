// SPDX-License-Identifier: MIT
const { describe, it } = require('node:test')
const assert = require('node:assert/strict')

const { buildSummary, buildFailureAnnotation } = require('../src/summary')

describe('summary', () => {
  it('builds verified summary', () => {
    const result = {
      verified: true,
      proofId: 'PX-e2cc6779',
      coverage: 100,
      cliVersion: '0.3.0',
      checks: [
        { name: 'binding', status: 'ok', detail: 'merkle root matches' },
        { name: 'signature', status: 'ok', detail: 'ed25519' },
        { name: 'git', status: 'ok', detail: 'abc123' },
        { name: 'artifact', status: 'ok', detail: 'sha256 matches' }
      ]
    }

    const summary = buildSummary(result)
    assert.ok(summary.includes('PROOF VERIFIED'))
    assert.ok(summary.includes('PX-e2cc6779'))
    assert.ok(summary.includes('100%'))
    assert.ok(summary.includes('PASS'))
  })

  it('builds failed summary', () => {
    const result = {
      verified: false,
      proofId: 'PX-bad',
      coverage: 50,
      cliVersion: '0.3.0',
      checks: [
        { name: 'binding', status: 'ok', detail: '' },
        { name: 'signature', status: 'fail', detail: 'bad sig' },
        { name: 'git', status: 'ok', detail: 'abc123' }
      ]
    }

    const summary = buildSummary(result)
    assert.ok(summary.includes('PROOF NOT VERIFIED'))
    assert.ok(summary.includes('FAIL'))
  })

  it('builds failure annotation', () => {
    const result = {
      verified: false,
      checks: [
        { name: 'signature', status: 'fail', detail: 'signature mismatch' }
      ]
    }

    const annotation = buildFailureAnnotation(result)
    assert.ok(annotation.includes('signature mismatch'))
    assert.ok(annotation.includes('Proof verification failed'))
  })
})
