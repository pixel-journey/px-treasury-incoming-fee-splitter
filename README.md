# Fee split that must sum to 10000 bps

> **Domain:** treasury fee splitter  
> **Sources:** [SOURCES.md](SOURCES.md)  
> **Catalog:** [px-contract-examples-vault](https://github.com/pixel-journey/px-contract-examples-vault)

**Goal:** A fee-split configuration is refused unless the legs sum to **exactly 10000** basis points. Allocation still sums to the input after per-leg floors (remainder on the last leg).

**Code under test:** `npm test` (unit + sequential composition).

**Production mirror (C++ → wasm):** [wax-contract-compiler `pxsplit`](https://github.com/pixel-journey/wax-contract-compiler/tree/main/contracts/pxsplit) — [run 27](https://github.com/pixel-journey/wax-contract-compiler/actions/runs/43212751217). WASM SHA256 `a76fc2f8a93ff5e92f907ca04016df2a2c11eae049b62a1463236e217c345dc9`. Audit 0 errors / 1 warning. The mirror validates config and previews allocation; it does **not** transfer tokens and is **not deployed**.

**Network docs:** [docs.wax.io](https://docs.wax.io/). **Token shape:** [eosio.token](https://github.com/eosio/eosio.contracts). **Shared bps helper:** [px-invariant-kit](https://github.com/pixel-journey/px-invariant-kit).

## Learning materials

| Doc | Role |
| --- | --- |
| [EDUCATION.md](EDUCATION.md) | Beginner → masterclass |
| [WORKED-EXAMPLES.md](WORKED-EXAMPLES.md) | Exact splits, dust-to-last-leg, sequential desk |
| [TIPS.md](TIPS.md) | Config design, 128-bit multiply, notify hygiene |
| [SECURITY.md](SECURITY.md) | Config and allocation attacks |
| [SOURCES.md](SOURCES.md) | Official docs + production mirror |

## Composition

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

## Layered path

```
assertConfig + allocate + acceptTransfer   [tested TS]
setconfig + preview                        [C++ mirror; no token move]
    → on_notify / token precision          [not shipped]
```

## Related

- [px-treasury-linear-cliff-vesting](https://github.com/pixel-journey/px-treasury-linear-cliff-vesting)
- [px-token-dust-truncation-visualizer](https://github.com/pixel-journey/px-token-dust-truncation-visualizer)

```bash
npm test
```

MIT — Pixel Journey
