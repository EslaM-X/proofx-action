// SPDX-License-Identifier MIT
const core = require('@actions/core')
const artifact = require('@actions/artifact')
const { getAll, validate } = require('./inputs')
const { runAction } = require('./runner')
const { setOutputs } = require('./outputs')
const { writeSummary } = require('./summary')

async function main () {
  try {
    const inputs = getAll()
    validate(inputs)

    core.info(`ProofX Action v${inputs.version}`)
    core.info(`Mode: ${inputs.collect ? 'collect' : ''} ${inputs.prove ? 'prove' : ''} ${inputs.verify ? 'verify' : ''}`.trim() || 'verify')

    const result = await runAction(inputs)

    setOutputs(result)
    await writeSummary(result)

    if (result.verified) {
      core.info(`\u2713 Proof verified: ${result.proofId}`)
    } else {
      core.warning(`\u2717 Proof NOT verified: ${result.proofId}`)
    }

    if (inputs.uploadProof && result.proofPath) {
      try {
        await artifact.uploadArtifact('proofx-proof', [result.proofPath], '.')
        core.info('Proof artifact uploaded')
      } catch (err) {
        core.warning(`Artifact upload failed: ${err.message}`)
      }
    }

    if (!result.verified && inputs.failOnUnverified) {
      core.setFailed('Proof verification failed')
    }
  } catch (err) {
    core.setFailed(err.message)
  }
}

main()
