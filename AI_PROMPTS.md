# AI prompts

Non-negotiables:

- All legs sum to **10000** bps or the split is refused.
- Earlier legs **floor**. The **last** leg gets the remainder.
- Order is policy. Do not call the last leg "fair" without defining the policy.
- **PXJ precision is always 8.** Port the rule, not the symbol.
- No wasm, no live notify, no wallet.

Prompt seeds:

1. Split 100 on legs 7000/2000/1000 — who gets the last unit?
2. Refuse legs that sum to 9999 without inventing a fourth leg.
3. Port the same bps to precision 4 without changing the remainder rule.
