// components/Dashboard/DashboardBackground.tsx
// Fixed texture + motif layers. Uses --texture-* tokens defined in globals.css
// so it automatically follows the existing .dark class toggle — no extra logic needed.

export default function DashboardBackground() {
  return (
    <>
      <svg className="dashboard-noise" width="100%" height="100%" aria-hidden="true">
        <filter id="dashboard-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves={2}
            stitchTiles="stitch"
            result="noise"
          />
          <feColorMatrix
            in="noise"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.9 0"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#dashboard-grain)" />
      </svg>

      <div className="dashboard-texture" aria-hidden="true" />

      <div className="dashboard-motifs" aria-hidden="true">
        <svg
          width="120"
          height="90"
          viewBox="0 0 120 90"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          style={{ top: 60, left: "6%", transform: "rotate(-8deg)" }}
        >
          <path d="M10 15 L55 8 L55 75 L10 82 Z" />
          <path d="M55 8 L110 15 L110 82 L55 75 Z" />
          <line x1="55" y1="8" x2="55" y2="75" />
          <line x1="18" y1="26" x2="47" y2="21" />
          <line x1="18" y1="38" x2="47" y2="33" />
          <line x1="63" y1="21" x2="102" y2="26" />
          <line x1="63" y1="33" x2="102" y2="38" />
        </svg>

        <svg
          width="130"
          height="95"
          viewBox="0 0 130 95"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          style={{ top: "70%", right: "5%", transform: "rotate(6deg)" }}
        >
          <rect x="18" y="8" width="94" height="60" rx="4" />
          <line x1="18" y1="52" x2="112" y2="52" />
          <path d="M4 68 L126 68 L114 86 L16 86 Z" />
        </svg>

        <svg
          width="90"
          height="90"
          viewBox="0 0 90 90"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          style={{ top: "18%", right: "14%", transform: "rotate(10deg)" }}
        >
          <path d="M8 34 L45 16 L82 34 L45 52 Z" />
          <path d="M22 41 L22 62 C22 68 65 68 68 62 L68 41" />
          <line x1="82" y1="34" x2="82" y2="58" />
        </svg>

        <svg
          width="80"
          height="60"
          viewBox="0 0 80 60"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          style={{ bottom: "8%", left: "16%", transform: "rotate(-4deg)" }}
        >
          <path d="M5 10 L38 4 L38 48 L5 54 Z" />
          <path d="M38 4 L75 10 L75 54 L38 48 Z" />
          <line x1="38" y1="4" x2="38" y2="48" />
        </svg>

        <svg
          width="70"
          height="52"
          viewBox="0 0 70 52"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.2}
          style={{ top: "38%", left: "2%", transform: "rotate(-12deg)" }}
        >
          <rect x="6" y="4" width="50" height="32" rx="3" />
          <line x1="0" y1="40" x2="70" y2="40" strokeLinecap="round" />
        </svg>
      </div>
    </>
  );
}