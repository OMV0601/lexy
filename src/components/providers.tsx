"use client";

import type { ReactNode } from "react";
import { MotionConfig } from "motion/react";
import { I18nProvider } from "@/lib/i18n";
import { WalkthroughProvider } from "@/components/tour/walkthrough";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <MotionConfig reducedMotion="user">
        <WalkthroughProvider>{children}</WalkthroughProvider>
      </MotionConfig>
    </I18nProvider>
  );
}
