// Run: node test.js   — checks the engine against independently validated figures.
const fs = require("fs");
let Engine;
try { Engine = require("./engine.js"); }
catch (e) {
  // fall back to extracting the inlined engine from index.html
  const html = fs.readFileSync("index.html", "utf8");
  const src = html.split("<!-- ENGINE-START -->")[1].split("<!-- ENGINE-END -->")[0]
    .replace(/<\/?script[^>]*>/g, "");
  Engine = eval(src + ";Engine");
}
const near = (a, b, tol, msg) => {
  const ok = Math.abs(a - b) <= tol;
  console.log((ok ? "  ok   " : "  FAIL ") + msg + `  (got ${a}, want ${b})`);
  if (!ok) process.exitCode = 1;
};

// Reference case, validated earlier by brute force and closed form:
// $750k house, 20% down, 6.5% base, 2 points -> 6.0%, 8% return, 0.4% drag,
// 20% cap gains, 25% tax benefit. Gap at 10 years = $5,833.03 on a $600k loan.
const price = 750000, d = 0.20, r0 = 0.065, term = 360;
const shared = { termMonths: term, invReturn: 0.08, drag: 0.004, capGains: 0.20,
  taxBenefit: 0.25, refiOn: false, refiCost: 0, refiTrigger: 0, ratePath: () => r0 };
const loan = price * (1 - d);
const base = { loan, rate: r0, upfront: price * d };
const pts  = { loan, rate: 0.060, upfront: price * d + 0.02 * loan };
shared.budget = Engine.pmt(r0 / 12, term, loan);
const rb = Engine.simulate(base, shared), rp = Engine.simulate(pts, shared);
const dd = Engine.delta(rp, rb);
near(dd[120], 5833.03, 0.5, "2 points, 10y gap");
near(dd[360], 67091, 1.5, "2 points, 30y gap");
near(dd[24], -8868, 1.5, "2 points, 2y gap");
near(Engine.crossover(dd).month, 85, 0, "true crossover month");

// Down payment: breakeven return at 2y should be ~6.42%, at 30y ~5.66%
const more = { loan: price * (1 - 0.30), rate: r0, upfront: price * 0.30 };
const mk = (rr) => { const s = { ...shared, invReturn: rr }; return [Engine.simulate(more, s), Engine.simulate(base, s)]; };
near(Engine.breakevenReturn(mk, 24).rate, 0.0642, 0.0005, "more-down breakeven return, 2y");
near(Engine.breakevenReturn(mk, 360).rate, 0.0566, 0.0005, "more-down breakeven return, 30y");

// Scale invariance: gap per $1 of loan is independent of loan size
const big = { loan: 1500000, rate: r0, upfront: 0 }, bigp = { loan: 1500000, rate: 0.06, upfront: 0.02 * 1500000 };
const sh2 = { ...shared, budget: Engine.pmt(r0 / 12, term, 1500000) };
near(Engine.delta(Engine.simulate(bigp, sh2), Engine.simulate(big, sh2))[120] / 1500000, dd[120] / loan, 1e-12, "scale invariance");

// Refinance: rates fall 150bp at year 2 with a 67bp trigger. Baseline refis
// at month 24; the buydown (6.0%) also refis since 5.0% < 6.0%-0.67%.
const shR = { ...shared, refiOn: true, refiCost: 0.02, refiTrigger: 0.02 * 12 / 36,
  ratePath: Engine.makeRatePath(r0, [{ year: 2, rate: 0.05 }]) };
const rbR = Engine.simulate(base, shR), rpR = Engine.simulate(pts, shR);
near(rbR.refis[0].month, 24, 0, "baseline refinances at month 24");
near(rpR.refis[0].month, 24, 0, "buydown refinances at month 24");
near(rbR.noteRate[30], 0.05, 1e-12, "note rate after refi");
// A 4-point buydown at 5.5% does NOT refi: 5.0% is not below 5.5%-0.67%
const deep = { loan, rate: 0.055, upfront: price * d + 0.04 * loan };
near(Engine.simulate(deep, shR).refis.length, 0, 0, "deep buydown survives the rate drop");
console.log(process.exitCode ? "\nFAILURES" : "\nall checks passed");
