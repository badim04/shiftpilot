import { useEffect, useState } from "react";
import { ScrollView, Text, StyleSheet, Linking, View, Alert, Platform, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import { confirmShift, cancelShift } from "@/hooks/useShifts";
import { directionsUrl } from "@/lib/maps";
import { Button } from "@/components/Button";
import { color, radius, space, type as t } from "@/theme/tokens";
import type { Shift } from "@/types/db";

function DetailBlock({ label, icon, children }: { label: string; icon: string; children: React.ReactNode }) {
  return (
    <View style={styles.block}>
      <View style={styles.blockHeader}>
        <Text style={{ fontSize: 14, marginRight: space(2) }}>{icon}</Text>
        <Text style={t.label}>{label}</Text>
      </View>
      {children}
    </View>
  );
}

export default function ShiftDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [shift, setShift] = useState<Shift | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("shifts").select("*").eq("id", id).single()
      .then(({ data }) => {
        setShift(data as Shift);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <View style={[styles.screen, { alignItems: "center", justifyContent: "center" }]}>
        <ActivityIndicator color={color.amber} size="large" />
      </View>
    );
  }

  if (!shift) {
    return (
      <View style={[styles.screen, { alignItems: "center", justifyContent: "center" }]}>
        <Text style={{ fontSize: 36, marginBottom: space(3) }}>🔍</Text>
        <Text style={t.title}>Shift not found</Text>
        <Button title="Go back" variant="ghost" onPress={() => router.back()} style={{ marginTop: space(4) }} />
      </View>
    );
  }

  const start = new Date(shift.starts_at);
  const end = new Date(shift.ends_at);
  const hours = (end.getTime() - start.getTime()) / 3_600_000;
  const mapQuery = encodeURIComponent(shift.address || shift.venue_name);

  const saveAsTemplate = () => {
    const durationMins = Math.round((end.getTime() - start.getTime()) / 60_000);
    router.push({
      pathname: "/template/new",
      params: {
        company: shift.company,
        venue: shift.venue_name,
        address: shift.address,
        duration: String(durationMins),
        notes: shift.notes ?? "",
      },
    });
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: space(4), paddingBottom: space(12) }}>
      {/* Pending review banner */}
      {shift.status === "pending_review" && (
        <View style={styles.reviewCard}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: space(2) }}>
            <View style={styles.reviewDot} />
            <Text style={[t.title, { color: color.blue }]}>Detected from email</Text>
          </View>
          <Text style={t.dim}>
            Check the details below, then confirm to activate reminders and leave-by alerts.
          </Text>
          <Button
            title="Confirm shift"
            loading={busy}
            style={{ marginTop: space(3) }}
            onPress={async () => {
              setBusy(true);
              const updated = await confirmShift(shift.id);
              setShift(updated);
              setBusy(false);
            }}
          />
        </View>
      )}

      {/* Header */}
      <View style={styles.headerCard}>
        <View style={styles.headerTop}>
          <View style={{ flex: 1 }}>
            <Text style={t.display}>{shift.venue_name}</Text>
            <Text style={[t.dim, { marginTop: space(1), fontSize: 16 }]}>{shift.company}</Text>
          </View>
          <View style={[styles.statusPill, { borderColor: statusColor(shift.status) }]}>
            <Text style={[t.label, { color: statusColor(shift.status), letterSpacing: 0.6 }]}>
              {statusLabel(shift.status)}
            </Text>
          </View>
        </View>
      </View>

      {/* When */}
      <DetailBlock label="When" icon="🕐">
        <Text style={[t.body, { marginTop: space(2) }]}>
          {format(start, "EEEE d MMMM yyyy")}
        </Text>
        <View style={styles.timeChips}>
          <View style={styles.timeChip}>
            <Text style={t.label}>Start</Text>
            <Text style={styles.timeValue}>{format(start, "HH:mm")}</Text>
          </View>
          <View style={styles.timeSeparator}>
            <Text style={[t.dim, { fontSize: 20 }]}>→</Text>
          </View>
          <View style={styles.timeChip}>
            <Text style={t.label}>End</Text>
            <Text style={styles.timeValue}>{format(end, "HH:mm")}</Text>
          </View>
          <View style={[styles.timeChip, { backgroundColor: "#1a2a20", borderColor: color.teal }]}>
            <Text style={t.label}>Duration</Text>
            <Text style={[styles.timeValue, { color: color.teal }]}>{hours.toFixed(1)}h</Text>
          </View>
        </View>
      </DetailBlock>

      {/* Where */}
      <DetailBlock label="Where" icon="📍">
        <Text style={[t.body, { marginTop: space(2) }]}>
          {shift.address || "No address saved"}
        </Text>
        {shift.address && Platform.OS === "web" && (
          <View style={styles.mapContainer}>
            {/* @ts-ignore — iframe valid on web */}
            <iframe
              src={`https://maps.google.com/maps?q=${mapQuery}&output=embed`}
              style={{ width: "100%", height: "100%", border: "none", borderRadius: 12 }}
              loading="lazy"
            />
          </View>
        )}
        <Button
          title="Open directions"
          variant="ghost"
          style={{ marginTop: space(3) }}
          onPress={() => Linking.openURL(directionsUrl(shift))}
        />
      </DetailBlock>

      {/* Notes */}
      {shift.notes && (
        <DetailBlock label="Notes" icon="📝">
          <Text style={[t.body, { marginTop: space(2) }]}>{shift.notes}</Text>
        </DetailBlock>
      )}

      {/* Pay */}
      {shift.pay_rate != null && (
        <DetailBlock label="Pay" icon="💷">
          <View style={styles.payRow}>
            <Text style={styles.payAmount}>£{shift.pay_rate.toFixed(2)}</Text>
            <Text style={[t.dim, { marginLeft: space(1) }]}>
              {shift.pay_type === "hourly" ? "/ hour" : "flat rate"}
            </Text>
          </View>
          {shift.pay_type === "hourly" && (
            <Text style={[t.dim, { marginTop: space(1) }]}>
              Estimated total: £{(shift.pay_rate * hours).toFixed(2)}
            </Text>
          )}
        </DetailBlock>
      )}

      {/* Travel info */}
      {shift.leave_by_at && (
        <DetailBlock label="Travel" icon="🚗">
          <View style={styles.travelRow}>
            <View style={styles.travelItem}>
              <Text style={t.label}>Leave by</Text>
              <Text style={[t.body, { color: color.amber, marginTop: space(1) }]}>
                {format(new Date(shift.leave_by_at), "HH:mm")}
              </Text>
            </View>
            {shift.travel_duration_secs != null && (
              <View style={styles.travelItem}>
                <Text style={t.label}>Travel time</Text>
                <Text style={[t.body, { marginTop: space(1) }]}>
                  {Math.round(shift.travel_duration_secs / 60)} min
                </Text>
              </View>
            )}
            <View style={styles.travelItem}>
              <Text style={t.label}>Mode</Text>
              <Text style={[t.body, { marginTop: space(1) }]}>{shift.travel_mode}</Text>
            </View>
          </View>
        </DetailBlock>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          title="Save as template"
          variant="ghost"
          onPress={saveAsTemplate}
          style={{ flex: 1, marginRight: space(2) }}
        />
        <Button
          title="Cancel shift"
          variant="danger"
          style={{ flex: 1 }}
          onPress={() =>
            Alert.alert("Cancel this shift?", "Reminders and alerts will stop.", [
              { text: "Keep shift" },
              {
                text: "Cancel shift", style: "destructive",
                onPress: async () => { await cancelShift(shift.id); router.back(); },
              },
            ])
          }
        />
      </View>
    </ScrollView>
  );
}

