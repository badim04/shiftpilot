import { View, Text, StyleSheet } from "react-native";
import { color, space } from "@/theme/tokens";

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={s.container}>
      <View style={s.inner}>
        <Text style={s.title}>{title}</Text>
        {subtitle && <Text style={s.subtitle}>{subtitle}</Text>}
      </View>
      <View style={s.border} />
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    backgroundColor: "#0C0F17",
  },
  inner: {
    paddingHorizontal: space(6),
    paddingVertical: space(4),
  },
  title: {
    fontFamily: "Archivo_700Bold",
    fontSize: 22,
    color: color.text,
  },
  subtitle: {
    fontFamily: "Archivo_400Regular",
    fontSize: 13,
    color: color.textDim,
    marginTop: space(1),
  },
  border: {
    height: 1,
    backgroundColor: color.line,
  },
});
