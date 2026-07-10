// ============================================================
// ShiftPilot design tokens — "pre-dawn dashboard"
// Built for a worker checking their phone at 05:30 in a dark car:
// near-black ink blue, large type, one urgent amber for "leave now".
// ============================================================

export const color = {
  ink: "#10141D",        // app background
  surface: "#1A2030",    // cards
  surfaceUp: "#232B40",  // pressed / elevated
  line: "#2C3650",       // hairline borders

  text: "#F2F4F8",
  textDim: "#9AA4BC",
  textFaint: "#5E6880",

  amber: "#FFB224",      // leave-by urgency, primary action
  amberInk: "#241A02",   // text on amber
  teal: "#3DD6A3",       // confirmed / success
  red: "#FF6B6B",        // conflicts / cancelled
  blue: "#6FA8FF",       // pending review / informational
} as const;

export const space = (n: number) => n * 4;

export const radius = { card: 16, control: 12, pill: 999 } as const;

export const type = {
  display: { fontFamily: "Archivo_700Bold", fontSize: 30, lineHeight: 34, color: color.text },
  title:   { fontFamily: "Archivo_600SemiBold", fontSize: 19, lineHeight: 24, color: color.text },
  body:    { fontFamily: "Archivo_400Regular", fontSize: 15, lineHeight: 21, color: color.text },
  dim:     { fontFamily: "Archivo_400Regular", fontSize: 14, lineHeight: 19, color: color.textDim },
  label:   { fontFamily: "Archivo_600SemiBold", fontSize: 12, lineHeight: 16, color: color.textFaint, letterSpacing: 1.2, textTransform: "uppercase" as const },
  mono:    { fontFamily: "Archivo_700Bold", fontVariant: ["tabular-nums"] as ("tabular-nums")[], color: color.text },
} as const;