function statusColor(status: string) {
  switch (status) {
    case "pending_review": return color.blue;
    case "confirmed": return color.teal;
    case "completed": return color.textFaint;
    case "cancelled": return color.red;
    default: return color.textDim;
  }
}

function statusLabel(status: string) {
  switch (status) {
    case "pending_review": return "Pending review";
    case "confirmed": return "Confirmed";
    case "completed": return "Completed";
    case "cancelled": return "Cancelled";
    default: return status;
  }
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.ink },
  reviewCard: {
    borderWidth: 1,
    borderColor: color.blue,
    borderRadius: radius.card,
    backgroundColor: color.surface,
    padding: space(4),
    marginBottom: space(4),
  },
  reviewDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: color.blue,
    marginRight: space(2),
  },
  headerCard: {
    backgroundColor: color.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: color.line,
    padding: space(5),
    marginBottom: space(3),
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  statusPill: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: space(2.5),
    paddingVertical: 3,
    marginLeft: space(3),
  },
  block: {
    backgroundColor: color.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: color.line,
    padding: space(4),
    marginBottom: space(3),
  },
  blockHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeChips: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: space(3),
  },
  timeChip: {
    flex: 1,
    backgroundColor: color.surfaceUp,
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: color.line,
    padding: space(3),
    alignItems: "center",
  },
  timeSeparator: {
    paddingHorizontal: space(2),
  },
  timeValue: {
    fontFamily: "Archivo_700Bold",
    fontSize: 20,
    color: color.text,
    marginTop: space(1),
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    marginTop: space(3),
    backgroundColor: color.surfaceUp,
  },
  payRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: space(2),
  },
  payAmount: {
    fontFamily: "Archivo_700Bold",
    fontSize: 24,
    color: color.teal,
  },
  travelRow: {
    flexDirection: "row",
    marginTop: space(2),
  },
  travelItem: {
    flex: 1,
  },
  actions: {
    flexDirection: "row",
    marginTop: space(4),
  },
});
