import { useEffect, useState, useCallback } from "react";
import { ScrollView, Text, StyleSheet, View, Pressable, Alert, ActivityIndicator, Platform } from "react-native";
import * as Clipboard from "expo-clipboard";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useLocations } from "@/hooks/useLocations";
import { Button } from "@/components/Button";
import { Field } from "@/components/Field";
import { PageHeader } from "@/components/PageHeader";
import { color, radius, space, type as t } from "@/theme/tokens";
import type { Profile, TravelMode } from "@/types/db";

const INBOUND_DOMAIN = "in.shiftpilot.app";

const TRAVEL_MODES: { value: TravelMode; label: string; icon: string }[] = [
  { value: "driving", label: "Driving", icon: "🚗" },
  { value: "transit", label: "Transit", icon: "🚌" },
  { value: "bicycling", label: "Cycling", icon: "🚲" },
  { value: "walking", label: "Walking", icon: "🚶" },
];

const BUFFER_OPTIONS = [5, 10, 15, 20, 30, 45, 60];

function SectionHeader({ title, icon }: { title: string; icon: string }) {
  return (
    <View style={s.sectionHeader}>
      <Text style={{ fontSize: 16, marginRight: space(2) }}>{icon}</Text>
      <Text style={t.label}>{title}</Text>
    </View>
  );
}

function SettingsRow({ label, value, onPress, dim }: { label: string; value?: string; onPress?: () => void; dim?: boolean }) {
  return (
    <Pressable style={s.settingsRow} onPress={onPress} disabled={!onPress}>
      <Text style={t.body}>{label}</Text>
      <Text style={[t.dim, dim && { color: color.textFaint }]}>{value ?? ""}</Text>
    </Pressable>
  );
}

