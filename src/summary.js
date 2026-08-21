// SPDX-License-Identifier: MIT
const core = require('@actions/core')

const SEPARATOR = '\u2501'.repeat(40)

function buildSummary (result) {
  const status = result.verified ? '\u2713 PROOF VERIFIED' : '\u2717 PROOF NOT VERIFIED'

  const checks = result.checks || []
  const binding = checks.find((c) => c.name === 'binding')
  const signature = checks.find((c) => c.name === 'signature')

  const bindingStatus = binding ? formatStatus(binding.status) : 'SKIPPED'
  const signatureStatus = signature ? formatStatus(signature.status) : 'SKIPPED'

  const evidenceNodes = checks.filter((c) => c.name !== 'binding' && c.name !== 'signature' && c.name !== 'artifact')
  const evidencePassed = evidenceNodes.filter((c) => c.status === 'ok').length
  const evidenceTotal = evidenceNodes.length

  const artifact = checks.find((c) => c.name === 'artifact')
  const artifactStatus = artifact ? formatStatus(artifact.status) : 'N/A'

  const lines = [
    '',
    SEPARATOR,
    '',
    `       ${status}`,
    '',
    `Proof ID       ${result.proofId || 'unknown'}`,
    `Evidence       ${evidencePassed} / ${evidenceTotal}`,
    `Coverage       ${result.coverage || 0}%`,
    `Binding        ${bindingStatus}`,
    `Signature      ${signatureStatus}`,
    `Artifacts      ${artifactStatus}`,
    '',
    SEPARATOR,
    '',
    `Verification performed by ProofX v${result.cliVersion || '0.3.0'}`,
    ''
  ]

  return lines.join('\n')
}

function formatStatus (status) {
  switch (status) {
    case 'ok': return '\u2713 PASS'
    case 'fail': return '\u2717 FAIL'
    case 'skipped': return '\u2022 SKIP'
    default: return status
  }
}

function buildFailureAnnotation (result) {
  const failed = (result.checks || []).filter((c) => c.status === 'fail')
  if (failed.length === 0) return ''

  const lines = ['\u2717 Proof verification failed', '']
  for (const check of failed) {
    lines.push(`  ${check.name}: ${check.detail || 'no detail'}`)
  }
  return lines.join('\n')
}

async function writeSummary (result) {
  const summary = buildSummary(result)
  core.summary.addRaw(`<pre>${summary}</pre>`)
  await core.summary.write()

  if (!result.verified) {
    const annotation = buildFailureAnnotation(result)
    if (annotation) {
      core.error(annotation)
    }
  }
}

module.exports = { buildSummary, writeSummary, buildFailureAnnotation }
