import type { Metadata } from "next";
import { Checker } from "@/components/checker/checker";

export const metadata: Metadata = {
  title: "Check my pay — Clocked",
};

export default async function CheckPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const demo = typeof params.demo === "string" ? params.demo : null;
  return <Checker key={demo ?? "live"} demo={demo} />;
}