export default function Settings() {
  const { session } = useAuth();
  const { locations, add, remove, setDefault } = useLocations();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [label, setLabel] = useState("");
  const [address, setAddress] = useState("");
  const [copied, setCopied] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [addingLocation, setAddingLocation] = useState(false);

  const loadProfile = useCallback(async () => {
    setProfileLoading(true);
    const { data } = await supabase.from("profiles").select("*").single();
    const p = data as Profile;
    setProfile(p);
    setNameInput(p?.full_name ?? "");
    setProfileLoading(false);
  }, [session?.user?.id]);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const forwardingAddress = profile ? `${profile.inbound_token}@${INBOUND_DOMAIN}` : "";

  const updateProfile = async (patch: Partial<Profile>) => {
    setSavingProfile(true);
    const { data, error } = await supabase
      .from("profiles")
      .update(patch)
      .eq("id", session!.user.id)
      .select()
      .single();
    if (error) {
      Alert.alert("Update failed", error.message);
    } else {
      setProfile(data as Profile);
    }
    setSavingProfile(false);
  };

  const handleAddLocation = async () => {
    if (!label.trim() || !address.trim()) {
      Alert.alert("Missing details", "Both label and address are required.");
      return;
    }
    setAddingLocation(true);
    try {
      await add(label.trim(), address.trim(), locations.length === 0);
      setLabel("");
      setAddress("");
    } catch (e: any) {
      Alert.alert("Could not add location", e.message ?? String(e));
    }
    setAddingLocation(false);
  };

  const handleDeleteLocation = (id: string, locLabel: string) => {
    Alert.alert(`Remove "${locLabel}"?`, "This starting point will be deleted.", [
      { text: "Cancel" },
      { text: "Remove", style: "destructive", onPress: () => remove(id) },
    ]);
  };

  if (profileLoading) {
    return (
      <View style={s.screen}>
        {Platform.OS === "web" && <PageHeader title="Settings" subtitle="Manage your account and preferences" />}
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={color.amber} size="large" />
        </View>
      </View>
    );
  }

  return (
    <View style={s.screen}>
    {Platform.OS === "web" && <PageHeader title="Settings" subtitle="Manage your account and preferences" />}
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: space(4), paddingBottom: space(12), maxWidth: 700 }}>

      {/* ── Profile ── */}
      <SectionHeader title="Profile" icon="👤" />
      <View style={s.card}>
        <View style={s.profileHeader}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>
              {(profile?.full_name ?? session?.user?.email ?? "?").charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1, marginLeft: space(3) }}>
            {editingName ? (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={{ flex: 1 }}>
                  <Field label="" value={nameInput} onChangeText={setNameInput} placeholder="Your name" />
                </View>
                <Button
                  title="Save"
                  loading={savingProfile}
                  onPress={async () => {
                    await updateProfile({ full_name: nameInput.trim() || null });
                    setEditingName(false);
                  }}
                  style={{ minHeight: 44, paddingHorizontal: space(4), marginLeft: space(2) }}
                />
              </View>
            ) : (
              <Pressable onPress={() => setEditingName(true)}>
                <Text style={t.title}>{profile?.full_name || "Add your name"}</Text>
                <Text style={[t.dim, { marginTop: 2 }]}>{session?.user?.email}</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>

      {/* ── Shift Inbox ── */}
      <SectionHeader title="Shift inbox" icon="📧" />
      <Pressable
        style={s.inboxCard}
        onPress={async () => {
          await Clipboard.setStringAsync(forwardingAddress);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
      >
        <View style={s.inboxRow}>
          <View style={{ flex: 1 }}>
            <Text style={[t.mono, { fontSize: 15 }]} numberOfLines={1}>{forwardingAddress}</Text>
          </View>
          <View style={[s.copyBadge, copied && { backgroundColor: color.teal }]}>
            <Text style={[s.copyText, copied && { color: color.ink }]}>
              {copied ? "Copied" : "Copy"}
            </Text>
          </View>
        </View>
        <Text style={[t.dim, { marginTop: space(2), fontSize: 13 }]}>
          Forward agency confirmation emails here. Shifts are extracted automatically and appear for your review.
        </Text>
      </Pressable>

      {/* ── Preferences ── */}
      <SectionHeader title="Preferences" icon="⚙️" />
      <View style={s.card}>
        <Text style={[t.label, { marginBottom: space(2) }]}>Default travel mode</Text>
        <View style={s.modeRow}>
          {TRAVEL_MODES.map((m) => (
            <Pressable
              key={m.value}
              style={[
                s.modeChip,
                profile?.default_travel_mode === m.value && s.modeChipActive,
              ]}
              onPress={() => updateProfile({ default_travel_mode: m.value })}
            >
              <Text style={{ fontSize: 18, marginBottom: 2 }}>{m.icon}</Text>
              <Text style={[
                s.modeLabel,
                profile?.default_travel_mode === m.value && { color: color.amber },
              ]}>
                {m.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={s.divider} />

        <Text style={[t.label, { marginBottom: space(2) }]}>Buffer before shift</Text>
        <Text style={[t.dim, { marginBottom: space(3), fontSize: 13 }]}>
          Extra time added to your "leave by" calculation for parking, walking in, etc.
        </Text>
        <View style={s.bufferRow}>
          {BUFFER_OPTIONS.map((mins) => (
            <Pressable
              key={mins}
              style={[
                s.bufferChip,
                profile?.default_buffer_mins === mins && s.bufferChipActive,
              ]}
              onPress={() => updateProfile({ default_buffer_mins: mins })}
            >
              <Text style={[
                s.bufferLabel,
                profile?.default_buffer_mins === mins && { color: color.amberInk },
              ]}>
                {mins}m
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* ── Starting Points ── */}
      <SectionHeader title="Starting points" icon="📍" />
      {locations.length === 0 && (
        <View style={s.emptyLocations}>
          <Text style={t.dim}>No starting points yet. Add your home or usual departure point below.</Text>
        </View>
      )}
      {locations.map((l) => (
        <Pressable
          key={l.id}
          style={s.locationCard}
          onLongPress={() => handleDeleteLocation(l.id, l.label)}
        >
          <View style={s.locationRow}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={t.body}>{l.label}</Text>
                {l.is_default && (
                  <View style={s.defaultBadge}>
                    <Text style={s.defaultText}>Default</Text>
                  </View>
                )}
              </View>
              <Text style={[t.dim, { marginTop: 2, fontSize: 13 }]}>{l.address}</Text>
            </View>
            {!l.is_default && (
              <Pressable hitSlop={8} onPress={() => setDefault(l.id)} style={s.setDefaultBtn}>
                <Text style={[t.dim, { fontSize: 12 }]}>Set default</Text>
              </Pressable>
            )}
          </View>
        </Pressable>
      ))}
      <View style={s.addLocationCard}>
        <Field label="Label" value={label} onChangeText={setLabel} placeholder="Home" />
        <Field label="Address" value={address} onChangeText={setAddress} placeholder="12 Example St, Manchester M1 2AB" />
        <Button
          title="Add starting point"
          variant="ghost"
          onPress={handleAddLocation}
          loading={addingLocation}
        />
      </View>

      {/* ── About ── */}
      <SectionHeader title="About" icon="ℹ️" />
      <View style={s.card}>
        <SettingsRow label="App" value="ShiftPilot" />
        <View style={s.thinDivider} />
        <SettingsRow label="Version" value="1.0.0" />
      </View>

      {/* ── Account ── */}
      <SectionHeader title="Account" icon="🔒" />
      <Button
        title="Sign out"
        variant="danger"
        onPress={() =>
          Alert.alert("Sign out?", "You'll need to sign in again to access your shifts.", [
            { text: "Cancel" },
            { text: "Sign out", style: "destructive", onPress: () => supabase.auth.signOut() },
          ])
        }
      />

      <View style={{ height: space(4) }} />
    </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.ink },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: space(6),
    marginBottom: space(3),
  },

  card: {
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.line,
    borderRadius: radius.card,
    padding: space(4),
  },

  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: color.amber,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontFamily: "Archivo_700Bold",
    fontSize: 22,
    color: color.amberInk,
  },

  inboxCard: {
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.amber,
    borderRadius: radius.card,
    padding: space(4),
  },
  inboxRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  copyBadge: {
    backgroundColor: color.surfaceUp,
    borderRadius: radius.pill,
    paddingHorizontal: space(3),
    paddingVertical: space(1.5),
    marginLeft: space(2),
  },
  copyText: {
    fontFamily: "Archivo_600SemiBold",
    fontSize: 12,
    color: color.textDim,
  },

  modeRow: {
    flexDirection: "row",
  },
  modeChip: {
    flex: 1,
    alignItems: "center",
    backgroundColor: color.surfaceUp,
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: color.line,
    paddingVertical: space(3),
    paddingHorizontal: space(2),
    marginHorizontal: space(1),
  },
  modeChipActive: {
    borderColor: color.amber,
    backgroundColor: "#2A2210",
  },
  modeLabel: {
    fontFamily: "Archivo_600SemiBold",
    fontSize: 11,
    color: color.textDim,
    marginTop: 2,
  },

  divider: {
    height: 1,
    backgroundColor: color.line,
    marginVertical: space(4),
  },
  thinDivider: {
    height: 1,
    backgroundColor: color.line,
    marginVertical: space(2),
  },

  bufferRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  bufferChip: {
    backgroundColor: color.surfaceUp,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: color.line,
    paddingHorizontal: space(4),
    paddingVertical: space(2),
    marginRight: space(2),
    marginBottom: space(2),
  },
  bufferChipActive: {
    borderColor: color.amber,
    backgroundColor: color.amber,
  },
  bufferLabel: {
    fontFamily: "Archivo_600SemiBold",
    fontSize: 13,
    color: color.textDim,
  },

  emptyLocations: {
    backgroundColor: color.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: color.line,
    borderStyle: "dashed",
    padding: space(4),
    alignItems: "center",
  },

  locationCard: {
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.line,
    borderRadius: radius.control,
    padding: space(3),
    marginBottom: space(2),
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  defaultBadge: {
    backgroundColor: color.teal,
    borderRadius: radius.pill,
    paddingHorizontal: space(2),
    paddingVertical: 2,
    marginLeft: space(2),
  },
  defaultText: {
    fontFamily: "Archivo_600SemiBold",
    fontSize: 10,
    color: color.ink,
  },
  setDefaultBtn: {
    borderWidth: 1,
    borderColor: color.line,
    borderRadius: radius.pill,
    paddingHorizontal: space(2.5),
    paddingVertical: space(1),
  },

  addLocationCard: {
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.line,
    borderRadius: radius.card,
    padding: space(4),
    marginTop: space(2),
  },

  settingsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: space(1),
  },
});
