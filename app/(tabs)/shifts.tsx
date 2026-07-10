import { useState } from "react";
import { SectionList, Text, StyleSheet, View, ActivityIndicator, RefreshControl, Pressable, Platform } from "react-native";
import { useRouter } from "expo-router";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { useShifts } from "@/hooks/useShifts";
import { ShiftCard } from "@/components/ShiftCard";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/Button";
import { color, radius, space, type as t } from "@/theme/tokens";
import type { Shift } from "@/types/db";

function CalendarStrip({ shifts }: { shifts: Shift[] }) {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const days = Array.from({ length: 14 }, (_, i) => addDays(weekStart, i));

  return (
    <View style={cs.container}>
      <View style={cs.strip}>
        {days.map((day) => {
          const isToday = isSameDay(day, today);
          const shiftCount = shifts.filter((sh) => isSameDay(new Date(sh.starts_at), day)).length;
          const hasShift = shiftCount > 0;

          return (
            <View key={day.toISOString()} style={[cs.day, isToday && cs.dayToday]}>
              <Text style={[cs.dayLabel, isToday && cs.dayLabelToday]}>
                {format(day, "EEE")}
              </Text>
              <Text style={[cs.dayNumber, isToday && cs.dayNumberToday]}>
                {format(day, "d")}
              </Text>
              {hasShift && (
                <View style={cs.dotRow}>
                  {Array.from({ length: Math.min(shiftCount, 3) }, (_, i) => (
                    <View key={i} style={cs.dot} />
                  ))}
                </View>
              )}
              {!hasShift && <View style={cs.dotPlaceholder} />}
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default function Shifts() {
  const { shifts, loading, error, refresh } = useShifts();
  const router = useRouter();

  const confirmed = shifts.filter((sh) => sh.status === "confirmed").length;
  const pending = shifts.filter((sh) => sh.status === "pending_review").length;
  const totalHours = shifts.reduce((sum, sh) => {
    return sum + (new Date(sh.ends_at).getTime() - new Date(sh.starts_at).getTime()) / 3_600_000;
  }, 0);

  const byWeek = new Map<string, Shift[]>();
  for (const sh of shifts) {
    const key = format(new Date(sh.starts_at), "'Week of' d MMM");
    byWeek.set(key, [...(byWeek.get(key) ?? []), sh]);
  }
  const sections = [...byWeek.entries()].map(([title, data]) => ({ title, data }));

  if (loading && shifts.length === 0) {
    return (
      <View style={[styles.screen, styles.center]}>
        {Platform.OS === "web" && <PageHeader title="Shifts" subtitle="Manage your upcoming shifts" />}
        <View style={[styles.center, { flex: 1 }]}>
          <ActivityIndicator color={color.amber} size="large" />
          <Text style={[t.dim, { marginTop: space(3) }]}>Loading shifts...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.screen, styles.center]}>
        <Text style={{ fontSize: 36, marginBottom: space(3) }}>⚠️</Text>
        <Text style={[t.title, { marginBottom: space(2) }]}>Something went wrong</Text>
        <Text style={[t.dim, { textAlign: "center", marginBottom: space(4), paddingHorizontal: space(6) }]}>
          {error}
        </Text>
        <Button title="Try again" variant="ghost" onPress={refresh} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {Platform.OS === "web" && <PageHeader title="Shifts" subtitle={`${shifts.length} upcoming · ${totalHours.toFixed(0)} hours`} />}
      <SectionList
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: space(4), paddingBottom: space(10), maxWidth: 900 }}
        sections={sections}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={color.amber} />}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={t.label}>{section.title}</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{section.data.length}</Text>
            </View>
          </View>
        )}
        renderItem={({ item }) => (
          <ShiftCard shift={item} onPress={() => router.push(`/shift/${item.id}`)} />
        )}
        ListHeaderComponent={
          <View style={styles.header}>
            <CalendarStrip shifts={shifts} />
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{shifts.length}</Text>
                <Text style={t.label}>Upcoming</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statNumber, { color: color.teal }]}>{confirmed}</Text>
                <Text style={t.label}>Confirmed</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statNumber, { color: color.blue }]}>{pending}</Text>
                <Text style={t.label}>To review</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statNumber, { color: color.amber }]}>{totalHours.toFixed(0)}h</Text>
                <Text style={t.label}>Total</Text>
              </View>
            </View>
            <Button
              title="+ Add shift"
              onPress={() => router.push("/shift/new")}
              style={{ marginTop: space(4), marginBottom: space(2) }}
            />
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ fontSize: 40, marginBottom: space(3) }}>📋</Text>
            <Text style={t.title}>No upcoming shifts</Text>
            <Text style={[t.dim, { marginTop: space(2), textAlign: "center", paddingHorizontal: space(4) }]}>
              Add a shift manually or forward an agency confirmation email to your ShiftPilot inbox.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const cs = StyleSheet.create({
  container: {
    backgroundColor: color.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: color.line,
    padding: space(3),
    marginBottom: space(4),
  },
  strip: {
    flexDirection: "row",
  },
  day: {
    flex: 1,
    alignItems: "center",
    paddingVertical: space(2),
    borderRadius: radius.control,
  },
  dayToday: {
    backgroundColor: color.amber,
  },
  dayLabel: {
    fontFamily: "Archivo_400Regular",
    fontSize: 10,
    color: color.textFaint,
    textTransform: "uppercase",
  },
  dayLabelToday: {
    color: color.amberInk,
    fontFamily: "Archivo_600SemiBold",
  },
  dayNumber: {
    fontFamily: "Archivo_700Bold",
    fontSize: 16,
    color: color.text,
    marginTop: 2,
  },
  dayNumberToday: {
    color: color.amberInk,
  },
  dotRow: {
    flexDirection: "row",
    marginTop: space(1),
    height: 6,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: color.teal,
    marginHorizontal: 1,
  },
  dotPlaceholder: {
    height: 6,
    marginTop: space(1),
  },
});

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.ink },
  center: { alignItems: "center", justifyContent: "center" },
  header: { marginBottom: space(2) },
  statsRow: { flexDirection: "row" },
  statCard: {
    flex: 1,
    backgroundColor: color.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: color.line,
    padding: space(3),
    alignItems: "center",
    marginHorizontal: space(1),
  },
  statNumber: {
    fontFamily: "Archivo_700Bold",
    fontSize: 24,
    color: color.text,
    marginBottom: space(1),
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: space(2),
    marginTop: space(3),
  },
  countBadge: {
    backgroundColor: color.surfaceUp,
    borderRadius: radius.pill,
    paddingHorizontal: space(2),
    paddingVertical: 2,
    marginLeft: space(2),
  },
  countText: {
    fontFamily: "Archivo_600SemiBold",
    fontSize: 11,
    color: color.textDim,
  },
  empty: {
    alignItems: "center",
    paddingVertical: space(12),
    paddingHorizontal: space(6),
  },
});
