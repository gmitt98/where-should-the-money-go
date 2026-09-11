# Where should the money go?

A single-page tool for one question a homebuyer faces at the closing table:
every dollar can go into the down payment, into buying down the rate, or stay
invested. Which, and for how long is that still true?

Open `index.html` in a browser. There is no build step and no server; it also
works as a GitHub Pages site as-is.

## What it does

1. **Your loan.** Price, down payment, rate, term, what you expect to earn on
   invested money, and the tax value of mortgage interest.
2. **Put more down, or less?** Compares any other down payment against your
   baseline: wealth difference over time, the investment return at which the
   choice flips, and where every dollar of the gap came from.
3. **Buy down the rate?** Discount points, or a lender credit if you enter a
   negative number. Shows the payback a lender would quote, the payback once
   the cash is charged for the growth it gave up, and the same breakeven and
   decomposition.
4. **What if rates move?** A step-function rate path with presets or your own
   waypoints, a refinance trigger, and each loan refinancing on its own
   schedule. The chart marks each refinance; a second chart shows the note
   rate of every option against the market.

## How the comparison is made fair

Every option is given the same cash at closing and the same monthly budget,
set to the most expensive option's payment. Whatever an option does not spend
at closing is invested. Whatever it does not spend each month is invested too,
along with the tax benefit on that month's interest. Wealth at any point is
the brokerage account minus the loan balance. The house is the same house in
every option, so its value, appreciation, taxes and insurance cancel and never
appear.

That is why there is no "how much cash do you have" input. A point costs a
percentage of the loan and saves a percentage of the loan, so loan size
cancels. A dollar of down payment retires a dollar of debt at the note rate
regardless of the house. Cash on hand decides which options you can afford,
not which one is right. Dollar figures scale exactly with the loan.

## Assumptions worth knowing

- Capital gains are charged on the growth of the brokerage account, treating
  it as an account that is in gain. Set the rate to zero for a tax-advantaged
  account.
- The tax benefit per dollar of interest is held constant. In reality it falls
  as interest declines, which makes the model mildly generous to buydowns.
- Discount points on a purchase are usually deductible in the year paid if
  you itemize. The model does not credit that, which makes it mildly harsh on
  buydowns.
- Refinancing keeps the remaining term rather than resetting to thirty years,
  so the comparison is not muddied by a term extension. The refinance cost is
  paid from the brokerage account.
- Points and down payments are guaranteed returns. Investments are not. The
  tool compares expected values and is blind to risk, so over long horizons
  it leans toward the market by construction.

## Checking the math

`node test.js` runs the engine against reference figures that were validated
separately by a brute-force monthly simulation and by closed-form formulas,
including a scale-invariance check and a refinance case where a deep buydown
survives a rate drop that refinances the baseline.

## Dependencies

Chart.js from cdnjs and IBM Plex Sans from Google Fonts, both loaded by URL.
The page degrades to system fonts if the font fails to load.
