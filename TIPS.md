# Tips — incoming fee splitter

## Config design

- Always require **Σ bps = 10000**. Never "keep" a missing remainder in the contract without an explicit leg.  
- Put the **dust-favored** destination **last**, and document that in the setconfig / msig description.  
- Cap legs (this lab: 8) for RAM and loop cost.  
- Refuse duplicate `to` so a "max 30% to X" policy cannot be bypassed with two rows.  
- Refuse 0 bps placeholder legs.

## Integer math

- Use **128-bit** (or `bigint` off-chain) for `amount * bps` before `/ 10000`.  
- Last-leg remainder is mandatory if you floor early legs.  
- Dust neighbor: `px-token-dust-truncation-visualizer` (private; not this public course).

## Notification hygiene (production)

- Gate on `get_first_receiver()` = intended token contract.  
- Ignore `from == get_self()`.  
- Check symbol **and** precision.  
- Do not let transfer **memo** choose destinations.

## Common mistakes

1. Teaching `allocate(100n)` as dust (floors are exact at 70/20/10).  
2. Allowing 0 bps "placeholder" legs.  
3. Using uint64 multiply without wide intermediate.  
4. Treating lab symbol `WAX` as proof of the system token contract account.  
5. Confusing `allocate(0)` (ok) with `acceptTransfer(..., 0)` (refused).

## Nice-to-have extensions (not in this repo)

- Per-token multi-config.  
- Pause that still allows msig recovery ([pausable guard](https://github.com/pixel-journey/px-token-pausable-emergency-guard)).  
- Vesting after split ([linear cliff](https://github.com/pixel-journey/px-treasury-linear-cliff-vesting)).  
- Live on_notify integration tests.

## Related

[vesting](https://github.com/pixel-journey/px-treasury-linear-cliff-vesting) · [transfer-tax](https://github.com/pixel-journey/px-token-transfer-tax-burn-treasury) · [invariant-kit bps](https://github.com/pixel-journey/px-invariant-kit)
