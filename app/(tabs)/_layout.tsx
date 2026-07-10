import { Platform, View, Text, StyleSheet } from "react-native";
import { Tabs, Slot } from "expo-router";
import { Sidebar } from "@/components/Sidebar";
import { color } from "@/theme/tokens";

function TabIcon({ glyph, focused }: { glyph: string; focused: boolean }) {
  return <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.45 }}>{glyph}</Text>;
}

function WebLayout() {
  return (
    <View style={s.webContainer}>
      <Sidebar />
      <View style={s.webContent}>
        <Slot />
      </View>
    </View>
  );
}

function MobileLayout() {
  return (
    <Tabs screenOptions={{
      headerStyle: { backgroundColor: color.ink },
      headerShadowVisible: false,
      headerTintColor: color.text,
      headerTitleStyle: { fontFamily: "Archivo_700Bold", fontSize: 22 },
      tabBarStyle: { backgroundColor: color.ink, borderTopColor: color.line },
      tabBarActiveTintColor: color.amber,
      tabBarInactiveTintColor: color.textFaint,
      tabBarLabelStyle: { fontFamily: "Archivo_600SemiBold", fontSize: 11 },
      sceneStyle: { backgroundColor: color.ink },
    }}>
      <Tabs.Screen name="index" options={{ title: "Dashboard", tabBarIcon: (p) => <TabIcon glyph="📊" focused={p.focused} /> }} />
      <Tabs.Screen name="today" options={{ title: "Today", tabBarIcon: (p) => <TabIcon glyph="⏱" focused={p.focused} /> }} />
      <Tabs.Screen name="shifts" options={{ title: "Shifts", tabBarIcon: (p) => <TabIcon glyph="📋" focused={p.focused} /> }} />
      <Tabs.Screen name="templates" options={{ title: "Templates", tabBarIcon: (p) => <TabIcon glyph="⚡" focused={p.focused} /> }} />
      <Tabs.Screen name="settings" options={{ title: "Settings", tabBarIcon: (p) => <TabIcon glyph="⚙️" focused={p.focused} /> }} />
    </Tabs>
  );
}

export default function TabsLayout() {
  if (Platform.OS === "web") return <WebLayout />;
  return <MobileLayout />;
}

const s = StyleSheet.create({
  webContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: color.ink,
  },
  webContent: {
    flex: 1,
    backgroundColor: color.ink,
  },
});
