// SPDX-License-Identifier: MIT
const path = require('path')
const core = require('@actions/core')
const { getCLI, run } = require('./cli')

async function runAction (inputs) {
  const cliPath = await getCLI(inputs.version)
  const env = {}

  if (inputs.signingKey) {
    env.PROOFX_SIGNING_KEY = inputs.signingKey
  }

  let proofPath = inputs.proof
  let result = { verified: false }

  if (inputs.collect || inputs.prove) {
    result = await runCollectProveVerify(cliPath, inputs, env)
  } else if (proofPath) {
    result = await runVerify(cliPath, proofPath, env)
  } else if (inputs.verify) {
    result = await runVerifyDefault(cliPath, env)
  }

  result.cliVersion = inputs.version
  return result
}

async function runCollectProveVerify (cliPath, inputs, env) {
  if (inputs.collect) {
    core.info('Collecting evidence...')
    const collectResult = await run(cliPath, ['collect'], env)
    core.info(collectResult.stdout)
    if (collectResult.stderr) core.warning(collectResult.stderr)
  }

  if (inputs.prove) {
    core.info('Generating proof...')
    const args = ['prove']
    const proveResult = await run(cliPath, args, env)
    core.info(proveResult.stdout)
    if (proveResult.stderr) core.warning(proveResult.stderr)
  }

  if (inputs.verify) {
    core.info('Verifying proof...')
    return await runVerifyDefault(cliPath, env)
  }

  return { verified: true, proofId: '', proofPath: 'proof.json', checks: [], coverage: 0, summary: 'Proof generated (not verified)' }
}

async function runVerifyDefault (cliPath, env) {
  return await runVerify(cliPath, 'proof.json', env)
}

async function runVerify (cliPath, proofPath, env) {
  const verifyResult = await run(cliPath, ['verify', proofPath, '--json'], env)

  let parsed = {}
  try {
    parsed = JSON.parse(verifyResult.stdout)
  } catch {
    const jsonMatch = verifyResult.stdout.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0])
    }
  }

  return {
    verified: parsed.verified || false,
    proofId: parsed.proofId || '',
    proofPath,
    checks: parsed.checks || [],
    coverage: parsed.coverage?.score || 0,
    evidenceCount: parsed.coverage?.total || 0,
    summary: verifyResult.stdout.trim()
  }
}

module.exports = { runAction }
