# Receipts: a linter for your landlord

> Your landlord kept part of your deposit. Take a photo of the letter they sent explaining why.
> Receipts marks it up in red pen, line by line, against your state's law. Then it tells you the
> exact amount you're owed, writes the demand letter, and fills in the small-claims court form.

**Track:** Access to Justice & Civic Tech (it also fits AI Safety through the "AI reads, law decides" design).
**One sentence a tired judge would repeat:** "The one that red-pens your landlord's deposit letter and fills in the court form."

---

## 1. Why this wins this particular hackathon

| Rubric (weight) | How Receipts scores |
|---|---|
| Impact & Feasibility (25%) | Fewer than half of renters get their full deposit back (Zillow 2024). About half of Brooklyn small-claims cases are deposit disputes. It's a working web app that can be used today. |
| Technical Execution (25%) | AI extraction + a deterministic rules engine with unit tests + court-form PDF filling + an adversarial reviewer. That's real engineering, not a chatbot wrapper. |
| UX & Design (20%) | Three steps (photo → red pen → documents). No legal knowledge needed. No chat box. |
| Innovation (15%) | The red-pen markup of the real letter is a visual no other team will have. Changing the state changes the answer on screen. |
| Presentation (15%) | The climax is a **number** ($1,940 owed) and a **document** (filled SC-100), not AI-written prose. |

**About the judges:** 30 people from tech (engineers, PMs, founders) and no lawyers. Nearly all of them have rented, and many have lost deposit money. They will recognize the problem immediately ("I got screwed on my deposit"), and the mechanism is something they didn't know existed ("wait, the landlord needed receipts, and I could have gotten 2×?"). That combination is what makes a judge wish they'd thought of it.

**How it differs from the likely competition:** most teams will build legal chatbots and "plain-English" translators. A translator tells you what the letter says. Receipts tells you **what the letter got wrong**, and backs every finding with a statute citation.

**The kill-gate (hackathon-ideation skill):** it passes all 10 questions. The user is already holding a letter, there's a dollar amount, there's a statutory deadline, there's a penalty, and there's an external standard to check against (the state statute). The output is a number plus a document, and judges will use it themselves.

---

## 2. The WOW moment (first 30 seconds of the video)

