# Official sources

Fee split is a **dapp treasury pattern**, not a WAX system contract. Token movement still uses the token you configure.

| Source | Use |
| --- | --- |
| [docs.wax.io](https://docs.wax.io/) | WAX development |
| [docs.eosnetwork.com](https://docs.eosnetwork.com/) | Actions, `on_notify`, permissions |
| [eosio.token reference](https://github.com/eosio/eosio.contracts) | Transfer / balance primitives |
| [WAX API reference](https://docs.wax.io/build/api-reference/) | Chain reads |
| [Antelope CDT](https://docs.eosnetwork.com/docs/latest/smart-contracts/) | Contract structure, `on_notify` |

## Production mirror in this org

| Artifact | Link |
| --- | --- |
| C++ `pxsplit` | [wax-contract-compiler/contracts/pxsplit](https://github.com/pixel-journey/wax-contract-compiler/tree/main/contracts/pxsplit) |
| CI run | [run 27](https://github.com/pixel-journey/wax-contract-compiler/actions/runs/43212751217) |
| WASM SHA256 | `a76fc2f8a93ff5e92f907ca04016df2a2c11eae049b62a1463236e217c345dc9` |

Mirror validates config and previews allocation. **Does not** transfer tokens. **Not deployed.**

Basis points in this lab are integers in `[1, 10000]` that must **sum to exactly 10000**. Related pure helpers: [px-invariant-kit](https://github.com/pixel-journey/px-invariant-kit) (`bps`, `quantity`).

## Domain map

| Repo | Role |
| --- | --- |
| **This repo** | Config + allocate + symbol gate + sequential desk |
| [px-treasury-linear-cliff-vesting](https://github.com/pixel-journey/px-treasury-linear-cliff-vesting) | Cliff + linear unlock |
| [px-token-transfer-tax-burn-treasury](https://github.com/pixel-journey/px-token-transfer-tax-burn-treasury) | Tax split on transfer |
| [px-token-dust-truncation-visualizer](https://github.com/pixel-journey/px-token-dust-truncation-visualizer) | When floor is zero |
| [px-token-pausable-emergency-guard](https://github.com/pixel-journey/px-token-pausable-emergency-guard) | Admin pause / msig unpause |
