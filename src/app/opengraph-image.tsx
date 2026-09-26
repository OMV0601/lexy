import { ImageResponse } from "next/og";

export const alt = "Clocked — see exactly what your boss owes you";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #1c1e54 0%, #2e2b8c 55%, #7a1f5c 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 36 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: "linear-gradient(135deg, #665efd, #2e2b8c)",
              border: "2px solid rgba(255,255,255,0.3)",
            }}
          />
          Clocked
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 26, letterSpacing: 3, opacity: 0.7 }}>UNDERPAID THIS WEEK</div>
          <div style={{ fontSize: 150, color: "#ff5c8a", letterSpacing: -4, lineHeight: 1.05 }}>$1,142.00</div>
          <div style={{ fontSize: 34, opacity: 0.85, marginTop: 12 }}>
            72 hours for $700 cash in Los Angeles. The law says otherwise.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
