# px-treasury-incoming-fee-splitter

> **Trust:** private educational lab (Tier B)  
> **Quest:** 086 — incoming fee splitter  
> **Vault:** [px-contract-examples-vault](https://github.com/pixel-journey/px-contract-examples-vault)

**One-sentence goal:** Teach a fee-split config where **basis points must sum to exactly 10000**, allocations use floor math, and the **remainder goes to the last leg** so outputs sum to the input amount.

**Real code:** `npm test` runs TypeScript invariants. **Not** a deployed treasury, **not** wasm, **not** an `on_notify` integration test against live chain.

---

## What is true (executed)

| Rule | Result |
|------|--------|
| Legs 7000 / 2000 / 1000 | config accepted |
| Sum ≠ 10000 | refused |
| Duplicate `to` | refused |
| `allocate(10000n, …)` | 7000 / 2000 / 1000 |
| Floor remainder | last leg absorbs dust so sum is exact |
| Wrong symbol / zero amount | refused on `acceptTransfer` |

```bash
npm test
```

---

## Layout

| Path | Role |
|------|------|
| `invariants/split.ts` | Config + allocate + accept gate |
| `invariants/split.test.ts` | Executed claims |
| `EDUCATION.md` | Why sum-to-10000 and last-leg remainder |
| `SECURITY.md` | Authorization / notify notes for the real contract path |

---

## Related

- Dust floors: `px-token-dust-truncation-visualizer`
- Template: `px-antelope-contract-template`
- Vault index: `px-contract-examples-vault`

## License

MIT — Pixel Journey
