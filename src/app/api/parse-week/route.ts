import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import * as z from "zod/v4";

/**
 * AI reader for messy, free-form descriptions of a work week.
 *
 * The browser tries the deterministic parser first; it only calls this route
 * when that parser can't make sense of the text. The model's only job is to
 * turn words into shifts. It never computes pay, and whatever it returns is
 * validated again here before the wage engine sees it.
 */

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

const WeekSchema = z.object({
  shifts: z
    .array(
      z.object({
        day: z.number().int().describe("0 = Monday … 6 = Sunday"),
        start: z.string().describe('24-hour "HH:MM"'),
        end: z.string().describe('24-hour "HH:MM"; may be earlier than start for overnight shifts'),
        breakMinutes: z.number().int().describe("Unpaid meal break taken, in minutes; 0 if none or not mentioned"),
      }),
    )
    .describe("One entry per shift, Monday-first; a split shift is two entries on the same day"),
  understood: z.boolean().describe("False if the text does not describe a work schedule"),
});

const SYSTEM = `You convert a worker's description of their work week into structured shifts.
The worker may write in English or Spanish, casually, with typos.
Rules:
- The workweek is Monday (0) to Sunday (6). Emit one entry per shift. A split shift ("8 to noon, then 5 to 9") is two entries on the same day.
- Times are 24-hour "HH:MM". Resolve am/pm from context (e.g. "8 to 8" at a restaurant is 08:00-20:00).
- breakMinutes is the unpaid meal break the worker actually took during that shift. Use 0 when they say they had none or don't mention one. The gap between two shifts on one day is not a breakMinutes value.
- "Six days a week" with no days named means Monday through Saturday.
- Only include what the text states or clearly implies. Do not invent days or hours.
- If the text is not about a work schedule, return understood=false and no shifts.`;

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) {
    return Response.json({ error: "ai_unavailable" }, { status: 501 });
  }

  let text: string;
  try {
    const body = (await request.json()) as { text?: unknown };
    text = typeof body.text === "string" ? body.text.trim().slice(0, 800) : "";
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }
  if (!text) return Response.json({ error: "bad_request" }, { status: 400 });

  const client = new Anthropic({ timeout: 20_000, maxRetries: 1 });

  try {
    const response = await client.beta.messages.parse({
      model: "claude-opus-5",
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low", format: betaZodOutputFormat(WeekSchema) },
      system: SYSTEM,
      messages: [{ role: "user", content: text }],
    });

    if (response.stop_reason === "refusal" || !response.parsed_output) {
      return Response.json({ error: "not_understood" }, { status: 422 });
    }

    // At most three shifts a day, and a shift may not start inside another one.
    const perDay = new Map<number, Array<{ start: string; end: string }>>();
    const shifts = response.parsed_output.shifts
      .filter((s) => s.day >= 0 && s.day <= 6 && HHMM.test(s.start) && HHMM.test(s.end) && s.start !== s.end)
      .sort((a, b) => a.day - b.day || a.start.localeCompare(b.start))
      .filter((s) => {
        const taken = perDay.get(s.day) ?? [];
        if (taken.length >= 3) return false;
        const last = taken[taken.length - 1];
        if (last && (last.end <= last.start || s.start < last.end)) return false;
        perDay.set(s.day, [...taken, s]);
        return true;
      })
      .map((s) => ({ ...s, breakMinutes: Math.min(Math.max(0, s.breakMinutes), 240) }));

    if (!response.parsed_output.understood || shifts.length === 0) {
      return Response.json({ error: "not_understood" }, { status: 422 });
    }
    return Response.json({ shifts, source: "ai" });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      return Response.json({ error: "rate_limited" }, { status: 429 });
    }
    if (error instanceof Anthropic.APIError) {
      return Response.json({ error: "ai_error", status: error.status }, { status: 502 });
    }
    return Response.json({ error: "ai_error" }, { status: 502 });
  }
}
