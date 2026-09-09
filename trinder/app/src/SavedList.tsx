import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import type { TradeIdea } from "./api";

export function SavedList({ ideas }: { ideas: TradeIdea[] }) {
  if (ideas.length === 0) {
    return <Text style={styles.empty}>Swipe right on ideas to save them here.</Text>;
  }
  return (
    <FlatList
      style={styles.list}
      data={ideas}
      keyExtractor={(i) => i.id}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <View style={styles.rowHeader}>
            <Text style={styles.pair}>{item.pair}</Text>
            <Text style={[styles.dir, item.direction === "long" ? styles.long : styles.short]}>
              {item.direction.toUpperCase()} · {item.timeframe}
            </Text>
          </View>
          <Text style={styles.thesis} numberOfLines={2}>
            {item.thesis}
          </Text>
          <Text style={styles.levels}>
            Zone {item.keyLevels.entryZone} · Inv. {item.keyLevels.invalidation} · Tgt{" "}
            {item.keyLevels.target}
          </Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { width: "100%" },
  empty: { color: "#8a8a99", textAlign: "center", fontSize: 15, marginTop: 40 },
  row: { backgroundColor: "#1c1c24", borderRadius: 14, padding: 16, marginBottom: 10 },
  rowHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  pair: { color: "#fff", fontSize: 17, fontWeight: "700" },
  dir: { fontSize: 12, fontWeight: "700" },
  long: { color: "#4caf7d" },
  short: { color: "#e06c6c" },
  thesis: { color: "#c9c9d4", fontSize: 13, lineHeight: 18, marginTop: 8 },
  levels: { color: "#8a8a99", fontSize: 12, marginTop: 8 },
});
