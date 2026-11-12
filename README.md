# Split only when the basis points add to 10000

> **Trust:** private educational lab (Tier B)  
> **Domain:** treasury fee splitter  
> **Sources:** [SOURCES.md](SOURCES.md)  
> **Vault:** [px-contract-examples-vault](https://github.com/pixel-journey/px-contract-examples-vault)

**One-sentence goal:** Teach a fee-split config that is refused unless the legs sum to **exactly 10000** basis points, and an allocation that still sums to the input after floors.

**Real code:** `npm test` (unit + **sequential composition**). **Not** a treasury contract, **not** an `on_notify` handler, **not** wasm.

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
assertConfig + allocate + acceptTransfer   [tested]
    → on_notify / token precision / admin setconfig   [not in this repo]
```

## Related

- [px-treasury-linear-cliff-vesting](https://github.com/pixel-journey/px-treasury-linear-cliff-vesting)
- [px-token-dust-truncation-visualizer](https://github.com/pixel-journey/px-token-dust-truncation-visualizer)

## Run

```bash
npm test
```

MIT — Pixel Journey
