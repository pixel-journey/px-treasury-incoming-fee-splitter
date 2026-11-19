# Security — incoming fee splitter

## Closed in tests

| Issue | Behavior |
| --- | --- |
| Legs that do not sum to 10000 | `assertConfig` throws |
| Duplicate destinations | refused |
| Zero or oversized bps | refused |
| More than 8 legs | refused |
| Negative / oversized amount | refused |
| Floor dropping units | **last leg receives the remainder**; sum of legs equals the amount |

Earlier legs floor. Order of legs is a policy, not fairness.

## Not closed (production)

| Concern | Guidance |
| --- | --- |
| Notify hygiene | `get_first_receiver`; ignore self-outbound |
| Token allowlist | Only the intended contract, symbol, and precision |
| Admin | `setconfig` under msig; pause path from [pausable](https://github.com/pixel-journey/px-token-pausable-emergency-guard) |
| Inline actions | Destination names are constants — never a user-typed action |
| Auth | String equality in tests is not `require_auth` |
| Wasm | [pxsplit](https://github.com/pixel-journey/wax-contract-compiler/tree/main/contracts/pxsplit) is accounting only |

Shared checklist: [contract template](https://github.com/pixel-journey/px-antelope-contract-template/blob/main/SECURITY.md).

## Attack angles

1. Legs that sum to 9999 and silently drop the last unit.  
2. Flooring **every** leg, including the last, so dust disappears.  
3. Reordering legs and calling the new last recipient "the same split."  
4. Routing a user-typed memo into an inline action name.  
5. Accepting a second token symbol into the same splitter book.

## Honesty limits

No notify, no broadcast, no wasm in this repo. Related: [dust](https://github.com/pixel-journey/px-token-dust-truncation-visualizer) · [wallet tax](https://github.com/pixel-journey/px-token-transfer-tax-burn-treasury) · [treasury path](https://github.com/pixel-journey/px-contract-examples-vault/blob/main/docs/TREASURY-TOKEN-LEARNING-PATH.md).
