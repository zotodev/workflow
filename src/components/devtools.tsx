import { TanStackDevtools } from "@tanstack/react-devtools"
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"

type DevToolsPosition = "bottom-left" | "bottom-right" | "top-left" | "top-right" | "middle-left" | "middle-right"

const POSITION_STYLES: Record<DevToolsPosition, React.CSSProperties> = {
  "bottom-left": { bottom: "16px", left: "16px" },
  "bottom-right": { bottom: "16px", right: "16px" },
  "top-left": { top: "16px", left: "16px" },
  "top-right": { top: "16px", right: "16px" },
  "middle-left": { top: "50%", left: "16px", transform: "translateY(-50%)" },
  "middle-right": { top: "50%", right: "16px", transform: "translateY(-50%)" }
}

const DEVTOOLS_POSITION: DevToolsPosition = "bottom-left"

export default function DevTools() {
  const MyCustomTrigger = () => (
    <button
      type="button"
      style={{
        position: "fixed",
        zIndex: 99999,
        ...POSITION_STYLES[DEVTOOLS_POSITION], // ← dynamic anchor, not hardcoded
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "6px 10px",
        background: "#0f0f0f",
        color: "#a0a0a0",
        border: "1px solid #1f1f1f",
        borderRadius: "6px",
        cursor: "pointer",
        fontSize: "11px",
        fontFamily: "'Geist Mono', 'JetBrains Mono', monospace",
        fontWeight: 500,
        letterSpacing: "0.04em",
        backdropFilter: "blur(8px)",
        boxShadow: "0 0 0 1px #1a1a1a, 0 4px 12px rgba(0,0,0,0.4)",
        transition: "all 0.15s ease"
      }}
      onMouseEnter={(e) => {
        const t = e.currentTarget
        t.style.background = "#161616"
        t.style.color = "#e0e0e0"
        t.style.borderColor = "#2a2a2a"
      }}
      onMouseLeave={(e) => {
        const t = e.currentTarget
        t.style.background = "#0f0f0f"
        t.style.color = "#a0a0a0"
        t.style.borderColor = "#1f1f1f"
      }}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <rect x="1" y="1" width="4" height="4" rx="0.75" fill="currentColor" opacity="0.5" />
        <rect x="7" y="1" width="4" height="4" rx="0.75" fill="currentColor" />
        <rect x="1" y="7" width="4" height="4" rx="0.75" fill="currentColor" />
        <rect x="7" y="7" width="4" height="4" rx="0.75" fill="currentColor" opacity="0.5" />
      </svg>
      devtools
    </button>
  )

  return (
    <TanStackDevtools
      config={{
        position: DEVTOOLS_POSITION, // ← single source of truth
        customTrigger: <MyCustomTrigger />
      }}
      plugins={[
        { name: "Tanstack Query", render: <ReactQueryDevtoolsPanel /> },
        { name: "Tanstack Router", render: <TanStackRouterDevtoolsPanel /> }
      ]}
    />
  )
}
