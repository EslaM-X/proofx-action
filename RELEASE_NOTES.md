## ProofX GitHub Action v0.3.0

First release of the ProofX GitHub Action.

### Features
- Secure CLI bootstrap with SHA-256 verification
- Modular architecture (inputs, runner, cli, outputs, summary)
- GitHub Step Summary with visual verification report
- Failure annotations
- Artifact upload for proof.json
- 9/9 tests passing

### Usage

Verify an existing proof:
```yaml
- uses: EslaM-X/proofx-action@v0.3.0
  with:
    proof: ./proof.json
```

Generate + verify:
```yaml
- uses: EslaM-X/proofx-action@v0.3.0
  with:
    collect: true
    prove: true
    verify: true
```
