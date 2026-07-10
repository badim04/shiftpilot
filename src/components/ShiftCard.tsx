import { View, Text, Pressable, StyleSheet, Linking } from "react-native";
import { format } from "date-fns";
import { color, radius, space, type } from "@/theme/tokens";
import { directionsUrl } from "@/lib/maps";
import type { Shift } from "@/types/db";

const STATUS: Record<string, { label: string; tint: string }> = {
  pending_review: { label: "Tap to confirm", tint: color.blue },
  confirmed: { label: "Confirmed", tint: color.teal },
  completed: { label: "Completed", tint: color.textFaint },
  cancelled: { label: "Cancelled", tint: color.red },
};

export function ShiftCard({ shift, onPress }: { shift: Shift; onPress?: () => void }) {
  const start = new Date(shift.starts_at);
  const end = new Date(shift.ends_at);
  const status = STATUS[shift.status];

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s.card, pressed && { backgroundColor: color.surfaceUp }]}>
      <View style={s.row}>
        <Text style={type.label}>{format(start, "EEE d MMM")}</Text>
        <View style={[s.pill, { borderColor: status.tint }]}>
          <Text style={[type.label, { color: status.tint, letterSpacing: 0.6 }]}>{status.label}</Text>
        </View>
      </View>
      <Text style={[type.title, { marginTop: space(2) }]}>{shift.venue_name}</Text>
      <Text style={[type.dim, { marginTop: 2 }]}>{shift.company}</Text>
      <View style={[s.row, { marginTop: space(3) }]}>
        <Text style={[type.mono, { fontSize: 17 }]}>
          {format(start, "HH:mm")} – {format(end, "HH:mm")}
        </Text>
        <Pressable hitSlop={8} onPress={() => Linking.openURL(directionsUrl(shift))}>
          <Text style={[type.body, { color: color.amber }]}>Directions ↗</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: color.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: color.line,
    padding: space(4),
    marginBottom: space(3),
  },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  pill: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: space(2.5),
    paddingVertical: 3,
  },
});
