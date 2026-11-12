# Split only when the basis points add to 10000

> **Trust:** private educational lab (Tier B)  
> **Domain:** treasury fee splitter  
> **Sources:** [SOURCES.md](SOURCES.md)  
> **Vault:** [px-contract-examples-vault](https://github.com/pixel-journey/px-contract-examples-vault)

**One-sentence goal:** Teach a fee-split config that is refused unless the legs sum to **exactly 10000** basis points, and an allocation that still sums to the input after floors.

**Real code:** `npm test` (unit + **sequential composition**). This repo has **no** wasm.

**Production mirror (C++):** [wax-contract-compiler `pxsplit`](https://github.com/pixel-journey/wax-contract-compiler/tree/main/contracts/pxsplit) — [compile run 27](https://github.com/pixel-journey/wax-contract-compiler/actions/runs/43212751217) (verify conclusion before treating as green). Does **not** transfer tokens. **Not deployed.**

Network docs: [docs.wax.io](https://docs.wax.io/). Token shape reference: [eosio.token](https://github.com/eosio/eosio.contracts). Shared bps helper: [px-invariant-kit](https://github.com/pixel-journey/px-invariant-kit).

## Composition note

`split.composition.test.ts` runs a fee desk: several intakes accumulate per leg, and `sum(leg balances) === total accepted`. Wrong symbol and zero amount leave balances unchanged. Dust (`1n`) still lands on the last leg so conservation holds.

## What is true (executed)

Config symbol `WAX`, legs 7000 / 2000 / 1000.

| Rule | Result |
| --- | --- |
| Sum ≠ 10000 / duplicate `to` / 0 bps leg | refused |
| `allocate(10000n)` | 7000, 2000, 1000 |
| Any allocate | outputs sum to input; last leg gets remainder after floors |
| Wrong symbol / zero amount on accept | refused; desk unchanged |
| Sequential intakes | balances sum to total in |

## Live path, not shipped

```
assertConfig + allocate + acceptTransfer   [tested TS]
setconfig + preview                        [C++ mirror; no token move]
    → on_notify / token precision          [not shipped]
```

## Related

- [px-treasury-linear-cliff-vesting](https://github.com/pixel-journey/px-treasury-linear-cliff-vesting)
- [px-token-dust-truncation-visualizer](https://github.com/pixel-journey/px-token-dust-truncation-visualizer)

## Run

```bash
npm test
```

MIT — Pixel Journey
