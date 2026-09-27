import type { TourApi } from "./walkthrough";

/**
 * The 2:20 product walkthrough. Each beat spotlights one thing and says one
 * short sentence. Timings are tuned for a recording; total ≈ 140 seconds.
 */
export async function runWalkthrough(t: TourApi) {
  // ── Landing ────────────────────────────────────────────────────────────
  await t.nav("/");
  await t.scrollTop();
  await t.hold(600);
  await t.spot("hero-title", {
    eyebrow: "Clocked",
    text: "A wage-theft checker. It shows workers exactly what California law says their boss owes them.",
  });
  await t.hold(4400);
  await t.spot("hero-preview", {
    eyebrow: "The idea",
    text: "Describe your week in plain words. Get back a number, line by line, with the law behind every dollar.",
  });
  await t.hold(4400);
  await t.scroll("stats", "center");
  await t.spot("stats", {
    eyebrow: "Why it matters",
    text: "Minimum wage violations alone take $15B a year from workers. That's more than every robbery, burglary and car theft combined.",
  });
  await t.hold(5400);
  await t.spot(null, null);
  await t.scrollTop();
  await t.spot("hero-cta", { eyebrow: "Let's check a real week", text: "Meet Rosa. She washes dishes in Los Angeles." });
  await t.hold(2600);
  await t.click("hero-cta");

  // ── Step 1: where ──────────────────────────────────────────────────────
  await t.waitFor("cities");
  await t.hold(700);
  await t.spot("cities", {
    eyebrow: "Step 1 · Where",
    text: "Some cities set a higher minimum wage than the state. Each one shows its rate and the law behind it.",
  });
  await t.hold(4800);
  await t.click("city-los-angeles");
  await t.spot("city-los-angeles", { eyebrow: "Step 1 · Where", text: "Los Angeles: at least $18.42 an hour." });
  await t.hold(2800);
  await t.spot(null, null);
  await t.click("continue");

  // ── Step 2: the week ───────────────────────────────────────────────────
  await t.waitFor("describe");
  await t.hold(600);
  await t.spot("describe", {
    eyebrow: "Step 2 · Your week",
    text: "No forms. Rosa just describes her week the way she'd say it.",
  });
  await t.hold(2400);
  await t.type('[data-tour="describe"] input', "Mon–Sat, 8am to 8pm, no break", 70);
  await t.hold(500);
  await t.click('[data-tour="describe"] button[type="submit"]');
  await t.hold(400);
  await t.spot("calendar", {
    eyebrow: "Step 2 · Your week",
    text: "Her words become shifts on a calendar: six days, twelve hours each, 72 hours in total.",
  });
  await t.hold(5600);
  await t.spot("read-status", {
    eyebrow: "AI reads",
    text: "Simple descriptions are read instantly, in English or Spanish. Only messy ones go to Claude, and its answer is checked before use.",
  });
  await t.hold(5000);
  await t.click("shift-0-0");
  await t.spot("shift-editor", {
    eyebrow: "You stay in control",
    text: "Every shift can be checked and fixed by hand. Split shifts too.",
  });
  await t.hold(3600);
  await t.click("shift-0-0");
  await t.scroll("breaks", "center");
  await t.spot("breaks", {
    eyebrow: "Breaks count",
    text: "Rosa got no meal break and no rest breaks. California law pays for both.",
  });
  await t.hold(2000);
  await t.click('[data-tour="breaks"] > div:nth-child(2) button:nth-child(2)');
  await t.hold(2200);
  await t.spot(null, null);
  await t.click("continue");

  // ── Step 3: pay ────────────────────────────────────────────────────────
  await t.waitFor("pay-kinds");
  await t.hold(500);
  await t.spot("pay-kinds", {
    eyebrow: "Step 3 · Your pay",
    text: "Flat cash or an hourly rate. Rosa gets the same $700 in cash every week.",
  });
  await t.hold(3800);
  await t.type('[data-tour="pay-amount"] input', "700", 220);
  await t.spot("pay-amount", { eyebrow: "Step 3 · Your pay", text: "$700 for 72 hours of work." });
  await t.hold(2000);
  await t.spot(null, null);
  await t.click("continue");

  // ── Step 4: result ─────────────────────────────────────────────────────
  await t.waitFor("result-hero");
  await t.hold(2600);
  await t.spot("result-hero", {
    eyebrow: "The result",
    text: "Rosa was underpaid $1,142 in a single week.",
  });
  await t.hold(4800);
  await t.spot("rate-bars", {
    eyebrow: "The result",
    text: "She earned $9.72 an hour. The legal minimum in Los Angeles is $18.42.",
  });
  await t.hold(5000);
  await t.scroll("ledger", "center");
  await t.spot("ledger", {
    eyebrow: "The law decides",
    text: "What the law required, line by line: regular hours, 32 hours of overtime, and missed breaks. No AI does this math.",
  });
  await t.hold(5800);
  await t.spot("cite-overtime", {
    eyebrow: "Every line is cited",
    text: "Each amount links to the exact statute, so a clerk, a lawyer or a judge can check it.",
  });
  await t.hold(5000);
  await t.spot("findings", {
    eyebrow: "What went wrong",
    text: "Every violation in plain language: below minimum wage, unpaid overtime, no meal or rest breaks.",
  });
  await t.hold(4800);
  await t.scroll("over-time", "center");
  await t.spot("over-time", {
    eyebrow: "Over time",
    text: "If every week looked like this, that's $29,692 in six months.",
  });
  await t.hold(3600);
  await t.click("preset-52");
  await t.caption({ eyebrow: "Over time", text: "$59,384 in a year. California lets workers claim up to three years back." });
  await t.hold(4400);
  await t.spot(null, null);
  await t.click("claim-cta");

  // ── Step 5: claim summary ──────────────────────────────────────────────
  await t.waitFor("claim-doc");
  await t.hold(900);
  await t.spot("claim-parties", {
    eyebrow: "Step 5 · Claim summary",
    text: "Clocked turns it into a summary Rosa can take to a free Labor Commissioner wage claim.",
  });
  await t.hold(1200);
  await t.type('[data-tour="claim-parties"] input', "Rosa M.", 90);
  await t.hold(2600);
  await t.scroll("claim-violations", "start");
  await t.spot("claim-violations", {
    eyebrow: "Step 5 · Claim summary",
    text: "Her schedule, every violation and every amount, each with its citation.",
  });
  await t.hold(4800);
  await t.scroll("claim-next", "center");
  await t.spot("claim-next", {
    eyebrow: "Her rights",
    text: "What to do next. Her employer can't retaliate, and her immigration status doesn't matter.",
  });
  await t.hold(4800);
  await t.scroll("claim-actions", "center");
  await t.spot("claim-actions", {
    eyebrow: "Ready to file",
    text: "File with the Labor Commissioner, print it, or find free legal aid.",
  });
  await t.hold(4000);

  // ── End ────────────────────────────────────────────────────────────────
  t.end(false);
}
