import { clsx } from "clsx";

/**
 * The atmospheric gradient band that sits behind every hero.
 * Organic blurred blobs (not a flat CSS gradient), drifting slowly.
 */
export function GradientMesh({ className }: { className?: string }) {
  return (
    <div aria-hidden className={clsx("pointer-events-none absolute inset-x-0 top-0 overflow-hidden", className)}>
      <div className="animate-mesh absolute -inset-x-1/4 -top-1/3 h-[140%] origin-center">
        <svg viewBox="0 0 1200 600" preserveAspectRatio="none" className="h-full w-full">
          <defs>
            <filter id="mesh-blur" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="70" />
            </filter>
          </defs>
          <g filter="url(#mesh-blur)" opacity="0.9">
            <ellipse cx="160" cy="220" rx="260" ry="170" fill="#f5e9d4" />
            <ellipse cx="420" cy="140" rx="260" ry="150" fill="#ffc48a" />
            <ellipse cx="640" cy="260" rx="280" ry="160" fill="#b9b9f9" />
            <ellipse cx="860" cy="150" rx="260" ry="170" fill="#665efd" />
            <ellipse cx="1060" cy="260" rx="240" ry="160" fill="#ea2261" />
            <ellipse cx="980" cy="60" rx="200" ry="110" fill="#f96bee" />
          </g>
        </svg>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-b from-transparent to-white" />
    </div>
  );
}