1. Start on a real-looking (synthetic) deduction letter: *"Deposit $2,400. Deductions $2,125. Refund $275."*
2. Take a photo of it. **The Clerk** reads it (live status line on screen).
3. Red-pen strokes appear on the letter one after another:
   - Header circled: **"Sent day 26. Legal deadline: day 21."** (CA Civ. Code §1950.5(g)(1))
   - `Carpet replacement $1,100` struck through: **"Carpet was 9 yrs old (~10-yr useful life). Max charge ≈ $110."**
   - `Repainting $650` struck through: **"No damage described = normal wear & tear."** (§1950.5(b)(2))
   - `Cleaning $300` struck through: **"No receipt. Required when repairs + cleaning exceed $125."** (§1950.5(g)(2), (g)(4))
   - `Lost keys $75` gets a green ✓: **"Fair charge, receipt attached."** (Being fair to the landlord where it's deserved is what makes the tool credible.)
4. The counter runs up: **They owe you $1,940.** Smaller text below: *A judge can add up to $4,800 more if the landlord acted in bad faith (§1950.5(l)).*
5. Click **File**. The official CA **SC-100** small-claims form fills itself in on screen.

**Beat that shows the engine is real:** a state toggle. **Same letter, three states, three answers:**
CA: *late, must return it* · NY: *14-day rule missed, landlord forfeits all of it* · TX: *on time (30 days), but $100 + 3× if bad faith.*
"The number changes because the law changes. We encode the law; we don't guess it."

---

## 3. How it works: "AI reads. Law decides."

```
Photo/PDF ──► THE CLERK ─────────► YOU CONFIRM ──► THE AUDITOR ──────────────► OPPOSING COUNSEL ──► THE PARALEGAL
              (Claude vision        the facts        (deterministic TS rules      (LLM argues the       (templated demand letter,
               → JSON line items)   (editable)        engine, per-state packs,     landlord's side;      filled SC-100 via pdf-lib,
                                                      unit-tested, every verdict   CANNOT change a       "Court Prep" card:
                                                      carries a citation)          verdict)              what they'll say + your answer)
```

**Names to use in the pitch and UI** (per the skill: name the restraint mechanism, and name agents after human job titles):
- **Citation Needed**: the product can't make a legal claim unless the rules engine produced it with a statute ID. Output text comes from templates with slots. A validator rejects any citation that isn't in the rule set.
- **Facts, then law**: the engine only runs on facts the user has confirmed.
- **Opposing Counsel**: an adversarial pass that prepares the tenant for court. It's advisory only.
- **Sample mode works offline**: sample letters are pre-extracted and the engine runs client-side, so the demo works even without an API key.

---

## 4. Rules engine v1 (what the Auditor checks)

| Check | CA | NY | TX | WA | MA | IL (5+ units) |
|---|---|---|---|---|---|---|
| Deadline | 21 days, §1950.5(g)(1) | 14 days, GOL §7-108(1-a)(e) | 30 days, Prop. §92.103 | 30 days, RCW 59.18.280(1) | 30 days, c.186 §15B(4) | 30-day statement / 45-day return, 765 ILCS 710/1 |
| If late | Must return. Landlord can still try to prove damages in court (*Granberry*, 1995) | **Forfeits right to keep any of it** | Presumed bad faith, §92.109(d) | **Liable for full deposit**, RCW 59.18.280(2) | 3× + 5% interest + fees, §15B(7) | 2× if bad faith |
| Proof required | Receipts if repairs+cleaning > $125; photos (AB 2801, 2025) | Itemized basis for each charge | Written description + itemized list | Invoices/estimates attached (since 2023) | Sworn statement + estimates/receipts | Paid receipts or estimates |
| Bad-faith penalty | Up to 2× deposit, §1950.5(l) | n/a | $100 + 3× withheld + fees, §92.109(a) | Up to 2× (intentional) | 3× | 2× + costs + fees |
| Extra checks | Deposit cap = 1 month's rent (AB 12, since 7/1/2024); wear & tear; useful-life proration | 1-month cap | Forwarding-address requirement (§92.107) | **No signed move-in checklist → full deposit** (RCW 59.18.260) | | |

Checks shared across states: **useful-life proration** (carpet ~8–10 yrs, paint ~3–5 yrs, shown with the math), **wear-and-tear classifier** (the LLM suggests a category, the user confirms, and the rule decides), and **arithmetic** (the deductions have to add up).

⚠️ Before recording, verify every subdivision letter against the official code text. AB 2801 and AB 12 re-lettered parts of §1950.5. Keep one fixture test per rule that names its citation.

---

## 5. Demo data (synthetic; say so in the write-up)

- Tenant **"Jordan"**, Oakland, 3-year tenancy, rent $2,400, deposit $2,400 (the AB 12 cap check shows a green ✓).
- Moved out Aug 1, 2026. Letter dated Aug 27 (day 26).
- Line items: carpet $1,100 (installed 2017, invoice attached), repainting $650 (invoice, no damage described), cleaning $300 (no receipt), lost keys $75 (receipt ✓). No photos attached.
- Supportable: $75 + $110 = $185, so **$1,940 wrongfully withheld**. Bad-faith ceiling: 2 × $2,400 = **$4,800**.
- If anyone on the team has a real deposit story, open the video with it and note that it's real. The synthetic letter stays the one used in the demo.

---

## 6. 3-minute video script

| Time | Beat |
|---|---|
| 0:00–0:15 | Hook: *"Fewer than half of renters get their full deposit back. This is the letter that tells them why. Most people read it, get angry, and give up."* |
| 0:15–0:25 | *"So we built a linter for your landlord."* Show the logo: **Receipts**. |
| 0:25–1:10 | Hero demo: photo → Clerk → confirm facts → red pen → **$1,940** → bad-faith ceiling. |
| 1:10–1:30 | State toggle: CA / NY / TX, three different answers. *"We encode the law. We don't guess it."* |
| 1:30–2:00 | Demand letter (every line cited) → *"Ignored?"* → SC-100 fills itself → Court Prep card from Opposing Counsel. |
| 2:00–2:30 | Architecture slide: AI reads, law decides. Citation Needed. N unit tests. Works offline. |
| 2:30–3:00 | Impact: LSC says 92% of low-income Americans' civil legal problems get no or inadequate help. *"The deposit from your last apartment is the deposit for your next one."* Close: **Receipts: make them show the receipts.** + URL |

---

## 7. Build plan (deadline: Sun Sep 27, 2:00pm PDT. Submit by noon.)

**Stack:** Next.js + TypeScript + Tailwind · Claude API (vision + structured output) for extraction · rules engine as pure TS functions + Vitest · pdf-lib (SC-100 + letter) · tesseract.js for line anchors (optional) · Vercel + the free .xyz domain.

| Day | Ship |
|---|---|
| Wed | Rules engine + tests (CA deep; NY/TX/WA/MA/IL deadline/proof/penalty). Three synthetic letters built to trigger every rule. |
| Thu | Upload → extraction → confirm-facts screen. Red-pen renderer (SVG overlay on the letter image). |
| Fri | Demand letter PDF, SC-100 fill, Court Prep + Opposing Counsel, offline sample mode, state toggle. |
| Sat | Polish (paper + red-ink look, not generic AI UI), deploy, README, Devpost write-up, record video. |
| Sun AM | Buffer. Submit by noon. |

**Cut in this order if behind:** state toggle → Opposing Counsel → OCR anchoring (fall back to a re-typeset letter view).
**Never cut:** the red pen, the number, the filled SC-100, and a one-click "Try a sample letter" with no login.

---

## 8. Hostile Q&A (have the answers ready)

- **"Why not just ChatGPT?"** Chatbots guess the law, and landlord-industry press says AI tenant letters "often cite irrelevant law." A common mistake is claiming automatic forfeiture in California: that's NY/WA law, and *Granberry* says otherwise for CA. In our design, the AI only reads the letter. A tested rules engine decides, and every line has a citation.
- **"What if the landlord is right?"** Then we say so with a green ✓. The tool sides with the statute, not against landlords.
- **"Isn't this practicing law?"** It's legal information plus self-help forms, the same as a court self-help center provides. The tenant makes the decisions and does the filing. We link to legal aid.
- **"Who pays?"** Tenants use it free. Property managers are the business: the same engine checks their letters before they send them, and a missed Texas deadline costs them $100 + 3×.
- **"Other states?"** Each state's rules are a data file. Six states now, and adding one is data entry plus tests.
- **"What if extraction is wrong?"** You confirm every fact before any law runs.

---

## 9. Devpost write-up checklist (Presentation is 15%)

- Replace the default template with our own section headings: *The Letter · What Receipts Catches · AI Reads, Law Decides · Rules We Encode (with citations) · What's Synthetic · Declared Tools & Libraries · Engineering Log · What's Next*.
- Tables: the rules/citations table, a data-sources-and-licenses table, and a declared AI tools & libraries table (the rubric explicitly asks for this).
- A GIF of the red pen as the first gallery image. A 2:45 video. A live link with a "Try a sample letter" button.

**Backup idea (same engine):** *Collector Check.* Red-pen a debt collector's letter against Reg F plus the state statute of limitations: "this debt may be too old to sue on, so don't pay yet."

---

## Sources

- Zillow Consumer Housing Trends Report 2024 (renters & deposits): https://www.zillow.com/research/renters-housing-trends-report-2024-34387/
- Thomson Reuters Institute, NYC deposit crisis / ~50% of Brooklyn small claims: https://www.thomsonreuters.com/en/institute/articles/security-deposit-crisis
- LSC Justice Gap Report 2022 (92%): https://justicegap.lsc.gov/resource/executive-summary/
- Apartment News, "Copy, Paste, Escalate" (AI tenant letters cite irrelevant law): https://aptnewsinc.com/news/copy-paste-escalate-the-rise-of-ai-driven-tenant-disputes/
- CA Civ. Code §1950.5 overview (Sacramento County Public Law Library): https://saclaw.org/resource_library/security-deposits/
- AB 2801 photo rules: https://baylegal.com/ab-2801-security-deposit-photo-documentation-rules/
- AB 12 deposit cap: https://www.bhfs.com/insight/california-security-deposit-limits-effective-july-1-2024/
- *Granberry v. Islay Investments* (1995): https://law.justia.com/cases/california/supreme-court/4th/9/738.html
- NY GOL §7-108: https://www.nysenate.gov/legislation/laws/GOB/7-108
- TX Prop. Code §92.109: https://texas.public.law/statutes/tex._prop._code_section_92.109
- WA RCW 59.18.280 / 59.18.260: https://app.leg.wa.gov/rcw/default.aspx?cite=59.18.280 · https://app.leg.wa.gov/RCW/default.aspx?cite=59.18.260
- MA c.186 §15B: https://www.masslegalhelp.org/housing-apartments-shelter/security-deposits/getting-your-security-deposit-back
- IL 765 ILCS 710: https://www.ilga.gov/legislation/ilcs/ilcs3.asp?ActID=2202&ChapterID=62
- CA small claims ($12,500, SC-100): https://getsmallclaims.com/guide/california-small-claims-court
- FTC final order vs DoNotPay "robot lawyer" (why we never claim to be a lawyer): https://www.ftc.gov/news-events/news/press-releases/2025/02/ftc-finalizes-order-donotpay-prohibits-deceptive-ai-lawyer-claims-imposes-monetary-relief-requires
