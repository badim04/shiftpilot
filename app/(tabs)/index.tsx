import { useEffect, useRef } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable, Animated } from "react-native";
import { useRouter } from "expo-router";
import { format, isToday, isTomorrow, differenceInMinutes } from "date-fns";
import { useShifts } from "@/hooks/useShifts";
import { useTemplates } from "@/hooks/useTemplates";
import { useLocations } from "@/hooks/useLocations";
import { color, radius, space, type as t } from "@/theme/tokens";

function PulsingDot() {
  const anim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 0.3, duration: 1000, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, [anim]);
  return <Animated.View style={[s.pulseDot, { opacity: anim }]} />;
}

function StatCard({ value, label, accent }: { value: string | number; label: string; accent?: string }) {
  return (
    <View style={s.statCard}>
      <Text style={[s.statValue, accent ? { color: accent } : null]}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

function QuickAction({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <Pressable style={({ pressed }) => [s.quickAction, pressed && { opacity: 0.7 }]} onPress={onPress}>
      <View style={s.quickActionIcon}>
        <Text style={{ fontSize: 20 }}>{icon}</Text>
      </View>
      <Text style={s.quickActionLabel}>{label}</Text>
    </Pressable>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 6) return "Good night";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const { shifts, loading } = useShifts();
  const { templates } = useTemplates();
  const { locations } = useLocations();
  const router = useRouter();

  const now = new Date();
  const confirmed = shifts.filter((sh) => sh.status === "confirmed");
  const pending = shifts.filter((sh) => sh.status === "pending_review");
  const todayShifts = shifts.filter((sh) => isToday(new Date(sh.starts_at)));
  const tomorrowShifts = shifts.filter((sh) => isTomorrow(new Date(sh.starts_at)));
  const nextShift = confirmed[0];

  const totalHours = shifts.reduce((sum, sh) => {
    return sum + (new Date(sh.ends_at).getTime() - new Date(sh.starts_at).getTime()) / 3_600_000;
  }, 0);

  const nextShiftMins = nextShift
    ? differenceInMinutes(new Date(nextShift.starts_at), now)
    : null;

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.greeting}>{getGreeting()}</Text>
          <Text style={s.dateText}>{format(now, "EEEE, d MMMM yyyy")}</Text>
        </View>
        <View style={s.liveIndicator}>
          <PulsingDot />
          <Text style={s.liveText}>Live</Text>
        </View>
      </View>

      {/* Pending alert */}
      {pending.length > 0 && (
        <Pressable
          style={({ pressed }) => [s.alertBanner, pressed && { opacity: 0.8 }]}
          onPress={() => router.push(`/shift/${pending[0].id}`)}
        >
          <View style={s.alertDot} />
          <View style={{ flex: 1 }}>
            <Text style={s.alertTitle}>
              {pending.length} shift{pending.length > 1 ? "s" : ""} awaiting review
            </Text>
            <Text style={s.alertSub}>Detected from email — tap to review</Text>
          </View>
          <Text style={s.alertArrow}>→</Text>
        </Pressable>
      )}

      {/* Stats row */}
      <View style={s.statsSection}>
        <Text style={s.sectionTitle}>Overview</Text>
        <View style={s.statsGrid}>
          <StatCard value={shifts.length} label="Upcoming" />
          <StatCard value={confirmed.length} label="Confirmed" accent={color.teal} />
          <StatCard value={pending.length} label="To review" accent={color.blue} />
          <StatCard value={`${totalHours.toFixed(0)}h`} label="Total hours" accent={color.amber} />
        </View>
      </View>

      {/* Next shift card */}
      {nextShift && (
        <View style={s.nextShiftSection}>
          <Text style={s.sectionTitle}>Next shift</Text>
          <Pressable
            style={({ pressed }) => [s.nextShiftCard, pressed && { opacity: 0.85 }]}
            onPress={() => router.push(`/shift/${nextShift.id}`)}
          >
            <View style={s.nextShiftHeader}>
              <View style={s.nextShiftBadge}>
                <Text style={s.nextShiftBadgeText}>
                  {isToday(new Date(nextShift.starts_at)) ? "Today" :
                   isTomorrow(new Date(nextShift.starts_at)) ? "Tomorrow" :
                   format(new Date(nextShift.starts_at), "EEE d MMM")}
                </Text>
              </View>
              {nextShiftMins != null && nextShiftMins > 0 && (
                <Text style={s.countdownText}>
                  {nextShiftMins < 60
                    ? `in ${nextShiftMins}m`
                    : nextShiftMins < 1440
                    ? `in ${Math.floor(nextShiftMins / 60)}h ${nextShiftMins % 60}m`
                    : `in ${Math.floor(nextShiftMins / 1440)}d`}
                </Text>
              )}
            </View>
            <Text style={s.nextShiftVenue}>{nextShift.venue_name}</Text>
            <Text style={s.nextShiftCompany}>{nextShift.company}</Text>
            <View style={s.nextShiftTimeRow}>
              <Text style={s.nextShiftTime}>
                {format(new Date(nextShift.starts_at), "HH:mm")} – {format(new Date(nextShift.ends_at), "HH:mm")}
              </Text>
              {nextShift.leave_by_at && (
                <View style={s.leaveByChip}>
                  <Text style={s.leaveByText}>
                    Leave by {format(new Date(nextShift.leave_by_at), "HH:mm")}
                  </Text>
                </View>
              )}
            </View>
          </Pressable>
        </View>
      )}

      {/* Quick actions */}
      <View style={s.actionsSection}>
        <Text style={s.sectionTitle}>Quick actions</Text>
        <View style={s.actionsGrid}>
          <QuickAction icon="➕" label="Add shift" onPress={() => router.push("/shift/new")} />
          <QuickAction icon="⚡" label="From template" onPress={() => router.push("/templates" as any)} />
          <QuickAction icon="📋" label="View shifts" onPress={() => router.push("/shifts" as any)} />
          <QuickAction icon="⚙️" label="Settings" onPress={() => router.push("/settings" as any)} />
        </View>
      </View>

      {/* Today's shifts */}
      {todayShifts.length > 0 && (
        <View style={s.shiftsSection}>
          <Text style={s.sectionTitle}>Today · {todayShifts.length} shift{todayShifts.length > 1 ? "s" : ""}</Text>
          {todayShifts.map((sh) => (
            <Pressable
              key={sh.id}
              style={({ pressed }) => [s.shiftRow, pressed && { backgroundColor: color.surfaceUp }]}
              onPress={() => router.push(`/shift/${sh.id}`)}
            >
              <View style={[s.shiftDot, { backgroundColor: sh.status === "confirmed" ? color.teal : color.blue }]} />
              <View style={{ flex: 1 }}>
                <Text style={s.shiftRowVenue}>{sh.venue_name}</Text>
                <Text style={s.shiftRowCompany}>{sh.company}</Text>
              </View>
              <Text style={s.shiftRowTime}>
                {format(new Date(sh.starts_at), "HH:mm")} – {format(new Date(sh.ends_at), "HH:mm")}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Tomorrow */}
      {tomorrowShifts.length > 0 && (
        <View style={s.shiftsSection}>
          <Text style={s.sectionTitle}>Tomorrow · {tomorrowShifts.length} shift{tomorrowShifts.length > 1 ? "s" : ""}</Text>
          {tomorrowShifts.map((sh) => (
            <Pressable
              key={sh.id}
              style={({ pressed }) => [s.shiftRow, pressed && { backgroundColor: color.surfaceUp }]}
              onPress={() => router.push(`/shift/${sh.id}`)}
            >
              <View style={[s.shiftDot, { backgroundColor: sh.status === "confirmed" ? color.teal : color.blue }]} />
              <View style={{ flex: 1 }}>
                <Text style={s.shiftRowVenue}>{sh.venue_name}</Text>
                <Text style={s.shiftRowCompany}>{sh.company}</Text>
              </View>
              <Text style={s.shiftRowTime}>
                {format(new Date(sh.starts_at), "HH:mm")} – {format(new Date(sh.ends_at), "HH:mm")}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* System status */}
      <View style={s.statusSection}>
        <Text style={s.sectionTitle}>System</Text>
        <View style={s.statusCard}>
          <View style={s.statusRow}>
            <Text style={s.statusLabel}>Templates</Text>
            <Text style={s.statusValue}>{templates.length} saved</Text>
          </View>
          <View style={s.statusDivider} />
          <View style={s.statusRow}>
            <Text style={s.statusLabel}>Starting points</Text>
            <Text style={s.statusValue}>{locations.length} configured</Text>
          </View>
          <View style={s.statusDivider} />
          <View style={s.statusRow}>
            <Text style={s.statusLabel}>Email inbox</Text>
            <View style={s.statusOnline}>
              <PulsingDot />
              <Text style={[s.statusValue, { color: color.teal, marginLeft: space(1) }]}>Active</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Empty state */}
      {shifts.length === 0 && !loading && (
        <View style={s.emptyState}>
          <Text style={{ fontSize: 48, marginBottom: space(3) }}>🚀</Text>
          <Text style={s.emptyTitle}>Welcome to ShiftPilot</Text>
          <Text style={s.emptyText}>
            Add your first shift to get started with leave-by alerts, travel time calculations, and smart scheduling.
          </Text>
          <Pressable
            style={({ pressed }) => [s.emptyButton, pressed && { opacity: 0.85 }]}
            onPress={() => router.push("/shift/new")}
          >
            <Text style={s.emptyButtonText}>+ Add your first shift</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.ink },
  content: { padding: space(6), paddingBottom: space(12), maxWidth: 900 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: space(6),
  },
  greeting: {
    fontFamily: "Archivo_700Bold",
    fontSize: 28,
    color: color.text,
  },
  dateText: {
    fontFamily: "Archivo_400Regular",
    fontSize: 15,
    color: color.textDim,
    marginTop: space(1),
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: color.surface,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: color.line,
    paddingHorizontal: space(3),
    paddingVertical: space(1.5),
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: color.teal,
  },
  liveText: {
    fontFamily: "Archivo_600SemiBold",
    fontSize: 12,
    color: color.teal,
    marginLeft: space(2),
  },

  alertBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111830",
    borderWidth: 1,
    borderColor: color.blue,
    borderRadius: radius.card,
    padding: space(4),
    marginBottom: space(5),
  },
  alertDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: color.blue,
    marginRight: space(3),
  },
  alertTitle: {
    fontFamily: "Archivo_600SemiBold",
    fontSize: 14,
    color: color.blue,
  },
  alertSub: {
    fontFamily: "Archivo_400Regular",
    fontSize: 12,
    color: color.textDim,
    marginTop: 2,
  },
  alertArrow: {
    fontFamily: "Archivo_700Bold",
    fontSize: 18,
    color: color.blue,
    marginLeft: space(2),
  },

  sectionTitle: {
    fontFamily: "Archivo_600SemiBold",
    fontSize: 12,
    color: color.textFaint,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: space(3),
  },

  statsSection: { marginBottom: space(5) },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  statCard: {
    width: "25%",
    paddingRight: space(3),
    paddingBottom: space(3),
  },
  statValue: {
    fontFamily: "Archivo_700Bold",
    fontSize: 32,
    color: color.text,
  },
  statLabel: {
    fontFamily: "Archivo_400Regular",
    fontSize: 12,
    color: color.textDim,
    marginTop: space(1),
  },

  nextShiftSection: { marginBottom: space(5) },
  nextShiftCard: {
    backgroundColor: color.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: color.line,
    padding: space(5),
  },
  nextShiftHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: space(3),
  },
  nextShiftBadge: {
    backgroundColor: color.surfaceUp,
    borderRadius: radius.pill,
    paddingHorizontal: space(3),
    paddingVertical: space(1),
  },
  nextShiftBadgeText: {
    fontFamily: "Archivo_600SemiBold",
    fontSize: 12,
    color: color.textDim,
  },
  countdownText: {
    fontFamily: "Archivo_600SemiBold",
    fontSize: 13,
    color: color.amber,
  },
  nextShiftVenue: {
    fontFamily: "Archivo_700Bold",
    fontSize: 22,
    color: color.text,
  },
  nextShiftCompany: {
    fontFamily: "Archivo_400Regular",
    fontSize: 14,
    color: color.textDim,
    marginTop: space(1),
  },
  nextShiftTimeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: space(3),
    paddingTop: space(3),
    borderTopWidth: 1,
    borderTopColor: color.line,
  },
  nextShiftTime: {
    fontFamily: "Archivo_700Bold",
    fontSize: 18,
    color: color.text,
  },
  leaveByChip: {
    backgroundColor: "#2A2210",
    borderWidth: 1,
    borderColor: color.amber,
    borderRadius: radius.pill,
    paddingHorizontal: space(3),
    paddingVertical: space(1),
  },
  leaveByText: {
    fontFamily: "Archivo_600SemiBold",
    fontSize: 12,
    color: color.amber,
  },

  actionsSection: { marginBottom: space(5) },
  actionsGrid: {
    flexDirection: "row",
  },
  quickAction: {
    flex: 1,
    alignItems: "center",
    marginRight: space(3),
  },
  quickActionIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.control,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.line,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: space(2),
  },
  quickActionLabel: {
    fontFamily: "Archivo_600SemiBold",
    fontSize: 11,
    color: color.textDim,
    textAlign: "center",
  },

  shiftsSection: { marginBottom: space(5) },
  shiftRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: color.surface,
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: color.line,
    padding: space(3),
    marginBottom: space(2),
  },
  shiftDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: space(3),
  },
  shiftRowVenue: {
    fontFamily: "Archivo_600SemiBold",
    fontSize: 14,
    color: color.text,
  },
  shiftRowCompany: {
    fontFamily: "Archivo_400Regular",
    fontSize: 12,
    color: color.textDim,
    marginTop: 1,
  },
  shiftRowTime: {
    fontFamily: "Archivo_700Bold",
    fontSize: 14,
    color: color.text,
    marginLeft: space(2),
  },

  statusSection: { marginBottom: space(5) },
  statusCard: {
    backgroundColor: color.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: color.line,
    padding: space(4),
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: space(1),
  },
  statusLabel: {
    fontFamily: "Archivo_400Regular",
    fontSize: 13,
    color: color.textDim,
  },
  statusValue: {
    fontFamily: "Archivo_600SemiBold",
    fontSize: 13,
    color: color.text,
  },
  statusOnline: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDivider: {
    height: 1,
    backgroundColor: color.line,
    marginVertical: space(2),
  },

  emptyState: {
    alignItems: "center",
    paddingVertical: space(12),
    paddingHorizontal: space(6),
  },
  emptyTitle: {
    fontFamily: "Archivo_700Bold",
    fontSize: 22,
    color: color.text,
  },
  emptyText: {
    fontFamily: "Archivo_400Regular",
    fontSize: 14,
    color: color.textDim,
    textAlign: "center",
    marginTop: space(2),
    maxWidth: 320,
  },
  emptyButton: {
    backgroundColor: color.amber,
    borderRadius: radius.control,
    paddingHorizontal: space(6),
    paddingVertical: space(3),
    marginTop: space(5),
  },
  emptyButtonText: {
    fontFamily: "Archivo_600SemiBold",
    fontSize: 16,
    color: color.amberInk,
  },
});
