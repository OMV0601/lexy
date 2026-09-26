import { buttonClass } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GradientMesh } from "@/components/ui/gradient-mesh";
import { Logo } from "@/components/ui/logo";
import { Pill } from "@/components/ui/pill";

export default function Home() {
  return (
    <main className="relative flex flex-1 flex-col">
      <GradientMesh className="h-[560px]" />
      <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <Logo />
        <Pill tone="neutral">Design system preview</Pill>
      </header>
      <section className="relative mx-auto w-full max-w-6xl px-6 pt-20 pb-24">
        <p className="text-eyebrow text-primary-deep">Wage theft checker</p>
        <h1 className="text-display-xxl mt-4 max-w-3xl text-ink">
          See exactly what your boss owes you.
        </h1>
        <p className="mt-6 max-w-xl text-lg font-light text-ink-2">
          Enter your hours and your pay. Clocked applies California wage law and shows the gap, line
          by line.
        </p>
        <div className="mt-8 flex gap-3">
          <a href="#" className={buttonClass("primary", "lg")}>
            Check my pay
          </a>
          <a href="#" className={buttonClass("secondary", "lg")}>
            See how it works
          </a>
        </div>
        <Card className="mt-16 max-w-sm p-6 shadow-float">
          <p className="text-eyebrow text-mute">Underpaid this week</p>
          <p className="tnum mt-2 text-5xl font-light tracking-[-0.03em] text-ruby">$412.00</p>
        </Card>
      </section>
    </main>
  );
}
