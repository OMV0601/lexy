# Clocked: the full idea

> **See exactly what your boss owes you.**
> A worker describes their week in plain words, enters what they were paid, and Clocked applies California wage law to show, line by line and with the law cited on every line, how much they are owed. It ends with a summary they can take to a free wage claim. English and Spanish.

Built for **LexHack 2026** · Track: **Access to Justice & Civic Tech** (it also fits AI Safety & Governance, because of how the AI is limited).

---

## 1. The one-sentence version

**Clocked is a wage-theft checker: tell it your hours and your pay, and it shows how much your boss owes you under the law.**

The sentence a judge would repeat afterwards: *"The one where you type your week and a red number shows how much your boss stole."*

---

## 2. The problem

### Wage theft is the biggest theft in America

- Employers take about **$15 billion a year** from workers through **minimum wage violations alone** (Economic Policy Institute).
- That is **more than the value of all robberies, burglaries, larcenies and car thefts combined**, which was about $12.7 billion (FBI, 2015).
- About **17% of low-wage workers** in the ten largest states are paid **below minimum wage**.
- A year-round worker who is cheated loses about **$3,300 a year** on average.

Those figures cover minimum wage violations only. Unpaid overtime, missed breaks and off-the-clock work add more.

### Why workers don't claim it

The law is clear. What's missing is a way for a worker to get from their situation to a claim:

1. **They don't know it's illegal.** "$700 cash every week" feels like just what the job pays.
2. **They can't do the math.** Minimum wage, daily overtime, weekly overtime, double time, the 7th-day rule and break premiums all interact. Most people can't turn "I worked a lot" into a dollar amount.
3. **Lawyers are out of reach.** Low-income Americans get no help, or not enough, for **92% of their civil legal problems** (Legal Services Corporation, 2022).
4. **They're afraid.** Many are immigrants who fear retaliation or questions about their status.
5. **Language.** Many of the most affected workers are more comfortable in Spanish.

### The person: Rosa

Rosa washes dishes at a restaurant in **Los Angeles**. She works **Monday to Saturday, 8am to 8pm**, with **no break**. Every Friday she gets **$700 in cash**. She thinks that's just the job.

Under California law, that week was worth **$1,842**. Rosa was underpaid **$1,142.00**, in one week.

*(Rosa is a composite example, and we say so in the submission. Her pattern is common.)*

---

## 3. The solution

### What the user does (about 60 seconds)

| Step | Screen | What happens |
|---|---|---|
| 1 | **Where** | Pick a city. Each card shows its minimum wage: LA $18.42, SF $19.61, San José $18.45, Oakland $17.34, rest of California $16.90. |
| 2 | **Your week** | Type the week in plain words, e.g. *"Mon–Sat, 8am to 8pm, no break"* or *"lunes a sábado de 8 a 8, sin descanso."* Shift blocks fill a calendar, and you can fix any shift by tapping it. Answer two quick questions about meal and rest breaks. |
| 3 | **Your pay** | Choose "flat amount" (e.g. $700 cash) or "by the hour," then enter the amount. |
| 4 | **Result** | A red number counts up to the amount you were underpaid. Below it: every line of pay the law required, each with its citation; what went wrong, in plain language; and a slider showing what the gap adds up to over time (up to 3 years). |
| 5 | **Claim summary** | A clean page to print or save as PDF, with the schedule, violations, amounts and citations, next steps for a free Labor Commissioner claim, and your protections. |

### Rosa's result

| Line | Math | Amount | Law |
|---|---|---|---|
| Regular hours | 40 h × $18.42 | $736.80 | L.A. Mun. Code §187.02 |
| Overtime (1.5×) | 32 h × $27.63 | $884.16 | Cal. Lab. Code §510 |
| Missed meal breaks | 6 days × $18.42 | $110.52 | Cal. Lab. Code §226.7 |
| Missed rest breaks | 6 days × $18.42 | $110.52 | Cal. Lab. Code §226.7 |
| **Total the law required** | | **$1,842.00** | |
| What she was paid | | − $700.00 | |
| **Owed to Rosa** | | **$1,142.00** | |

