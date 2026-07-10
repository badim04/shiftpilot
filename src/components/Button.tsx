import { Pressable, Text, StyleSheet, ActivityIndicator, type ViewStyle } from "react-native";
import { color, radius, space } from "@/theme/tokens";

export function Button(props: {
  title: string;
  onPress: () => void;
  variant?: "primary" | "ghost" | "danger";
  loading?: boolean;
  style?: ViewStyle;
}) {
  const v = props.variant ?? "primary";
  return (
    <Pressable
      accessibilityRole="button"
      onPress={props.loading ? undefined : props.onPress}
      style={({ pressed }) => [s.base, s[v], pressed && { opacity: 0.85 }, props.style]}
    >
      {props.loading
        ? <ActivityIndicator color={v === "primary" ? color.amberInk : color.text} />
        : <Text style={[s.label, v === "primary" ? { color: color.amberInk } : v === "danger" ? { color: color.red } : { color: color.text }]}>
            {props.title}
          </Text>}
    </Pressable>
  );
}

const s = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: radius.control,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: space(5),
  },
  primary: { backgroundColor: color.amber },
  ghost: { backgroundColor: color.surfaceUp, borderWidth: 1, borderColor: color.line },
  danger: { backgroundColor: "transparent", borderWidth: 1, borderColor: color.red },
  label: { fontFamily: "Archivo_600SemiBold", fontSize: 16 },
});
