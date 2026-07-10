import { View, Text, Pressable, StyleSheet } from "react-native";
import { usePathname, useRouter } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { color, radius, space } from "@/theme/tokens";

const NAV_ITEMS = [
  { path: "/", label: "Dashboard", icon: "📊" },
  { path: "/today", label: "Today", icon: "⏱" },
  { path: "/shifts", label: "Shifts", icon: "📋" },
  { path: "/templates", label: "Templates", icon: "⚡" },
];

const BOTTOM_ITEMS = [
  { path: "/settings", label: "Settings", icon: "⚙️" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { session } = useAuth();

  const userInitial = (session?.user?.email ?? "U").charAt(0).toUpperCase();

  return (
    <View style={s.container}>
      {/* Logo */}
      <View style={s.logoArea}>
        <View style={s.logoIcon}>
          <Text style={s.logoIconText}>S</Text>
        </View>
        <Text style={s.logoText}>ShiftPilot</Text>
      </View>

      <View style={s.divider} />

      {/* Main nav */}
      <View style={s.navSection}>
        <Text style={s.sectionLabel}>Menu</Text>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path || (item.path === "/" && pathname === "");
          return (
            <Pressable
              key={item.path}
              style={({ pressed }) => [s.navItem, isActive && s.navItemActive, pressed && s.navItemPressed]}
              onPress={() => router.push(item.path as any)}
            >
              <Text style={s.navIcon}>{item.icon}</Text>
              <Text style={[s.navLabel, isActive && s.navLabelActive]}>{item.label}</Text>
              {isActive && <View style={s.activeIndicator} />}
            </Pressable>
          );
        })}
      </View>

      {/* Spacer */}
      <View style={{ flex: 1 }} />

      {/* Bottom nav */}
      <View style={s.navSection}>
        {BOTTOM_ITEMS.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Pressable
              key={item.path}
              style={({ pressed }) => [s.navItem, isActive && s.navItemActive, pressed && s.navItemPressed]}
              onPress={() => router.push(item.path as any)}
            >
              <Text style={s.navIcon}>{item.icon}</Text>
              <Text style={[s.navLabel, isActive && s.navLabelActive]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={s.divider} />

      {/* User area */}
      <View style={s.userArea}>
        <View style={s.userAvatar}>
          <Text style={s.userAvatarText}>{userInitial}</Text>
        </View>
        <View style={{ flex: 1, marginLeft: space(3) }}>
          <Text style={s.userEmail} numberOfLines={1}>{session?.user?.email ?? ""}</Text>
          <Text style={s.userPlan}>Pro plan</Text>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    width: 240,
    backgroundColor: "#0C0F17",
    borderRightWidth: 1,
    borderRightColor: color.line,
    paddingVertical: space(4),
    paddingHorizontal: space(3),
  },

  logoArea: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: space(2),
    paddingBottom: space(4),
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: color.amber,
    alignItems: "center",
    justifyContent: "center",
  },
  logoIconText: {
    fontFamily: "Archivo_700Bold",
    fontSize: 16,
    color: color.amberInk,
  },
  logoText: {
    fontFamily: "Archivo_700Bold",
    fontSize: 18,
    color: color.text,
    marginLeft: space(3),
  },

  divider: {
    height: 1,
    backgroundColor: color.line,
    marginVertical: space(2),
    marginHorizontal: space(2),
  },

  navSection: {
    paddingVertical: space(2),
  },
  sectionLabel: {
    fontFamily: "Archivo_600SemiBold",
    fontSize: 10,
    color: color.textFaint,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    paddingHorizontal: space(3),
    marginBottom: space(2),
  },

  navItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: space(2.5),
    paddingHorizontal: space(3),
    borderRadius: radius.control,
    marginBottom: 2,
    position: "relative",
  },
  navItemActive: {
    backgroundColor: "#1A1E2E",
  },
  navItemPressed: {
    backgroundColor: color.surfaceUp,
  },
  navIcon: {
    fontSize: 16,
    width: 28,
  },
  navLabel: {
    fontFamily: "Archivo_400Regular",
    fontSize: 14,
    color: color.textDim,
  },
  navLabelActive: {
    fontFamily: "Archivo_600SemiBold",
    color: color.text,
  },
  activeIndicator: {
    position: "absolute",
    left: 0,
    top: "25%",
    bottom: "25%",
    width: 3,
    borderRadius: 2,
    backgroundColor: color.amber,
  },

  userArea: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: space(2),
    paddingVertical: space(2),
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: color.amber,
    alignItems: "center",
    justifyContent: "center",
  },
  userAvatarText: {
    fontFamily: "Archivo_700Bold",
    fontSize: 14,
    color: color.amberInk,
  },
  userEmail: {
    fontFamily: "Archivo_400Regular",
    fontSize: 12,
    color: color.textDim,
  },
  userPlan: {
    fontFamily: "Archivo_600SemiBold",
    fontSize: 10,
    color: color.teal,
    marginTop: 1,
  },
});
