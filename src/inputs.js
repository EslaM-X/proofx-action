// SPDX-License-Identifier: MIT
const core = require('@actions/core')

const INPUTS = {
  proof: 'proof',
  collect: 'collect',
  prove: 'prove',
  verify: 'verify',
  signingKey: 'signing-key',
  failOnUnverified: 'fail-on-unverified',
  uploadProof: 'upload-proof',
  version: 'version'
}

function get (name) {
  return core.getInput(name)
}

function getBoolean (name) {
  return core.getInput(name).toLowerCase() === 'true'
}

function getAll () {
  return {
    proof: get(INPUTS.proof),
    collect: getBoolean(INPUTS.collect),
    prove: getBoolean(INPUTS.prove),
    verify: getBoolean(INPUTS.verify),
    signingKey: get(INPUTS.signingKey) || process.env.PROOFX_SIGNING_KEY || '',
    failOnUnverified: getBoolean(INPUTS.failOnUnverified),
    uploadProof: getBoolean(INPUTS.uploadProof),
    version: get(INPUTS.version)
  }
}

function validate (inputs) {
  const errors = []

  if (!inputs.version || !/^\d+\.\d+\.\d+/.test(inputs.version)) {
    errors.push(`Invalid version: "${inputs.version}"`)
  }

  if (inputs.proof && inputs.collect) {
    errors.push('Cannot use "proof" and "collect" together — collect generates a new proof')
  }

  if (inputs.prove && !inputs.collect && !inputs.proof) {
    errors.push('"prove" requires either "collect" (full pipeline) or "proof" (existing proof to re-sign)')
  }

  if (errors.length > 0) {
    throw new Error(`Invalid inputs:\n  ${errors.join('\n  ')}`)
  }
}

module.exports = { INPUTS, get, getBoolean, getAll, validate }
