<p align="center">
  <img src="https://raw.githubusercontent.com/EslaM-X/proofx/main/static/proofx-logo.svg" width="120" alt="ProofX Logo">
</p>

<h1 align="center">ProofX GitHub Action</h1>

<p align="center">
  <strong>Cryptographic Evidence Verification for CI/CD</strong>
</p>

<p align="center">
  <a href="https://github.com/EslaM-X/proofx-action/actions/workflows/ci.yml"><img src="https://github.com/EslaM-X/proofx-action/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://github.com/EslaM-X/proofx-action/actions/workflows/dogfood.yml"><img src="https://github.com/EslaM-X/proofx-action/actions/workflows/dogfood.yml/badge.svg" alt="Dogfood"></a>
  <a href="https://github.com/EslaM-X/proofx-action/blob/main/LICENSE"><img src="https://img.shields.io/github/license/EslaM-X/proofx-action" alt="License"></a>
  <a href="https://github.com/EslaM-X/proofx-action/releases"><img src="https://img.shields.io/github/v/release/EslaM-X/proofx-action" alt="Release"></a>
  <a href="https://github.com/EslaM-X/proofx-action"><img src="https://img.shields.io/github/stars/EslaM-X/proofx-action" alt="Stars"></a>
</p>

<p align="center">
  Generate, sign, and verify cryptographic evidence proofs in GitHub Actions.<br>
  Turn <em>"trust me"</em> into <em>"verify it yourself"</em>.
</p>

---

## Quick Start

### Verify an existing proof

```yaml
- uses: EslaM-X/proofx-action@v0.3.0
  with:
    proof: ./proof.json
```

### Generate + verify in one step

```yaml
- uses: EslaM-X/proofx-action@v0.3.0
  with:
    collect: true
    prove: true
    verify: true
```

### Full pipeline with signing

```yaml
- uses: EslaM-X/proofx-action@v0.3.0
  with:
    collect: true
    prove: true
    verify: true
    version: "0.3.0"
  env:
    PROOFX_SIGNING_KEY: ${{ secrets.PROOFX_SIGNING_KEY }}
```

---

## How It Works

```
┌─────────────────────────────────────────────────────────┐
│                   GitHub Workflow                        │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  proofx-action                           │
│                                                         │
│   1. Download ProofX CLI (pinned version)               │
│   2. SHA-256 checksum verification                      │
│   3. Execute: collect → prove → verify                  │
│                                                         │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    proof.json                            │
│                                                         │
│   • Evidence nodes (git, deps, artifacts, env)          │
│   • Merkle tree binding                                 │
│   • Ed25519 digital signature                           │
│                                                         │
└────────────────────────┬────────────────────────────────┘
                         │
              ┌──────────┼──────────┐
              ▼          ▼          ▼
        ┌──────────┐ ┌────────┐ ┌──────────┐
        │ Outputs  │ │Summary │ │ Artifact │
        │ (JSON)   │ │ (UI)   │ │ (proof)  │
        └──────────┘ └────────┘ └──────────┘
```

---

## Inputs

| Input | Description | Default | Required |
|-------|-------------|---------|----------|
| `proof` | Path to an existing `proof.json` to verify | — | No |
| `collect` | Collect evidence nodes before proving | `false` | No |
| `prove` | Generate a cryptographic proof | `false` | No |
| `verify` | Verify the proof after generation | `true` | No |
| `signing-key` | Ed25519 private signing key | — | No |
| `fail-on-unverified` | Fail the workflow when verification fails | `true` | No |
| `upload-proof` | Upload `proof.json` as a workflow artifact | `true` | No |
| `version` | ProofX CLI version to install | `0.3.0` | No |

> **Security Note:** Prefer using `env: PROOFX_SIGNING_KEY` over the `signing-key` input to avoid exposing secrets in workflow logs.

---

## Outputs

| Output | Type | Description |
|--------|------|-------------|
| `verified` | `string` | `"true"` or `"false"` |
| `proof-id` | `string` | Proof identifier (e.g. `PX-e2cc6779`) |
| `evidence-count` | `string` | Number of evidence nodes |
| `coverage` | `string` | Coverage percentage (0–100) |
| `summary` | `string` | Human-readable verification report |
| `proof-path` | `string` | Path to generated `proof.json` |
| `verification-json` | `string` | Machine-readable JSON result |

### Using outputs in subsequent steps

```yaml
- name: Verify
  id: proofx
  uses: EslaM-X/proofx-action@v0.3.0
  with:
    proof: ./proof.json

- name: Use results
  if: steps.proofx.outputs.verified == 'true'
  run: |
    echo "Proof ID: ${{ steps.proofx.outputs.proof-id }}"
    echo "Coverage: ${{ steps.proofx.outputs.coverage }}%"
```

---

## GitHub Step Summary

