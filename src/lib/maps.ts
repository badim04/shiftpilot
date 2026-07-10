import type { Shift } from "@/types/db";

/** One-tap directions link — opens the Google Maps app or web. */
export function directionsUrl(shift: Pick<Shift, "lat" | "lng" | "address" | "travel_mode">) {
  const dest = shift.lat != null ? `${shift.lat},${shift.lng}` : encodeURIComponent(shift.address);
  const mode = shift.travel_mode === "transit" ? "transit"
    : shift.travel_mode === "bicycling" ? "bicycling"
    : shift.travel_mode === "walking" ? "walking" : "driving";
  return `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=${mode}`;
}
