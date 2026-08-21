// SPDX-License-Identifier: MIT
const core = require('@actions/core')
const { getCLI, run } = require('./cli')

async function runAction (inputs) {
  const cliPath = await getCLI(inputs.version)
  const env = {}

  if (inputs.signingKey) {
    env.PROOFX_SIGNING_KEY = inputs.signingKey
  }

  let result = { verified: false }

  if (inputs.collect || inputs.prove) {
    result = await runCollectProveVerify(cliPath, inputs, env)
  } else if (inputs.proof) {
    result = await runVerify(cliPath, inputs.proof, env)
  } else if (inputs.verify) {
    result = await runVerify(cliPath, 'proof.json', env)
  }

  result.cliVersion = inputs.version
  return result
}

async function runCollectProveVerify (cliPath, inputs, env) {
  if (inputs.collect) {
    core.info('Initializing ProofX...')
    const initResult = await run(cliPath, ['init'], env)
    if (initResult.stderr) core.info(initResult.stderr)

    core.info('Collecting evidence...')
    const r = await run(cliPath, ['collect'], env)
    core.info(r.stdout)
    if (r.stderr) core.warning(r.stderr)
  }

  if (inputs.prove) {
    core.info('Generating signing key...')
    const keyResult = await run(cliPath, ['keygen'], env)
    if (keyResult.stderr) core.info(keyResult.stderr)

    core.info('Generating proof...')
    const r = await run(cliPath, ['prove'], env)
    core.info(r.stdout)
    if (r.stderr) core.warning(r.stderr)
  }

  if (inputs.verify) {
    core.info('Verifying proof...')
    return await runVerify(cliPath, 'proof.json', env)
  }

  return { verified: true, proofId: '', proofPath: 'proof.json', checks: [], coverage: 0, evidenceCount: 0, summary: 'Proof generated (not verified)' }
}

async function runVerify (cliPath, proofPath, env) {
  const r = await run(cliPath, ['verify', proofPath], env)
  const output = r.stdout + r.stderr
  return parseVerifyOutput(output, proofPath)
}

function parseVerifyOutput (output, proofPath) {
  const lines = output.split('\n')
  let proofId = ''
  let verified = false
  let coverageScore = 0
  let evidenceTotal = 0
  const checks = []

  for (const line of lines) {
    const trimmed = line.trim()

    const idMatch = trimmed.match(/ProofX Verification\s*[—–-]\s*(PX-\S+)/)
    if (idMatch) {
      proofId = idMatch[1]
    }

    const checkMatch = trimmed.match(/([✓✗·])\s+(\w+)\s*(?:\(([^)]*)\))?/)
    if (checkMatch) {
      const mark = checkMatch[1]
      const name = checkMatch[2]
      const detail = checkMatch[3] || ''
      let status = 'skipped'
      if (mark === '✓') status = 'ok'
      else if (mark === '✗') status = 'fail'
      checks.push({ name, status, detail })
    }

    const verifiedMatch = trimmed.match(/✓ VERIFIED\s*[—–-]\s*(\d+)\/(\d+)/)
    if (verifiedMatch) {
      verified = true
      evidenceTotal = parseInt(verifiedMatch[2], 10)
    }

    const notVerifiedMatch = trimmed.match(/✗ NOT VERIFIED\s*[—–-]\s*(\d+)\/(\d+)/)
    if (notVerifiedMatch) {
      verified = false
      evidenceTotal = parseInt(notVerifiedMatch[2], 10)
    }

    const coverageMatch = trimmed.match(/Verification coverage:\s*(\d+)/)
    if (coverageMatch) {
      coverageScore = parseInt(coverageMatch[1], 10)
    }
  }

  return {
    verified,
    proofId,
    proofPath,
    checks,
    coverage: coverageScore,
    evidenceCount: evidenceTotal,
    summary: output.trim()
  }
}

module.exports = { runAction, parseVerifyOutput }