- She actually earned **$9.72 an hour**. The legal minimum in LA is **$18.42**.
- Over 6 months that's **$29,692**. Over 1 year, **$59,384**.
- A court can add up to **$626.24** more for this week, because her pay fell below minimum wage (liquidated damages, §1194.2).

### What went wrong (as the app says it)

1. You earned $9.72 an hour. The legal minimum here is $18.42.
2. 32 of your hours were overtime. The law requires $27.63 an hour for them.
3. On 6 days you worked over 5 hours without a 30-minute meal break. Each one earns an extra hour of pay.
4. On 6 days you didn't get rest breaks. Each one earns an extra hour of pay.

---

## 4. How it works: "AI reads. The law decides."

This is the core design idea and the answer to "why not just ask ChatGPT?"

```
 "Mon–Sat, 8am to 8pm, no break"
          │
          ▼
 ┌───────────────────────┐
 │ 1. SCHEDULE READER    │  Built-in English + Spanish parser (instant, offline)
 │                       │  → falls back to Claude only for messy text
 └───────────────────────┘
          │  shifts
          ▼
 ┌───────────────────────┐
 │ 2. WORKER CONFIRMS    │  Shifts shown on a calendar; tap to fix
 └───────────────────────┘
          │  confirmed facts
          ▼
 ┌───────────────────────┐
 │ 3. WAGE ENGINE        │  Plain code, no AI. Rules written from the Labor Code.
 │                       │  31 automated tests. Every line carries a citation.
 └───────────────────────┘
          │
          ▼
 ┌───────────────────────┐
 │ 4. RESULT + CLAIM     │  Built only from the engine's output
 └───────────────────────┘
```

**Why this matters:**
- **The AI never decides money.** Its only job is turning words into shifts.
- **The worker checks the facts** before any law is applied.
- **Every dollar can be checked.** Each line links to the actual law, so a clerk, lawyer or judge can verify it.
- **It still works without AI.** If the AI service is down or there's no API key, the built-in reader handles normal descriptions and the whole app still works.
- **The AI's output gets double-checked.** Whatever the model returns is validated (valid days, valid times, sane break lengths) before the engine sees it.

---

## 5. The law Clocked encodes

All rates verified **September 2026**.

### Minimum wages

| Where | Rate | Effective | Source |
|---|---|---|---|
| California (statewide) | $16.90 | Jan 1, 2026 | Cal. Lab. Code §1182.12 |
| City of Los Angeles | $18.42 | Jul 1, 2026 | L.A. Mun. Code §187.02 |
| San Francisco | $19.61 | Jul 1, 2026 | S.F. Admin. Code ch. 12R |
| San José | $18.45 | Jan 1, 2026 | San José Mun. Code ch. 4.100 |
| Oakland | $17.34 | Jan 1, 2026 | Oakland Mun. Code ch. 5.92 |

### Rules

| Rule | What it means | Source |
|---|---|---|
| Daily overtime | Hours 9–12 in a day are paid at 1.5× | Cal. Lab. Code §510 |
| Double time | Hours past 12 in a day are paid at 2× | Cal. Lab. Code §510 |
| Weekly overtime | Regular hours past 40 in a week become 1.5× | Cal. Lab. Code §510 |
| 7th day | Working all 7 days: the first 8 hours on day 7 are 1.5×, hours after that are 2× | Cal. Lab. Code §510 |
| Flat weekly pay | A fixed weekly amount only covers 40 regular hours | Cal. Lab. Code §515(d) |
| Meal break | Required on days over 5 hours | Cal. Lab. Code §512 |
| Break premiums | 1 extra hour of pay per day for a missed meal break, and 1 for missed rest breaks | Cal. Lab. Code §226.7 |
| Liquidated damages | When pay falls below minimum wage, a court can add an equal amount | Cal. Lab. Code §1194.2 |
| Lookback | Unpaid wages can be claimed going back 3 years | Cal. Code Civ. Proc. §338(a) |
| No retaliation | Your employer can't punish you for claiming wages | Cal. Lab. Code §98.6 |
| Immigration status | Wage protections apply to all workers regardless of status | Cal. Lab. Code §1171.5 |

