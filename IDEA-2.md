# Before You Sign: check your layoff papers before you sign away your rights

> You just got laid off. HR hands you a 12-page severance agreement and a deadline.
> Upload it. Before You Sign shows what you're giving up, what the company got wrong,
> and how much money you're owed. It then writes your reply email to HR.

**Track:** Access to Justice (workers' rights) + Legal Automation.
**One sentence a judge would repeat:** "The one that checks your layoff papers before you sign, with the money counter that keeps going up."

## Why it wows *this* panel
- The judges work at Microsoft, Amazon, NVIDIA and other tech companies, and 2025–26 brought large layoffs. Most of them know someone who was handed this agreement.
- Most people sign within days, without a lawyer, because a lawyer costs $400+/hr.
- The agreement is **legally checkable** because federal and state law spell out exactly what it must contain.

## The video WOW (4 beats, all fully scripted, nothing left to chance)
1. **Heat map:** the 12-page PDF scrolls by. Clauses light up: 🟢 fine · 🟡 unusual · 🔴 breaks the law.
2. **The flip:** 🔴 *"You're 52. This is a group layoff, so the law says you get 45 days plus a list of the ages of everyone in the layoff group. They gave you 14 days and no list. **Your age-discrimination waiver may be invalid.**"* (OWBPA, 29 U.S.C. §626(f))
3. **Live ticking counter:** *"Your final paycheck is 6 days late. The penalty is a full day's wage for each day late, up to 30 days."* The counter climbs on screen: **$2,340 → $2,730 → ...** (Cal. Lab. Code §203)
4. **One click:** a polite, cited email to HR asks for the fixes, the missing age list, and the penalty pay. There's also a "What you're giving up" card in plain English.

## Rules engine v1 (deterministic, cited)
| Check | Rule | Source |
|---|---|---|
| Time to decide | 21 days (individual) / **45 days (group layoff)** + 7 days to revoke if age 40+ | OWBPA, 29 U.S.C. §626(f) |
| Age disclosure | Group layoff must list job titles + ages of who was/wasn't picked | OWBPA §626(f)(1)(H) |
| Silence clause | Must include "Nothing in this agreement prevents you from discussing... unlawful acts in the workplace..." or the clause is unenforceable | CA Gov. Code §12964.5 (SB 331) |
| Lawyer notice | Must tell you that you can consult a lawyer + give ≥5 business days | CA Gov. Code §12964.5 |
| Final pay | Due immediately at layoff; late = daily wage × days late (max 30) | CA Lab. Code §§201, 203 |
| Wages as hostage | Can't make you sign a release to get wages you're already owed | CA Lab. Code §206.5 |
| Notice | 60 days' notice (or pay) for mass layoffs | WARN / Cal-WARN |

Design: **AI reads, law decides** (same as Receipts). The LLM classifies clauses, the user confirms the facts (age, layoff date, pay), and a tested TypeScript engine produces every verdict and dollar amount, with a citation on each.

## Hostile Q&A
- **"Isn't this for privileged tech workers?"** No. These laws cover warehouse, retail and federal workers too, and those workers are the least likely to have a lawyer.
- **"Why not ChatGPT?"** A chatbot can't compute your penalty from dates, and it doesn't know which disclosure is missing. Ours checks both against the law.
- **"Legal advice?"** It's information plus a draft email. You decide, and a "talk to a lawyer" button is built in.

## Build (4 days)
Rules + tests → PDF upload and clause classifier → heat-map viewer + ticking counter → email/letter generator → video.
Demo data: one synthetic agreement written to trigger every rule. Say so in the write-up.

## Sources
- SB 331 / Gov. Code §12964.5: https://natlawreview.com/article/california-s-sb-331-extends-sweeping-changes-to-workplace-settlement-and-separation
- EEOC on severance waivers (OWBPA): https://www.eeoc.gov/laws/guidance/qa-understanding-waivers-discrimination-claims-employee-severance-agreements
- Cal. Lab. Code §203: https://codes.findlaw.com/ca/labor-code/lab-sect-203/
