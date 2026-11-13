# Tips — fee splitters on Antelope / WAX

## Config design

- Always require **Σ bps = 10000**. Never “fix” a missing remainder into the contract’s own balance without an explicit leg.
- Put the **dust-favored** destination **last**, and document that in the setconfig memo or multisig description.
- Cap the number of legs (this lab: 8) so RAM and loop cost stay bounded.
- Refuse duplicate `to` so a “max 30% to X” policy cannot be bypassed with two rows.

## Integer math

- Use **128-bit** (or `bigint` off-chain) for `amount * bps` before `/ 10000`.
- Last-leg remainder is mandatory if you floor early legs; otherwise units vanish.
- Dust visualizer: [px-token-dust-truncation-visualizer](https://github.com/pixel-journey/px-token-dust-truncation-visualizer).

## Notification hygiene

- Gate on `get_first_receiver()` = your token contract.
- Ignore `from == get_self()`.
- Check **symbol code and precision**, not only a letter string.
- Do not let the transfer **memo** choose destinations.

## Related patterns

| Pattern | Repo |
| --- | --- |
| Vesting after split | [px-treasury-linear-cliff-vesting](https://github.com/pixel-journey/px-treasury-linear-cliff-vesting) |
| Tax on transfer | [px-token-transfer-tax-burn-treasury](https://github.com/pixel-journey/px-token-transfer-tax-burn-treasury) |
| Pause admin mistakes | [px-token-pausable-emergency-guard](https://github.com/pixel-journey/px-token-pausable-emergency-guard) |
| Shared bps helpers | [px-invariant-kit](https://github.com/pixel-journey/px-invariant-kit) |

## Common student mistakes

1. Teaching `allocate(100n)` as dust (floors are exact).
2. Allowing 0 bps “placeholder” legs.
3. Using `uint64` multiply without wide intermediate.
4. Treating lab symbol `WAX` as proof of the system token contract account.
