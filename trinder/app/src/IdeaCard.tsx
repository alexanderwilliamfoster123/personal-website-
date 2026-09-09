import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { TradeIdea } from "./api";

export function IdeaCard({ idea }: { idea: TradeIdea }) {
  const isLong = idea.direction === "long";
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.pair}>{idea.pair}</Text>
        <View style={[styles.badge, isLong ? styles.long : styles.short]}>
          <Text style={styles.badgeText}>{idea.direction.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.meta}>
        {idea.timeframe} · {idea.model}
      </Text>
      <Text style={styles.thesis}>{idea.thesis}</Text>
      <View style={styles.levels}>
        <Level label="Zone" value={idea.keyLevels.entryZone} />
        <Level label="Invalidation" value={idea.keyLevels.invalidation} />
        <Level label="Target" value={idea.keyLevels.target} />
      </View>
      <Text style={styles.risk}>⚠ {idea.riskNote}</Text>
    </View>
  );
}

function Level({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.level}>
      <Text style={styles.levelLabel}>{label}</Text>
      <Text style={styles.levelValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1c1c24",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    height: "100%",
    justifyContent: "flex-start",
  },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  pair: { color: "#fff", fontSize: 28, fontWeight: "700" },
  badge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  long: { backgroundColor: "#124d2e" },
  short: { backgroundColor: "#5b1a1a" },
  badgeText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  meta: { color: "#8a8a99", marginTop: 6, fontSize: 13 },
  thesis: { color: "#d9d9e3", marginTop: 16, fontSize: 16, lineHeight: 23 },
  levels: { marginTop: 20, gap: 8 },
  level: { flexDirection: "row", justifyContent: "space-between" },
  levelLabel: { color: "#8a8a99", fontSize: 14 },
  levelValue: { color: "#fff", fontSize: 14, fontWeight: "600" },
  risk: { color: "#c9a24b", marginTop: 20, fontSize: 13, lineHeight: 18 },
});
