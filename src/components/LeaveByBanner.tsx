import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Linking, Pressable } from "react-native";
import { color, radius, space, type } from "@/theme/tokens";
import { directionsUrl } from "@/lib/maps";
import type { Shift } from "@/types/db";

/**
 * The signature element of the Today screen: a live countdown to the
 * moment you must leave. Amber when time is short, calm before that.
 * Values come from the leave-by engine (live traffic, re-checked every 5 min).
 */
export function LeaveByBanner({ shift }: { shift: Shift }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  if (!shift.leave_by_at) {
    return (
      <View style={[s.banner, s.calm]}>
        <Text style={type.label}>Leave-by time</Text>
        <Text style={[type.body, { marginTop: space(1) }]}>
          Calculating from live traffic… check back closer to the shift.
        </Text>
      </View>
    );
  }

  const msLeft = new Date(shift.leave_by_at).getTime() - now;
  const minsLeft = Math.floor(msLeft / 60_000);
  const urgent = minsLeft <= 20;
  const travelMins = Math.round((shift.travel_duration_secs ?? 0) / 60);

  return (
    <Pressable onPress={() => Linking.openURL(directionsUrl(shift))}
      style={[s.banner, urgent ? s.urgent : s.calm]}>
      <Text style={[type.label, urgent && { color: color.amberInk }]}>
        {msLeft <= 0 ? "Leave now" : "Leave in"}
      </Text>
      <Text style={[s.clock, urgent && { color: color.amberInk }]}>
        {msLeft <= 0 ? "GO" : minsLeft >= 60 ? `${Math.floor(minsLeft / 60)}h ${minsLeft % 60}m` : `${minsLeft} min`}
      </Text>
      <Text style={[type.dim, urgent && { color: color.amberInk, opacity: 0.8 }]}>
        {travelMins} min {shift.travel_mode} to {shift.venue_name} · tap for directions
      </Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  banner: {
    borderRadius: radius.card,
    padding: space(5),
    marginBottom: space(4),
  },
  calm: { backgroundColor: color.surface, borderWidth: 1, borderColor: color.line },
  urgent: { backgroundColor: color.amber },
  clock: {
    fontFamily: "Archivo_700Bold",
    fontSize: 56,
    lineHeight: 60,
    color: color.text,
    marginVertical: space(1),
    fontVariant: ["tabular-nums"],
  },
});
