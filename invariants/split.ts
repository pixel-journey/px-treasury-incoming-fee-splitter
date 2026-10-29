/**
 * Incoming fee splitter (educational).
 * Whitelisted symbol + legs whose bps sum to exactly 10000.
 * Real executable rules — not a deployed treasury contract.
 */

export const MAX_BPS = 10_000;
export const MAX_AMOUNT = 4_611_686_018_427_387_903n; // 2^62 - 1
export const MAX_LEGS = 8;

export type Leg = { to: string; bps: number };
export type SplitConfig = { symbol: string; legs: readonly Leg[] };
export type Allocation = { to: string; amount: bigint };

const NAME = /^[a-z1-5.]{1,12}$/;
const SYMBOL = /^[A-Z]{1,7}$/;

export function assertAmount(amount: bigint): bigint {
  if (typeof amount !== "bigint") throw new Error("amount must be bigint");
  if (amount < 0n) throw new Error("amount must not be negative");
  if (amount > MAX_AMOUNT) throw new Error("amount exceeds MAX_AMOUNT");
  return amount;
}

export function assertName(name: string): string {
  if (!NAME.test(name) || name.startsWith(".") || name.endsWith(".")) {
    throw new Error("bad account name");
  }
  return name;
}

/**
 * Validate split config before any transfer is accepted.
 * - 1..MAX_LEGS legs
 * - each bps in 1..10000
 * - sum(bps) === 10000 exactly
 * - unique `to` accounts
 * - symbol is a short uppercase code (educational stand-in for asset symbol)
 */
export function assertConfig(config: SplitConfig): SplitConfig {
  if (!SYMBOL.test(config.symbol)) throw new Error("bad symbol");
  if (!Array.isArray(config.legs) || config.legs.length < 1 || config.legs.length > MAX_LEGS) {
    throw new Error("legs must be 1 to 8");
  }
  let sum = 0;
  const seen = new Set<string>();
  for (const leg of config.legs) {
    assertName(leg.to);
    if (!Number.isInteger(leg.bps) || leg.bps < 1 || leg.bps > MAX_BPS) {
      throw new Error("each bps must be an integer from 1 to 10000");
    }
    if (seen.has(leg.to)) throw new Error("duplicate destination");
    seen.add(leg.to);
    sum += leg.bps;
  }
  if (sum !== MAX_BPS) throw new Error("bps must sum to 10000");
  return config;
}

/**
 * Floor allocation per leg; remainder (from floors) goes to the last leg
 * so the sum of outputs equals `amount` exactly.
 */
export function allocate(amount: bigint, config: SplitConfig): Allocation[] {
  assertAmount(amount);
  assertConfig(config);
  if (amount === 0n) {
    return config.legs.map((leg) => ({ to: leg.to, amount: 0n }));
  }
  const out: Allocation[] = [];
  let allocated = 0n;
  const last = config.legs.length - 1;
  for (let i = 0; i < config.legs.length; i++) {
    const leg = config.legs[i];
    if (i === last) {
      out.push({ to: leg.to, amount: amount - allocated });
    } else {
      const slice = (amount * BigInt(leg.bps)) / 10_000n;
      allocated += slice;
      out.push({ to: leg.to, amount: slice });
    }
  }
  const total = out.reduce((a, x) => a + x.amount, 0n);
  if (total !== amount) throw new Error("internal: allocation sum mismatch");
  return out;
}

/**
 * Educational gate: only the configured symbol is accepted.
 * (In a real contract this pairs with quantity.symbol checks.)
 */
export function acceptTransfer(
  symbol: string,
  amount: bigint,
  config: SplitConfig
): Allocation[] {
  assertConfig(config);
  if (symbol !== config.symbol) throw new Error("symbol not whitelisted");
  if (amount <= 0n) throw new Error("amount must be positive");
  return allocate(amount, config);
}
