import { View, Text, ScrollView, StyleSheet, RefreshControl, Pressable, Platform } from "react-native";
import { useRouter } from "expo-router";
import { isToday, isTomorrow, format, differenceInHours } from "date-fns";
import { useShifts } from "@/hooks/useShifts";
import { LeaveByBanner } from "@/components/LeaveByBanner";
import { ShiftCard } from "@/components/ShiftCard";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/Button";
import { color, radius, space, type as t } from "@/theme/tokens";

export default function Today() {
  const { shifts, loading, error, refresh } = useShifts();
  const router = useRouter();

  const now = new Date();
  const nextConfirmed = shifts.find((sh) => sh.status === "confirmed");
  const pending = shifts.filter((sh) => sh.status === "pending_review");
  const todayShifts = shifts.filter((sh) => isToday(new Date(sh.starts_at)));
  const tomorrowShifts = shifts.filter((sh) => isTomorrow(new Date(sh.starts_at)));
  const upcoming = shifts
    .filter((sh) => !isToday(new Date(sh.starts_at)) && !isTomorrow(new Date(sh.starts_at)))
    .slice(0, 5);

  const totalHoursThisWeek = shifts
    .filter((sh) => {
      const start = new Date(sh.starts_at);
      const dayDiff = Math.abs(differenceInHours(start, now));
      return dayDiff <= 168;
    })
    .reduce((sum, sh) => {
      return sum + (new Date(sh.ends_at).getTime() - new Date(sh.starts_at).getTime()) / 3_600_000;
    }, 0);

  return (
    <View style={styles.screen}>
    {Platform.OS === "web" && <PageHeader title="Today" subtitle={format(now, "EEEE, d MMMM yyyy")} />}
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: space(4), paddingBottom: space(10), maxWidth: 900 }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={color.amber} />}
    >
      {/* Date header */}
      <View style={styles.dateHeader}>
        <View>
          <Text style={t.display}>{format(now, "EEE d MMM")}</Text>
          <Text style={[t.dim, { marginTop: space(1) }]}>{format(now, "yyyy")}</Text>
        </View>
        {shifts.length > 0 && (
          <View style={styles.weekHours}>
            <Text style={styles.weekHoursNumber}>{totalHoursThisWeek.toFixed(0)}</Text>
            <Text style={[t.label, { fontSize: 10 }]}>hrs this week</Text>
          </View>
        )}
      </View>

      {/* Pending email reviews */}
      {pending.length > 0 && (
        <Pressable
          style={({ pressed }) => [styles.pendingStrip, pressed && { backgroundColor: "#1a2540" }]}
          onPress={() => router.push(`/shift/${pending[0].id}`)}
        >
          <View style={styles.pendingRow}>
            <View style={styles.pendingDot} />
            <View style={{ flex: 1 }}>
              <Text style={[t.body, { color: color.blue }]}>
                {pending.length} shift{pending.length > 1 ? "s" : ""} detected from email
              </Text>
              <Text style={[t.dim, { fontSize: 12, marginTop: 2 }]}>Tap to review and confirm</Text>
            </View>
          </View>
        </Pressable>
      )}

      {/* Leave-by banner */}
      {nextConfirmed && (
        <>
          <Text style={[t.label, { marginBottom: space(2) }]}>Next confirmed shift</Text>
          <LeaveByBanner shift={nextConfirmed} />
          <ShiftCard shift={nextConfirmed} onPress={() => router.push(`/shift/${nextConfirmed.id}`)} />
        </>
      )}

      {/* Today */}
      {todayShifts.length > 0 && (
        <>
          <Text style={[t.label, { marginTop: space(4), marginBottom: space(2) }]}>
            Today · {todayShifts.length} shift{todayShifts.length > 1 ? "s" : ""}
          </Text>
          {todayShifts
            .filter((sh) => sh.id !== nextConfirmed?.id)
            .map((sh) => (
              <ShiftCard key={sh.id} shift={sh} onPress={() => router.push(`/shift/${sh.id}`)} />
            ))}
        </>
      )}

      {/* Tomorrow */}
      {tomorrowShifts.length > 0 && (
        <>
          <Text style={[t.label, { marginTop: space(4), marginBottom: space(2) }]}>
            Tomorrow · {tomorrowShifts.length} shift{tomorrowShifts.length > 1 ? "s" : ""}
          </Text>
          {tomorrowShifts.map((sh) => (
            <ShiftCard key={sh.id} shift={sh} onPress={() => router.push(`/shift/${sh.id}`)} />
          ))}
        </>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <>
          <Text style={[t.label, { marginTop: space(4), marginBottom: space(2) }]}>Upcoming</Text>
          {upcoming.map((sh) => (
            <ShiftCard key={sh.id} shift={sh} onPress={() => router.push(`/shift/${sh.id}`)} />
          ))}
        </>
      )}

      {/* Error state */}
      {error && (
        <View style={styles.empty}>
          <Text style={{ fontSize: 36, marginBottom: space(2) }}>⚠️</Text>
          <Text style={[t.title, { color: color.red }]}>Something went wrong</Text>
          <Text style={[t.dim, { marginTop: space(1), textAlign: "center" }]}>{error}</Text>
          <Button title="Try again" variant="ghost" onPress={refresh} style={{ marginTop: space(3) }} />
        </View>
      )}

      {/* Empty state */}
      {shifts.length === 0 && !loading && !error && (
        <View style={styles.empty}>
          <Text style={{ fontSize: 48, marginBottom: space(3) }}>🗓️</Text>
          <Text style={t.title}>No upcoming shifts</Text>
          <Text style={[t.dim, { marginTop: space(2), textAlign: "center", maxWidth: 280 }]}>
            Add a shift manually, use a template, or forward an agency confirmation email to your ShiftPilot inbox.
          </Text>
        </View>
      )}

      <Button
        title="+ Add shift"
        onPress={() => router.push("/shift/new")}
        style={{ marginTop: space(4) }}
      />
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.ink },
  dateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: space(4),
  },
  weekHours: {
    backgroundColor: color.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: color.line,
    padding: space(3),
    alignItems: "center",
    minWidth: 80,
  },
  weekHoursNumber: {
    fontFamily: "Archivo_700Bold",
    fontSize: 24,
    color: color.amber,
  },
  pendingStrip: {
    borderWidth: 1,
    borderColor: color.blue,
    borderRadius: radius.card,
    padding: space(3),
    marginBottom: space(4),
  },
  pendingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  pendingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: color.blue,
    marginRight: space(3),
  },
  empty: {
    alignItems: "center",
    paddingVertical: space(12),
    paddingHorizontal: space(6),
  },
});
