import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator } from "react-native";
import {
  useFonts, Archivo_400Regular, Archivo_600SemiBold, Archivo_700Bold,
} from "@expo-google-fonts/archivo";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { color } from "@/theme/tokens";

function Gate() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const inAuth = segments[0] === "(auth)";
    if (!session && !inAuth) router.replace("/(auth)/sign-in");
    if (session && inAuth) router.replace("/(tabs)");
  }, [session, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: color.ink, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={color.amber} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{
      headerStyle: { backgroundColor: color.ink },
      headerTintColor: color.text,
      headerTitleStyle: { fontFamily: "Archivo_600SemiBold" },
      contentStyle: { backgroundColor: color.ink },
    }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="shift/new" options={{ title: "New shift", presentation: "modal" }} />
      <Stack.Screen name="shift/[id]" options={{ title: "Shift" }} />
      <Stack.Screen name="template/new" options={{ title: "New template", presentation: "modal" }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Archivo_400Regular, Archivo_600SemiBold, Archivo_700Bold });
  if (!fontsLoaded) return null;
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Gate />
    </AuthProvider>
  );
}
