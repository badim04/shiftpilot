import { useEffect, useState } from "react";
import { ScrollView, Text, StyleSheet, Alert, View } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { addMinutes, format } from "date-fns";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { createShift } from "@/hooks/useShifts";
import { findConflicts } from "@/lib/conflicts";
import { Button } from "@/components/Button";
import { Field } from "@/components/Field";
import { color, radius, space, type as t } from "@/theme/tokens";
import type { Template } from "@/types/db";

export default function NewShift() {
  const { session } = useAuth();
  const router = useRouter();
  const { templateId } = useLocalSearchParams<{ templateId?: string }>();

  const [company, setCompany] = useState("");
  const [venue, setVenue] = useState("");
  const [address, setAddress] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("17:00");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    if (!templateId) return;
    supabase.from("templates").select("*").eq("id", templateId).single()
      .then(({ data }) => {
        const tpl = data as Template | null;
        if (!tpl) return;
        setCompany(tpl.company);
        setVenue(tpl.venue_name);
        setAddress(tpl.address);
        setNotes(tpl.notes ?? "");
        const s = new Date(); s.setHours(9, 0, 0, 0);
        setEnd(format(addMinutes(s, tpl.duration_mins), "HH:mm"));
      });
  }, [templateId]);

  const save = async (ignoreConflicts = false) => {
    if (!session) return;
    if (!company.trim() || !venue.trim() || !date || !start || !end) {
      Alert.alert("Missing details", "Company, venue, date and times are required.");
      return;
    }
    setBusy(true); setWarning(null);
    try {
      const startsAt = new Date(`${date}T${start}:00`);
      let endsAt = new Date(`${date}T${end}:00`);
      if (endsAt <= startsAt) endsAt = new Date(endsAt.getTime() + 24 * 3_600_000);

      if (!ignoreConflicts) {
        const clashes = await findConflicts(session.user.id, startsAt, endsAt);
        if (clashes.length) {
          setWarning(
            `Clashes with ${clashes[0].venue_name} (${clashes[0].company}) ` +
            `${format(new Date(clashes[0].starts_at), "EEE d MMM HH:mm")}–${format(new Date(clashes[0].ends_at), "HH:mm")}. ` +
            `Save anyway?`,
          );
          setBusy(false);
          return;
        }
      }

      await createShift({
        user_id: session.user.id,
        company: company.trim(),
        venue_name: venue.trim(),
        address: address.trim(),
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        notes: notes.trim() || null,
        source: templateId ? "template" : "manual",
      });
      router.back();
    } catch (e: any) {
      Alert.alert("Could not save shift", e.message ?? String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: space(4), paddingBottom: space(12) }}>
      {/* Location details */}
      <View style={styles.section}>
        <Text style={[t.label, { marginBottom: space(3) }]}>Location details</Text>
        <Field label="Company / agency" value={company} onChangeText={setCompany} placeholder="AgencyX Healthcare" />
        <Field label="Venue" value={venue} onChangeText={setVenue} placeholder="Central Hall" />
        <Field label="Address" value={address} onChangeText={setAddress} placeholder="1 Example Way, Leeds LS1 4AB" />
      </View>

      {/* Date and time */}
      <View style={styles.section}>
        <Text style={[t.label, { marginBottom: space(3) }]}>Date and time</Text>
        <Field label="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} placeholder="2026-06-15" />
        <View style={styles.timeRow}>
          <View style={{ flex: 1, marginRight: space(2) }}>
            <Field label="Start (HH:MM)" value={start} onChangeText={setStart} placeholder="09:00" />
          </View>
          <View style={{ flex: 1, marginLeft: space(2) }}>
            <Field label="End (HH:MM)" value={end} onChangeText={setEnd} placeholder="17:00" />
          </View>
        </View>
      </View>

      {/* Notes */}
      <View style={styles.section}>
        <Text style={[t.label, { marginBottom: space(3) }]}>Additional info</Text>
        <Field label="Notes" value={notes} onChangeText={setNotes} multiline placeholder="Bring ID badge, parking at rear" />
      </View>

      {/* Conflict warning */}
      {warning && (
        <View style={styles.warningCard}>
          <View style={styles.warningHeader}>
            <Text style={{ fontSize: 16, marginRight: space(2) }}>⚠️</Text>
            <Text style={[t.body, { color: color.red, flex: 1 }]}>Schedule conflict</Text>
          </View>
          <Text style={[t.dim, { marginTop: space(2) }]}>{warning}</Text>
          <Button title="Save anyway" variant="danger" onPress={() => save(true)} style={{ marginTop: space(3) }} />
        </View>
      )}

      <Button title="Save shift" onPress={() => save(false)} loading={busy} style={{ marginTop: space(2) }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.ink },
  section: {
    backgroundColor: color.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: color.line,
    padding: space(4),
    marginBottom: space(4),
  },
  timeRow: {
    flexDirection: "row",
  },
  warningCard: {
    borderWidth: 1,
    borderColor: color.red,
    borderRadius: radius.card,
    padding: space(4),
    marginBottom: space(3),
    backgroundColor: color.surface,
  },
  warningHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
});
