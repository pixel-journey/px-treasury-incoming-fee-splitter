# Official sources

Fee split is a **dapp treasury pattern**, not a WAX system contract. Token movement still uses the token you configure.

| Source | Use |
| --- | --- |
| [docs.wax.io](https://docs.wax.io/) | WAX development |
| [docs.eosnetwork.com](https://docs.eosnetwork.com/) | Actions, `on_notify`, permissions |
| [eosio.token reference](https://github.com/eosio/eosio.contracts) | Transfer / balance primitives |
| [WAX API reference](https://docs.wax.io/build/api-reference/) | Chain reads |

Basis points in this lab are integers in `[1, 10000]` that must **sum to exactly 10000**. Related pure helpers: [px-invariant-kit](https://github.com/pixel-journey/px-invariant-kit) (`bps`, `quantity`).

## Domain map

| Repo | Role |
| --- | --- |
| **This repo** | Config + allocate + symbol gate |
| [px-treasury-linear-cliff-vesting](https://github.com/pixel-journey/px-treasury-linear-cliff-vesting) | Cliff + linear unlock |
| [px-token-transfer-tax-burn-treasury](https://github.com/pixel-journey/px-token-transfer-tax-burn-treasury) | Tax split on transfer |
| [px-token-dust-truncation-visualizer](https://github.com/pixel-journey/px-token-dust-truncation-visualizer) | When floor is zero |