### Tricky cases the engine handles

- **Flat cash pay.** Dividing $700 by 72 hours understates what's owed because it ignores overtime. The engine treats flat pay as covering 40 regular hours, uses the higher of that rate and minimum wage, and builds overtime on top.
- **Daily and weekly overtime together.** If Monday–Friday are already 40 regular hours, a 12-hour Saturday is all overtime.
- **Overnight shifts**, e.g. 10pm–6am.
- **Two shifts in one day** are combined before daily overtime is applied.
- **Fair pay.** If the worker was paid correctly, the app says so in green and lists the checks that passed. It doesn't invent a problem.

---

## 6. Why this wins LexHack

### The judging criteria

| Criterion (weight) | How Clocked scores |
|---|---|
| **Real-World Impact & Feasibility (25%)** | Wage theft is a $15B+/year problem, bigger than all property crime. Clocked works today as a website and uses real law and real rates. |
| **Technical Execution (25%)** | A tested rules engine (31 tests), an English/Spanish parser, an AI reader with validated output, printable claim summary, and a polished UI. |
| **User Experience & Design (20%)** | Five simple steps and no legal knowledge needed. Describe your week in your own words, see a calendar, get a number. Works on phones. |
| **Innovation (15%)** | "AI reads, the law decides": the AI is deliberately limited to reading. The number is computed live and every line links to its source. |
| **Presentation (15%)** | Demo mode plays the whole story perfectly on camera. The written submission uses custom sections and tables, and says what's synthetic. |

### Why it stands out from other teams

- Most teams will build **legal chatbots** or **"explain this legal document" translators.** Clocked has **no chatbot**. It produces a **number** and a **document**.
- It's **easy to understand in 5 seconds**: *you worked this, you got paid that, the law says this.*
- It's **emotional without being heavy**: a hardworking person, a clear injustice, and a fix.
- **The video can't glitch.** Demo mode plays the whole story on its own, the same way every time.

---

## 7. The WOW moments (for the video)

1. **Typing turns into a week.** "Mon–Sat, 8am to 8pm, no break" types itself, and six purple shift blocks drop onto the calendar one after another.
2. **The red number.** $1,142.00 counts up on a dark card, and a bar shows $9.72 next to the legal $18.42.
3. **Every line has its law.** Tap a citation chip and the actual statute opens.
4. **The zoom-out.** A slider sweeps from 1 week to 1 year and the number climbs to $59,384.
5. **Spanish.** The whole thing, including typing the week, works in Spanish.

---

## 8. Demo mode

| Link | What it does |
|---|---|
| `/` | Landing page |
| `/check` | The checker, from scratch |
| `/check?demo=rosa` | Jumps straight to Rosa's result |
| `/check?demo=play` | Plays Rosa's whole story by itself (~25 seconds): city, typing, calendar, pay, result, slider sweep, claim |
| `/check?demo=play&lang=es` | The same, in Spanish |

---

## 9. The 3-minute pitch (short version)

1. **Hook (0:00–0:18):** "72 hours. 6 days. $700 cash. Is that legal?"
2. **Problem (0:18–0:32):** "Wage theft takes more from workers than every robbery, burglary and car theft combined. Most workers never claim it, because they can't turn 'I worked a lot' into a number."
3. **Demo (0:32–2:05):** city → describe the week → pay → **$1,142** → cited lines → **$59,384 a year** → claim summary.
4. **Spanish (2:05–2:15):** "And all of it works in Spanish."
5. **How (2:15–2:40):** "AI reads. The law decides. Every dollar comes from the Labor Code, with 31 tests."
6. **Close (2:40–3:00):** "Rosa didn't have a bad job. She had a boss who was taking her wages. Clocked. See what you're owed."

The full timed script is in `docs/VIDEO_SCRIPT.md`.

---

## 10. Hard questions judges might ask

