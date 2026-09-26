/**
 * The law, as data. Every number the engine uses comes from this file, and
 * every rule carries the citation a worker (or a judge) can check.
 *
 * Rates verified September 2026. Re-verify before each release: several
 * cities adjust on July 1 and the state adjusts on January 1.
 */

export type Citation = {
  /** Short cite shown in the UI, e.g. "Cal. Lab. Code §510". */
  cite: string;
  /** Link to the primary source. */
  url: string;
};

const leginfo = (code: string, section: string) =>
  `https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=${code}&sectionNum=${section}`;

export const CITATIONS = {
  minimumWage: { cite: "Cal. Lab. Code §1182.12", url: leginfo("LAB", "1182.12") },
  overtime: { cite: "Cal. Lab. Code §510", url: leginfo("LAB", "510") },
  salaryRegularRate: { cite: "Cal. Lab. Code §515(d)", url: leginfo("LAB", "515") },
  mealPeriod: { cite: "Cal. Lab. Code §512", url: leginfo("LAB", "512") },
  breakPremium: { cite: "Cal. Lab. Code §226.7", url: leginfo("LAB", "226.7") },
  recoverUnpaid: { cite: "Cal. Lab. Code §1194", url: leginfo("LAB", "1194") },
  liquidatedDamages: { cite: "Cal. Lab. Code §1194.2", url: leginfo("LAB", "1194.2") },
  lookback: { cite: "Cal. Code Civ. Proc. §338(a)", url: leginfo("CCP", "338") },
  labor: {
    cite: "Labor Commissioner wage claim",
    url: "https://www.dir.ca.gov/dlse/howtofilewageclaim.htm",
  },
} satisfies Record<string, Citation>;

export type JurisdictionId = "ca" | "los-angeles" | "san-francisco" | "san-jose" | "oakland";

export type Jurisdiction = {
  id: JurisdictionId;
  name: string;
  /** Minimum hourly wage in dollars. */
  minimumWage: number;
  effective: string;
  source: Citation;
};

export const JURISDICTIONS: Record<JurisdictionId, Jurisdiction> = {
  ca: {
    id: "ca",
    name: "California (statewide)",
    minimumWage: 16.9,
    effective: "2026-01-01",
    source: CITATIONS.minimumWage,
  },
  "los-angeles": {
    id: "los-angeles",
    name: "City of Los Angeles",
    minimumWage: 18.42,
    effective: "2026-07-01",
    source: { cite: "L.A. Mun. Code §187.02", url: "https://wagesla.lacity.gov/" },
  },
  "san-francisco": {
    id: "san-francisco",
    name: "San Francisco",
    minimumWage: 19.61,
    effective: "2026-07-01",
    source: {
      cite: "S.F. Admin. Code ch. 12R",
      url: "https://www.sf.gov/information--minimum-wage-ordinance",
    },
  },
  "san-jose": {
    id: "san-jose",
    name: "San José",
    minimumWage: 18.45,
    effective: "2026-01-01",
    source: {
      cite: "San José Mun. Code ch. 4.100",
      url: "https://www.sanjoseca.gov/your-government/departments-offices/office-of-equality-assurance/labor-standards-enforcement/minimum-wage-ordinance",
    },
  },
  oakland: {
    id: "oakland",
    name: "Oakland",
    minimumWage: 17.34,
    effective: "2026-01-01",
    source: {
      cite: "Oakland Mun. Code ch. 5.92",
      url: "https://www.oaklandca.gov/topics/minimum-wage",
    },
  },
};

/** California daily and weekly overtime thresholds (Lab. Code §510). */
export const OVERTIME = {
  dailyRegularMax: 8,
  dailyOvertimeMax: 12,
  weeklyRegularMax: 40,
  seventhDayRegularMax: 8,
  overtimeMultiplier: 1.5,
  doubleTimeMultiplier: 2,
} as const;

/** Meal period: required when a workday exceeds 5 hours (Lab. Code §512). */
export const MEAL_PERIOD = {
  requiredAfterHours: 5,
  minimumMinutes: 30,
} as const;

/** Rest breaks: 10 minutes per 4 hours, owed on workdays of 3.5 hours or more (IWC Wage Orders §12). */
export const REST_BREAK = {
  requiredFromHours: 3.5,
} as const;

/** Wage claims for statutory wages reach back three years. */
export const LOOKBACK_WEEKS = 156;