Every run produces a visual verification report in the Actions tab:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

       ✓ PROOF VERIFIED

Proof ID       PX-e2cc6779
Evidence       5 / 5
Coverage       100%
Binding        ✓ PASS
Signature      ✓ PASS
Artifacts      ✓ PASS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Verification performed by ProofX v0.3.0
```

---

## Security

| Feature | Description |
|---------|-------------|
| **Binary Verification** | CLI is SHA-256 checksum verified before execution |
| **Pinned Versions** | Actions use `@v0.3.0` — no floating tags in production |
| **Secret Isolation** | Signing keys via environment variables, never logged |
| **Local Verification** | No proof data leaves the GitHub Actions runner |
| **Orchestration Only** | No cryptographic implementation in the Action — all crypto in ProofX CLI |

---

## Architecture

```
ProofX Ecosystem
│
├── proofx-action          ← This repository
│   ├── action.yml         Action definition
│   ├── src/
│   │   ├── index.js       Entry point
│   │   ├── runner.js      Orchestration layer
│   │   ├── cli.js         CLI download + verification
│   │   ├── inputs.js      Input parsing + validation
│   │   ├── outputs.js     Output setting
│   │   └── summary.js     GitHub Step Summary
│   ├── dist/              Bundled action (ncc)
│   ├── test/              Unit tests
│   └── examples/          Workflow examples
│
├── proofx CLI             github.com/EslaM-X/proofx
│   ├── verifycore         Verification engine
│   ├── evidence           Evidence collectors
│   ├── proof              Proof format + signing
│   └── merkle             Merkle tree binding
│
└── proofx.dev             Verification portal
    └── WASM               Browser-based verification
```

---

## Examples

<details>
<summary><strong>Verify after build</strong></summary>

```yaml
name: Build + Verify

on: push

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build
        run: make build

      - name: Generate proof
        run: |
          proofx init
          proofx keygen
          proofx collect
          proofx prove

      - name: Verify
        uses: EslaM-X/proofx-action@v0.3.0
        with:
          proof: ./proof.json
```

</details>

<details>
<summary><strong>Verify artifacts</strong></summary>

```yaml
name: Release + Verify Artifacts

on:
  release:
    types: [published]

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Download artifact from release
        run: curl -sSL -O ${{ github.event.release.assets[0].browser_download_url }}

      - name: Verify artifact
        uses: EslaM-X/proofx-action@v0.3.0
        with:
          proof: ./proof.json
```

</details>

<details>
<summary><strong>Conditional verification</strong></summary>

```yaml
- name: Verify
  id: proofx
  uses: EslaM-X/proofx-action@v0.3.0
  with:
    proof: ./proof.json
    fail-on-unverified: false

- name: Alert on failure
  if: steps.proofx.outputs.verified == 'false'
  run: |
    echo "::error::Proof verification failed!"
    # Send notification, create issue, etc.
```

</details>

---

## Project Map

```
proofx-action/
│
├── .github/
│   └── workflows/
│       ├── ci.yml              Lint + test + build
│       └── dogfood.yml         Self-verification
│
├── src/
│   ├── index.js                Entry point — orchestrates everything
│   ├── runner.js               Executes CLI commands, parses output
│   ├── cli.js                  Downloads + verifies CLI binary
│   ├── inputs.js               Parses + validates action inputs
│   ├── outputs.js              Sets GitHub Action outputs
│   └── summary.js              Generates Step Summary + annotations
│
├── dist/
│   └── index.js                Bundled action (ncc — single file)
│
├── test/
│   ├── inputs.test.js          Input parsing tests
│   ├── outputs.test.js         Summary generation tests
│   └── integration.test.js     Platform detection tests
│
├── examples/
│   ├── verify.yml              Verify existing proof
│   ├── prove-and-verify.yml    Generate + verify
│   └── collect-prove-verify.yml  Full pipeline
│
├── action.yml                  Action definition (inputs, outputs, branding)
├── package.json                Dependencies + scripts
├── LICENSE                     MIT License
└── README.md                   This file
```

---

## Requirements

- **GitHub Actions** runner: `ubuntu-latest`, `macos-latest`, or `windows-latest`
- **Node.js 20+** (GitHub Actions runtime)
- **ProofX CLI** — downloaded automatically by the Action

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Make your changes
4. Run tests (`npm test`)
5. Run lint (`npm run lint`)
6. Build (`npm run build`)
7. Submit a Pull Request

> All PRs require status checks to pass and code review before merging.

---

## License

MIT License — Copyright (c) 2026 EslaM-X

See [LICENSE](LICENSE) for full text.

---

<p align="center">
  Built with care by <a href="https://github.com/EslaM-X">EslaM-X</a><br>
  <sub>Part of the <a href="https://github.com/EslaM-X/proofx">ProofX</a> ecosystem</sub>
</p>
