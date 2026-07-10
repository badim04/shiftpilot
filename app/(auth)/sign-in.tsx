import { useState } from "react";
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Link } from "expo-router";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/Button";
import { Field } from "@/components/Field";
import { color, radius, space, type as t } from "@/theme/tokens";

const FEATURES = [
  { icon: "📧", title: "Email parsing", desc: "Forward agency emails — shifts appear automatically" },
  { icon: "🚗", title: "Live traffic", desc: "Know exactly when to leave with real-time travel alerts" },
  { icon: "📋", title: "Shift management", desc: "Track all your shifts across every agency in one place" },
  { icon: "⚡", title: "Templates", desc: "Save recurring shifts and book them in one tap" },
];

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = async () => {
    setBusy(true); setError(null);
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (err) setError(err.message);
    setBusy(false);
  };

  const isWeb = Platform.OS === "web";

  return (
    <View style={[s.screen, isWeb && s.screenWeb]}>
      {/* Branding panel (web only) */}
      {isWeb && (
        <View style={s.brandPanel}>
          <View style={s.brandContent}>
            <View style={s.logoRow}>
              <View style={s.logoIcon}>
                <Text style={s.logoIconText}>S</Text>
              </View>
              <Text style={s.logoText}>ShiftPilot</Text>
            </View>
            <Text style={s.brandHeadline}>
              Every shift.{"\n"}Every agency.{"\n"}
              <Text style={{ color: color.amber }}>On time.</Text>
            </Text>
            <Text style={s.brandSub}>
              The smart shift companion for agency workers. Manage shifts, get live travel alerts, and never be late again.
            </Text>
            <View style={s.featureList}>
              {FEATURES.map((f) => (
                <View key={f.title} style={s.featureItem}>
                  <Text style={s.featureIcon}>{f.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={s.featureTitle}>{f.title}</Text>
                    <Text style={s.featureDesc}>{f.desc}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Form panel */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={[s.formPanel, isWeb && s.formPanelWeb]}
      >
        <ScrollView contentContainerStyle={s.formContent} keyboardShouldPersistTaps="handled">
          {!isWeb && (
            <>
              <Text style={s.mobileWordmark}>
                Shift<Text style={{ color: color.amber }}>Pilot</Text>
              </Text>
              <Text style={[t.dim, { marginBottom: space(8) }]}>
                Every shift. Every agency. On time.
              </Text>
            </>
          )}

          {isWeb && (
            <>
              <Text style={s.formTitle}>Welcome back</Text>
              <Text style={[t.dim, { marginBottom: space(6) }]}>Sign in to your ShiftPilot account</Text>
            </>
          )}

          <Field
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="you@example.com"
          />
          <Field
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Enter your password"
          />

          {error && (
            <View style={s.errorBanner}>
              <Text style={s.errorText}>{error}</Text>
            </View>
          )}

          <Button title="Sign in" onPress={signIn} loading={busy} />

          <Link
            href="/(auth)/sign-up"
            style={[t.body, { color: color.amber, marginTop: space(5), textAlign: "center" }]}
          >
            New here? Create an account
          </Link>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: color.ink,
  },
  screenWeb: {
    flexDirection: "row",
  },

  brandPanel: {
    flex: 1,
    backgroundColor: "#0C0F17",
    borderRightWidth: 1,
    borderRightColor: color.line,
    justifyContent: "center",
  },
  brandContent: {
    padding: space(12),
    maxWidth: 520,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: space(8),
  },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: color.amber,
    alignItems: "center",
    justifyContent: "center",
  },
  logoIconText: {
    fontFamily: "Archivo_700Bold",
    fontSize: 20,
    color: color.amberInk,
  },
  logoText: {
    fontFamily: "Archivo_700Bold",
    fontSize: 24,
    color: color.text,
    marginLeft: space(3),
  },
  brandHeadline: {
    fontFamily: "Archivo_700Bold",
    fontSize: 40,
    lineHeight: 48,
    color: color.text,
  },
  brandSub: {
    fontFamily: "Archivo_400Regular",
    fontSize: 16,
    lineHeight: 24,
    color: color.textDim,
    marginTop: space(4),
    marginBottom: space(8),
  },
  featureList: {},
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: space(4),
  },
  featureIcon: {
    fontSize: 20,
    width: 36,
    marginTop: 2,
  },
  featureTitle: {
    fontFamily: "Archivo_600SemiBold",
    fontSize: 14,
    color: color.text,
  },
  featureDesc: {
    fontFamily: "Archivo_400Regular",
    fontSize: 13,
    color: color.textDim,
    marginTop: 2,
  },

  formPanel: {
    flex: 1,
    justifyContent: "center",
    padding: space(6),
  },
  formPanelWeb: {
    maxWidth: 480,
    minWidth: 380,
    flex: 0,
  },
  formContent: {
    justifyContent: "center",
    flexGrow: 1,
  },
  formTitle: {
    fontFamily: "Archivo_700Bold",
    fontSize: 28,
    color: color.text,
    marginBottom: space(1),
  },

  mobileWordmark: {
    fontFamily: "Archivo_700Bold",
    fontSize: 36,
    color: color.text,
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
    fontFamily: "Archivo_400Regular",
    fontSize: 13,
    color: color.red,
  },
});
