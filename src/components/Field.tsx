import { View, Text, TextInput, StyleSheet, type TextInputProps } from "react-native";
import { color, radius, space, type } from "@/theme/tokens";

export function Field(props: TextInputProps & { label: string }) {
  const { label, ...input } = props;
  return (
    <View style={{ marginBottom: space(4) }}>
      <Text style={[type.label, { marginBottom: space(1.5) }]}>{label}</Text>
      <TextInput
        placeholderTextColor={color.textFaint}
        {...input}
        style={[s.input, input.multiline && { minHeight: 88, textAlignVertical: "top" }, input.style]}
      />
    </View>
  );
}

const s = StyleSheet.create({
  input: {
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.line,
    borderRadius: radius.control,
    minHeight: 52,
    paddingHorizontal: space(4),
    paddingVertical: space(3),
    fontFamily: "Archivo_400Regular",
    fontSize: 16,
    color: color.text,
  },
});
