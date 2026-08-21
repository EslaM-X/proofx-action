# ProofX GitHub Action

Generate, sign, and verify cryptographic evidence proofs in CI.

**Verify an existing proof:**

```yaml
- uses: EslaM-X/proofx-action@v0.3.0
  with:
    proof: ./proof.json
```

**Generate + verify in one step:**

```yaml
- uses: EslaM-X/proofx-action@v0.3.0
  with:
    collect: true
    prove: true
    verify: true
  env:
    PROOFX_SIGNING_KEY: ${{ secrets.PROOFX_SIGNING_KEY }}
```

## Inputs

| Input | Description | Default |
|-------|-------------|---------|
| `proof` | Path to existing proof.json | — |
| `collect` | Collect evidence before proving | `false` |
| `prove` | Generate a cryptographic proof | `false` |
| `verify` | Verify the proof | `true` |
| `signing-key` | Ed25519 private key (prefer env) | — |
| `fail-on-unverified` | Fail workflow on verification failure | `true` |
| `upload-proof` | Upload proof.json as artifact | `true` |
| `version` | ProofX CLI version | `0.3.0` |

## Outputs

| Output | Description |
|--------|-------------|
| `verified` | `true` or `false` |
| `proof-id` | Proof identifier (e.g. `PX-e2cc6779`) |
| `evidence-count` | Number of evidence nodes |
| `coverage` | Coverage percentage (0-100) |
| `summary` | Human-readable verification report |
| `proof-path` | Path to proof.json |
| `verification-json` | Machine-readable JSON result |

## How It Works

```
GitHub Workflow
       │
       ▼
proofx-action
       │
       ├── Download ProofX CLI
       ├── SHA-256 verify
       │
       ▼
   ProofX CLI
       │
       ├── collect
       ├── prove
       └── verify
       │
       ▼
   proof.json
       │
       ├── Outputs
       ├── GitHub Step Summary
       └── Artifact upload
```

## Security

- CLI binary is **SHA-256 verified** before execution
- Signing keys are passed via **environment variables**, never logged
- No proof data leaves the runner

## GitHub Step Summary

Every run produces a visual summary in the Actions tab:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

       ✓ PROOF VERIFIED

Proof ID       PX-e2cc6779
Evidence       5 / 5
Coverage       100%
Binding        ✓ PASS
Signature      ✓ PASS
Artifacts      ✓ PASS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Verification performed by ProofX v0.3.0
```

## License

MIT
