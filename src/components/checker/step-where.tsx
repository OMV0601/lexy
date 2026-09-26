"use client";

import { MapPin, Check } from "lucide-react";
import { clsx } from "clsx";
import { useI18n } from "@/lib/i18n";
import { money } from "@/lib/format";
import { JURISDICTIONS, type JurisdictionId } from "@/lib/wage/law";
import { StepHeading } from "./ui";

const ORDER: JurisdictionId[] = ["los-angeles", "san-francisco", "san-jose", "oakland", "ca"];

export function StepWhere({
  value,
  onChange,
}: {
  value: JurisdictionId | null;
  onChange: (id: JurisdictionId) => void;
}) {
  const { t, lang } = useI18n();
  return (
    <div>
      <StepHeading title={t.check.where.title} body={t.check.where.body} />
      <div className="grid gap-3 sm:grid-cols-2">
        {ORDER.map((id) => {
          const j = JURISDICTIONS[id];
          const active = value === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className={clsx(
                "group flex items-center justify-between rounded-lg bg-white px-5 py-4 text-left ring-1 transition",
                active ? "ring-2 ring-primary shadow-float" : "ring-hairline shadow-lift hover:ring-hairline-input",
                id === "ca" && "sm:col-span-2",
              )}
            >
              <span className="flex items-center gap-3">
                <span
                  className={clsx(
                    "flex size-9 items-center justify-center rounded-full transition",
                    active ? "bg-primary text-white" : "bg-canvas-soft text-mute group-hover:text-primary",
                  )}
                >
                  {active ? <Check className="size-4" strokeWidth={2} /> : <MapPin className="size-4" strokeWidth={1.75} />}
                </span>
                <span>
                  <span className="block text-[16px] text-ink">{id === "ca" ? t.check.where.elsewhere : j.name}</span>
                  <span className="block text-[12px] text-mute">{j.source.cite}</span>
                </span>
              </span>
              <span className="text-right">
                <span className="tnum block text-[22px] font-light tracking-[-0.02em] text-ink">
                  {money(j.minimumWage, lang)}
                </span>
                <span className="block text-[11px] text-mute">{t.check.where.perHour}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
