// SPDX-License-Identifier: MIT
const core = require('@actions/core')

function setOutputs (result) {
  core.setOutput('verified', String(result.verified))
  core.setOutput('proof-id', result.proofId || '')
  core.setOutput('evidence-count', String(result.evidenceCount || 0))
  core.setOutput('coverage', String(result.coverage || 0))
  core.setOutput('summary', result.summary || '')
  core.setOutput('proof-path', result.proofPath || '')
  core.setOutput('verification-json', JSON.stringify(result))
}

module.exports = { setOutputs }
