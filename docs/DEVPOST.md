# Clocked: Devpost write-up (draft)

Paste each section into Devpost. The headings replace the default template on purpose.

**Tagline (under 200 characters):**
Describe your work week, enter what you were paid, and see what California wage law says your boss owes you, line by line, with the statute behind every dollar.

---

## Rosa's week

Rosa washes dishes at a restaurant in Los Angeles. She works Monday to Saturday, 8am to 8pm, and eats standing up because there is no break. On Friday her manager hands her $700 in cash. It is the same every week, so she assumes that is just what the job pays.

Under California law that week was worth $1,842. The minimum wage in Los Angeles is $18.42 an hour. Anything past 8 hours in a day is overtime at 1.5 times the rate. Every day without a meal break or rest breaks adds an extra hour of pay. Rosa was paid $9.72 an hour.

Rosa is a composite, but her week is common. The Economic Policy Institute estimates that minimum wage violations alone take about $15 billion a year from workers, more than the value of all robberies, burglaries, larcenies and car thefts in the US combined ($12.7 billion, FBI, 2015). About 17% of low-wage workers in the ten largest states are paid below the minimum wage.

Most of these workers never file a claim, and the reason is not that the law is unclear. They have no way to turn "I worked a lot and got $700" into a number, a list of violations and a document they can hand to someone.

## What Clocked does

1. Pick where you work. Five options cover the state minimum and four cities with higher local minimums (Los Angeles, San Francisco, San José, Oakland).
2. Describe your week in your own words, in English or Spanish: "Mon–Sat, 8am to 8pm, no break" or "lunes a sábado de 8 a 8, sin descanso". The shifts appear on a calendar, where you can fix any of them by tapping.
3. Enter what you were paid, either a flat amount or an hourly rate.
4. Clocked shows the gap for the week, what the law required line by line, each violation in plain language, and what the same gap adds up to over time. California allows claims going back three years.
5. It produces a printable claim summary to bring to a free Labor Commissioner wage claim or a legal aid clinic, with the steps to file and a reminder that retaliation is illegal and that the protections apply regardless of immigration status.

For Rosa: $1,142 underpaid in one week, $29,692 over six months.

## AI reads, the law decides

We did not want an AI deciding what someone is owed. The AI's only job is reading, and all of the math is ordinary code.

| Layer | What it does | AI? |
|---|---|---|
| Schedule reader | Turns "Mon–Sat, 8am to 8pm, no break" into shifts. A built-in English/Spanish parser handles most descriptions instantly and offline. Only text it can't read goes to Claude. | Optional |
| Confirmation | The worker sees the shifts on a calendar and corrects them before anything is calculated. | No |
| Wage engine | Applies minimum wage, daily and weekly overtime, double time, the 7th-day rule, and meal and rest premiums. Every line carries its citation. | No |
| Claim summary | Built from the engine's output. No generated legal text. | No |

Anything the model returns is validated again (days 0 to 6, times in HH:MM, breaks capped) before the engine sees it. With no API key the app still works from start to finish, and the demo does not depend on a network call.

## Rules we encode

| Rule | Citation |
|---|---|
| State minimum wage, $16.90/h in 2026 | Cal. Lab. Code §1182.12 |
| Los Angeles $18.42 (July 2026), San Francisco $19.61 (July 2026), San José $18.45, Oakland $17.34 | L.A. Mun. Code §187.02; S.F. Admin. Code ch. 12R; San José Mun. Code ch. 4.100; Oakland Mun. Code ch. 5.92 |
| 1.5× after 8 hours a day or 40 a week; 2× after 12 hours a day; 7th consecutive day | Cal. Lab. Code §510 |
| A flat weekly amount is treated as pay for 40 regular hours | Cal. Lab. Code §515(d) |
| Meal period required on days over 5 hours | Cal. Lab. Code §512 |
| One extra hour of pay per day for a missed meal or rest break | Cal. Lab. Code §226.7 |
| Liquidated damages when pay falls below minimum wage | Cal. Lab. Code §1194.2 |
| Three-year lookback | Cal. Code Civ. Proc. §338(a) |
| No retaliation; protections apply regardless of immigration status | Cal. Lab. Code §§98.6, 1171.5 |

The engine and schedule reader have 35 automated tests, including Rosa's week checked to the cent, weekly overtime conversion, the 7th-day rule, overnight shifts, two shifts on one day, a split shift typed in plain words, and a fairly paid week that must come out at $0.

## What is synthetic

| Item | Status |
|---|---|
| Rosa and her week | Composite example built from common wage-theft patterns. Not a real person. |
| Minimum wage rates and Labor Code rules | Real, verified September 2026 against official and practitioner sources. |
| Wage theft statistics | Real: Economic Policy Institute and FBI Uniform Crime Reports. |
| The Labor Commissioner link and legal aid link | Real public services. Clocked does not file anything itself. |

## Built with

| Tool | Used for |
|---|---|
| Next.js 16, React 19, TypeScript | App framework |
| Tailwind CSS 4 | Styling. Design tokens adapted from a Stripe-inspired DESIGN.md in the open-source awesome-design-md collection |
| Motion | Animations (calendar fill, number count-up) |
| Claude API (Anthropic) | Optional reader for messy schedule descriptions, with structured output |
| Zod | Validating the AI's output |
| Vitest | Wage engine and parser tests |
| lucide-react, Inter (Fontsource) | Icons and typeface |
| Playwright | Screenshot-based checks of every screen during development |
| AI coding assistant | Used during development for scaffolding and code; all rules were checked against the cited sources |

## Engineering log

- **Flat cash pay.** The obvious approach divides $700 by 72 hours and compares that to minimum wage, but it understates what is owed because it ignores overtime. California treats a fixed weekly amount as pay for 40 regular hours (§515(d)), so the engine takes the higher of that rate and the local minimum and builds overtime on top of it.
- **Weekly overtime.** Daily and weekly overtime overlap. A 12-hour Saturday after five 12-hour days is not 4 hours of overtime; 8 more regular hours would push the week past 40, so all 12 are overtime. The engine walks the week in order and converts regular minutes past 40 hours.
- **"8 to 8".** Spanish descriptions rarely say am or pm. The parser reads an end time at or before the start as the evening, which handles "de 8 a 8" and "9-5:30" without asking.
- **The AI as a fallback.** Sending every description to a model would add seconds of waiting and a failure point to the most important moment of the demo. The local parser runs first, and the model only sees text the parser can't read.
- **Accurate city language.** "The minimum wage in City of Los Angeles" read badly, and the correct legal name ("City of Los Angeles") matters on the claim summary. Each city now has a short name for sentences and a full name for documents.

## What's next

- Rules for more states. The rules live in one data file, so adding a state is data entry plus tests.
- Tips, split shifts, and reporting-time pay.
- A reviewed version with a worker center or legal aid clinic, checked against real cases before anyone relies on it.
- Filling the Labor Commissioner's own claim form from the summary.

Clocked provides legal information, not legal advice.
