import { useState } from "react";
import { ScrollView, Text, StyleSheet, View } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { createTemplate } from "@/hooks/useTemplates";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/Button";
import { Field } from "@/components/Field";
import { color, radius, space, type as t } from "@/theme/tokens";

const QUICK_DURATIONS = [
  { label: "4h", mins: 240 },
  { label: "6h", mins: 360 },
  { label: "8h", mins: 480 },
  { label: "10h", mins: 600 },
  { label: "12h", mins: 720 },
];

export default function NewTemplate() {
  const { session } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams<{
    company?: string; venue?: string; address?: string;
    duration?: string; notes?: string;
  }>();

  const [name, setName] = useState("");
  const [company, setCompany] = useState(params.company ?? "");
  const [venue, setVenue] = useState(params.venue ?? "");
  const [address, setAddress] = useState(params.address ?? "");
  const [duration, setDuration] = useState(params.duration ?? "480");
  const [notes, setNotes] = useState(params.notes ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const durationMins = parseInt(duration, 10) || 0;

  const save = async () => {
    setError(null);
    if (!session) {
      setError("You must be signed in to save a template.");
      return;
    }
    if (!name.trim()) {
      setError("Template name is required.");
      return;
    }
    if (!company.trim() || !venue.trim()) {
      setError("Company and venue are required.");
      return;
    }
    if (isNaN(durationMins) || durationMins < 1) {
      setError("Enter a valid duration in minutes (e.g. 480 for 8h).");
      return;
    }
    setBusy(true);
    try {
      await createTemplate({
        user_id: session.user.id,
        name: name.trim(),
        company: company.trim(),
        venue_name: venue.trim(),
        address: address.trim(),
        duration_mins: durationMins,
        notes: notes.trim() || null,
      });
      setSaved(true);
      setTimeout(() => router.back(), 800);
    } catch (e: any) {
      setError(e.message ?? "Failed to save template. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: space(4), paddingBottom: space(12) }}>
      {/* Success banner */}
      {saved && (
        <View style={styles.successBanner}>
          <Text style={styles.successText}>Template saved successfully!</Text>
        </View>
      )}

      {/* Error banner */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Template identity */}
      <View style={styles.section}>
        <Text style={[t.label, { marginBottom: space(3) }]}>Template identity</Text>
        <Field label="Template name *" value={name} onChangeText={setName} placeholder="Saturday Day Shift" />
        <Field label="Company / agency *" value={company} onChangeText={setCompany} placeholder="AgencyX Healthcare" />
      </View>

      {/* Location */}
      <View style={styles.section}>
        <Text style={[t.label, { marginBottom: space(3) }]}>Location</Text>
        <Field label="Venue *" value={venue} onChangeText={setVenue} placeholder="Central Hall" />
        <Field label="Address" value={address} onChangeText={setAddress} placeholder="1 Example Way, Leeds LS1 4AB" />
      </View>

      {/* Duration */}
      <View style={styles.section}>
        <Text style={[t.label, { marginBottom: space(3) }]}>Duration</Text>
        <View style={styles.quickRow}>
          {QUICK_DURATIONS.map((qd) => (
            <View key={qd.mins} style={{ flex: 1, marginHorizontal: space(1) }}>
              <Button
                title={qd.label}
                variant={durationMins === qd.mins ? "primary" : "ghost"}
                onPress={() => setDuration(String(qd.mins))}
                style={{ minHeight: 40 }}
              />
            </View>
          ))}
        </View>
        <Field
          label="Custom (minutes)"
          value={duration}
          onChangeText={setDuration}
          placeholder="480"
          keyboardType="numeric"
        />
        {durationMins > 0 && (
          <Text style={[t.dim, { fontSize: 13 }]}>
            = {Math.floor(durationMins / 60)}h {durationMins % 60 > 0 ? `${durationMins % 60}m` : ""}
          </Text>
        )}
      </View>

      {/* Notes */}
      <View style={styles.section}>
        <Text style={[t.label, { marginBottom: space(3) }]}>Additional info</Text>
        <Field label="Notes" value={notes} onChangeText={setNotes} multiline placeholder="Bring ID badge, parking at rear" />
      </View>

      <Button title={saved ? "Saved!" : "Save template"} onPress={save} loading={busy} style={{ marginTop: space(2) }} />
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
  quickRow: {
    flexDirection: "row",
    marginBottom: space(3),
  },
  errorBanner: {
    backgroundColor: "#2A1215",
    borderWidth: 1,
    borderColor: color.red,
    borderRadius: radius.control,
    padding: space(3),
    marginBottom: space(4),
  },
  errorText: {
    fontFamily: "Archivo_600SemiBold",
    fontSize: 13,
    color: color.red,
  },
  successBanner: {
    backgroundColor: "#122A1E",
    borderWidth: 1,
    borderColor: color.teal,
    borderRadius: radius.control,
    padding: space(3),
    marginBottom: space(4),
  },
  successText: {
    fontFamily: "Archivo_600SemiBold",
    fontSize: 13,
    color: color.teal,
  },
});
