# Sources

| Source | Use |
| --- | --- |
| [docs.wax.io](https://docs.wax.io/) | Transfers, contracts |
| [docs.eosnetwork.com](https://docs.eosnetwork.com/) | on_notify, permissions |
| [eosio.token](https://github.com/eosio/eosio.contracts) | Transfer notify shape |

**Product facts locked by tests:** basis points of all legs must sum to **10000**. Earlier legs **floor**. The **last** leg receives the remainder so units are not dropped. Order of legs is a policy, not fairness.

C++ mirror: [pxsplit](https://github.com/pixel-journey/wax-contract-compiler/tree/main/contracts/pxsplit) — accounting only, not deployed.

## Related labs

| Lab | Topic |
| --- | --- |
| [dust](https://github.com/pixel-journey/px-token-dust-truncation-visualizer) | When a bps fee floors to 0 |
| [wallet tax](https://github.com/pixel-journey/px-token-transfer-tax-burn-treasury) | Burn share of the tax |
| [dex tax](https://github.com/pixel-journey/px-token-dex-differentiated-tax) | Pool sees exact qty |
| [vesting](https://github.com/pixel-journey/px-treasury-linear-cliff-vesting) | Time-gated claims |
| [pausable](https://github.com/pixel-journey/px-token-pausable-emergency-guard) | Emergency stop |
| [treasury path](https://github.com/pixel-journey/px-contract-examples-vault/blob/main/docs/TREASURY-TOKEN-LEARNING-PATH.md) | Formulas cheatsheet |
