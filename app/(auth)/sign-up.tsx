import { useState } from "react";
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Link } from "expo-router";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/Button";
import { Field } from "@/components/Field";
import { color, radius, space, type as t } from "@/theme/tokens";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const signUp = async () => {
    setBusy(true); setError(null);
    const { error: err } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: name.trim() } },
    });
    if (err) {
      setError(err.message);
    } else {
      setSuccess(true);
    }
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
              Start managing{"\n"}your shifts{"\n"}
              <Text style={{ color: color.amber }}>smarter.</Text>
            </Text>
            <Text style={s.brandSub}>
              Join thousands of agency workers who never miss a shift. Free to get started, no credit card required.
            </Text>
            <View style={s.trustRow}>
              <View style={s.trustItem}>
                <Text style={s.trustNumber}>10k+</Text>
                <Text style={s.trustLabel}>Active users</Text>
              </View>
              <View style={s.trustItem}>
                <Text style={s.trustNumber}>99.8%</Text>
                <Text style={s.trustLabel}>On-time rate</Text>
              </View>
              <View style={s.trustItem}>
                <Text style={s.trustNumber}>50+</Text>
                <Text style={s.trustLabel}>Agencies supported</Text>
              </View>
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
          <Text style={s.formTitle}>{success ? "Check your email" : "Create your account"}</Text>
          <Text style={[t.dim, { marginBottom: space(6) }]}>
            {success
              ? "We've sent a confirmation link to your email. Click it to activate your account, then sign in."
              : "Get started with ShiftPilot in seconds"}
          </Text>

          {success ? (
            <Link
              href="/(auth)/sign-in"
              style={[t.body, { color: color.amber, textAlign: "center", marginTop: space(4) }]}
            >
              Go to sign in
            </Link>
          ) : (
            <>
              <Field label="Full name" value={name} onChangeText={setName} placeholder="Your name" />
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
                placeholder="8+ characters"
              />

              {error && (
                <View style={s.errorBanner}>
                  <Text style={s.errorText}>{error}</Text>
                </View>
              )}

              <Button title="Create account" onPress={signUp} loading={busy} />

              <Link
                href="/(auth)/sign-in"
                style={[t.body, { color: color.amber, marginTop: space(5), textAlign: "center" }]}
              >
                Already have an account? Sign in
              </Link>
            </>
          )}
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
  trustRow: {
    flexDirection: "row",
  },
  trustItem: {
    flex: 1,
  },
  trustNumber: {
    fontFamily: "Archivo_700Bold",
    fontSize: 28,
    color: color.amber,
  },
  trustLabel: {
    fontFamily: "Archivo_400Regular",
    fontSize: 12,
    color: color.textDim,
    marginTop: space(1),
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