| Question | Answer |
|---|---|
| **"Why not just ask ChatGPT?"** | A chatbot guesses. Clocked computes every number from rules written from the Labor Code, tests them, and cites the law on every line. The AI only reads the worker's words. |
| **"What if the AI reads the schedule wrong?"** | The worker sees the shifts on a calendar and fixes them before anything is calculated. |
| **"Is this legal advice?"** | No. It's legal information and a summary, like a court self-help center gives. The worker decides what to do and can go to legal aid. |
| **"What if the employer paid correctly?"** | Clocked says so in green and lists the checks that passed. It doesn't invent problems. |
| **"Only California?"** | California first, because its rules are the strongest and most complex. The rules live in one data file, so adding a state is data entry plus tests. |
| **"Who would use this?"** | Low-wage workers (restaurants, warehouses, cleaning, construction, farm work), plus worker centers and legal aid clinics that currently do this math by hand. |
| **"How does it make money?"** | It's free for workers. It could be funded by worker centers, legal aid grants and labor agencies. The same engine could be sold to employers as a payroll compliance check, since violations cost them penalties. |
| **"What about tips, split shifts, etc.?"** | Not in the MVP. They're on the roadmap. |

---

## 11. Tech stack

| Part | Tool |
|---|---|
| App | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS 4, Stripe-inspired design tokens (from the open-source awesome-design-md collection) |
| Animation | Motion |
| AI (optional) | Claude API: reads messy schedule text, with structured output |
| Validation | Zod |
| Tests | Vitest (31 tests) |
| Icons / font | lucide-react, Inter |
| Hosting | Vercel (plus the free .xyz domain from the hackathon) |

### Code map

```
src/lib/wage/law.ts         the law as data, with citations
src/lib/wage/engine.ts      the wage engine (no AI)
src/lib/wage/parse.ts       English/Spanish schedule reader
src/app/api/parse-week      optional Claude reader
src/components/checker/     the 5 steps
src/components/landing/     landing page
src/lib/i18n.tsx            English + Spanish text
```

---

## 12. What's real and what's synthetic

| Item | Status |
|---|---|
| Rosa and her week | **Synthetic**, a composite example |
| Minimum wage rates and Labor Code rules | **Real**, verified September 2026 |
| Wage theft statistics | **Real**: Economic Policy Institute, FBI, Legal Services Corporation |
| Labor Commissioner and legal aid links | **Real** public services |
| Filing | Clocked **does not file anything itself**. It prepares the worker. |

---

## 13. Roadmap (after the hackathon)

1. **More states**, starting with those with strong wage laws (Washington, New York, Illinois).
2. **More pay situations:** tips, split shifts, reporting-time pay, final paycheck penalties (Lab. Code §203).
3. **Pilot with a worker center or legal aid clinic**, checked against real cases before anyone relies on it.
4. **Fill the Labor Commissioner's official claim form** directly from the summary.
5. **Photo of a pay stub or timesheet** as another way to enter the week.
6. **More languages:** Chinese, Tagalog, Vietnamese, Korean.

---

## 14. Sources

- Economic Policy Institute, *Wage theft is a bigger problem than other theft*: https://www.epi.org/publication/wage-theft-bigger-problem-theft-protect/
- Economic Policy Institute, *Employers steal billions from workers' paychecks each year*: https://www.epi.org/publication/employers-steal-billions-from-workers-paychecks-each-year/
- Legal Services Corporation, *2022 Justice Gap Report*: https://justicegap.lsc.gov/resource/executive-summary/
- California minimum wage 2026 (DIR): https://www.dir.ca.gov/dlse/minimum_wage.htm
- Los Angeles minimum wage (Office of Wage Standards): https://wagesla.lacity.gov/
- San Francisco Minimum Wage Ordinance: https://www.sf.gov/information--minimum-wage-ordinance
- California Labor Code §510 (overtime): https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=LAB&sectionNum=510
- California Labor Code §226.7 (break premiums): https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=LAB&sectionNum=226.7
- How to file a wage claim (Labor Commissioner): https://www.dir.ca.gov/dlse/howtofilewageclaim.htm

---

*Clocked provides legal information, not legal advice.*
