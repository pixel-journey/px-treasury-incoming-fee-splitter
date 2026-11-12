/**
 * Composition: sequential fee intakes accumulate per leg.
 * Sum of leg balances always equals total accepted quantity.
 * Wrong symbol / zero amount leave balances unchanged.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { acceptTransfer, type SplitConfig } from "./split.ts";

const fair: SplitConfig = {
  symbol: "WAX",
  legs: [
    { to: "treasury.a", bps: 7000 },
    { to: "treasury.b", bps: 2000 },
    { to: "treasury.c", bps: 1000 },
  ],
};

type Desk = {
  config: SplitConfig;
  balances: Map<string, bigint>;
  totalIn: bigint;
};

function openDesk(config: SplitConfig): Desk {
  const balances = new Map<string, bigint>();
  for (const leg of config.legs) balances.set(leg.to, 0n);
  return { config, balances, totalIn: 0n };
}

function intake(desk: Desk, symbol: string, amount: bigint): void {
  const rows = acceptTransfer(symbol, amount, desk.config);
  for (const row of rows) {
    desk.balances.set(row.to, (desk.balances.get(row.to) ?? 0n) + row.amount);
  }
  desk.totalIn += amount;
}

function sumBalances(desk: Desk): bigint {
  let s = 0n;
  for (const v of desk.balances.values()) s += v;
  return s;
}

describe("composition: sequential fee desk", () => {
  it("several intakes conserve total into leg balances", () => {
    const desk = openDesk(fair);
    intake(desk, "WAX", 10_000n);
    intake(desk, "WAX", 100n);
    intake(desk, "WAX", 1n);
    assert.equal(sumBalances(desk), desk.totalIn);
    assert.equal(desk.totalIn, 10_101n);
    assert.equal(desk.balances.get("treasury.a"), 7_000n + 70n + 0n);
    assert.equal(desk.balances.get("treasury.b"), 2_000n + 20n + 0n);
    // last leg absorbs floors: 1000 + 10 + 1
    assert.equal(desk.balances.get("treasury.c"), 1_000n + 10n + 1n);
  });

  it("wrong symbol refuses and leaves balances untouched", () => {
    const desk = openDesk(fair);
    intake(desk, "WAX", 10_000n);
    const snapshot = new Map(desk.balances);
    assert.throws(() => intake(desk, "PXJ", 500n), /whitelist/);
    assert.equal(desk.totalIn, 10_000n);
    assert.deepEqual([...desk.balances.entries()], [...snapshot.entries()]);
  });

  it("zero amount refuses without mutating the desk", () => {
    const desk = openDesk(fair);
    assert.throws(() => intake(desk, "WAX", 0n), /positive/);
    assert.equal(desk.totalIn, 0n);
    assert.equal(sumBalances(desk), 0n);
  });

  it("single-leg config routes everything to one account across intakes", () => {
    const one: SplitConfig = {
      symbol: "WAX",
      legs: [{ to: "treasury.a", bps: 10000 }],
    };
    const desk = openDesk(one);
    intake(desk, "WAX", 42n);
    intake(desk, "WAX", 8n);
    assert.equal(desk.balances.get("treasury.a"), 50n);
    assert.equal(sumBalances(desk), 50n);
  });
});
