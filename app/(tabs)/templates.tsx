import { useCallback } from "react";
import { FlatList, Text, Pressable, StyleSheet, View, Alert, Platform } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useTemplates, deleteTemplate } from "@/hooks/useTemplates";
import { PageHeader } from "@/components/PageHeader";
import { color, radius, space, type as t } from "@/theme/tokens";
import { Button } from "@/components/Button";

export default function Templates() {
  const { templates, loading, refresh } = useTemplates();
  const router = useRouter();

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  const handleDelete = (id: string, name: string) => {
    Alert.alert(`Delete "${name}"?`, "This template will be removed.", [
      { text: "Cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          await deleteTemplate(id);
          refresh();
        },
      },
    ]);
  };

  return (
    <View style={styles.screen}>
    {Platform.OS === "web" && <PageHeader title="Templates" subtitle={`${templates.length} template${templates.length !== 1 ? "s" : ""} saved`} />}
    <FlatList
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: space(4), paddingBottom: space(10), maxWidth: 900 }}
      data={templates}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <Pressable
          style={({ pressed }) => [styles.card, pressed && { backgroundColor: color.surfaceUp }]}
          onPress={() => router.push({ pathname: "/shift/new", params: { templateId: item.id } })}
          onLongPress={() => handleDelete(item.id, item.name)}
        >
          <View style={styles.cardTop}>
            <View style={{ flex: 1 }}>
              <Text style={t.title}>{item.name}</Text>
              <Text style={[t.dim, { marginTop: space(1) }]}>{item.company}</Text>
            </View>
            <View style={styles.durationBadge}>
              <Text style={styles.durationText}>
                {item.duration_mins >= 60
                  ? `${Math.floor(item.duration_mins / 60)}h ${item.duration_mins % 60 > 0 ? `${item.duration_mins % 60}m` : ""}`
                  : `${item.duration_mins}m`}
              </Text>
            </View>
          </View>

          <View style={styles.detailsRow}>
            <View style={styles.detailChip}>
              <Text style={styles.detailIcon}>📍</Text>
              <Text style={[t.dim, { fontSize: 12, flex: 1 }]} numberOfLines={1}>{item.venue_name}</Text>
            </View>
            {item.address ? (
              <View style={[styles.detailChip, { marginTop: space(1) }]}>
                <Text style={styles.detailIcon}>🏠</Text>
                <Text style={[t.dim, { fontSize: 12, flex: 1 }]} numberOfLines={1}>{item.address}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.useRow}>
            <Text style={[t.dim, { fontSize: 12 }]}>Tap to create shift from template</Text>
            <Text style={[t.body, { color: color.amber, fontSize: 13 }]}>Use →</Text>
          </View>
        </Pressable>
      )}
      ListHeaderComponent={
        <View style={styles.listHeader}>
          <View style={styles.headerRow}>
            <View>
              <Text style={t.title}>Shift templates</Text>
              <Text style={[t.dim, { marginTop: space(1) }]}>
                {templates.length} template{templates.length !== 1 ? "s" : ""}
              </Text>
            </View>
            <Button
              title="+ New"
              variant="ghost"
              onPress={() => router.push("/template/new")}
              style={{ paddingHorizontal: space(4), minHeight: 40 }}
            />
          </View>
        </View>
      }
      ListEmptyComponent={
        !loading ? (
          <View style={styles.empty}>
            <Text style={{ fontSize: 48, marginBottom: space(3) }}>⚡</Text>
            <Text style={t.title}>No templates yet</Text>
            <Text style={[t.dim, { marginTop: space(2), textAlign: "center", maxWidth: 280 }]}>
              Create a template for shifts you do regularly. Open any shift and tap "Save as template" to get started.
            </Text>
            <Button
              title="+ Create template"
              variant="ghost"
              onPress={() => router.push("/template/new")}
              style={{ marginTop: space(4) }}
            />
          </View>
        ) : null
      }
    />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.ink },
  listHeader: {
    marginBottom: space(4),
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  card: {
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.line,
    borderRadius: radius.card,
    padding: space(4),
    marginBottom: space(3),
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  durationBadge: {
    backgroundColor: color.surfaceUp,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: color.line,
    paddingHorizontal: space(3),
    paddingVertical: space(1),
    marginLeft: space(2),
  },
  durationText: {
    fontFamily: "Archivo_700Bold",
    fontSize: 14,
    color: color.text,
  },
  detailsRow: {
    marginTop: space(3),
    paddingTop: space(3),
    borderTopWidth: 1,
    borderTopColor: color.line,
  },
  detailChip: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailIcon: {
    fontSize: 12,
    marginRight: space(2),
  },
  useRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: space(3),
    paddingTop: space(3),
    borderTopWidth: 1,
    borderTopColor: color.line,
  },
  empty: {
    alignItems: "center",
    paddingVertical: space(12),
    paddingHorizontal: space(6),
  },
});
