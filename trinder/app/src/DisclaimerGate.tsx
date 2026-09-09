import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

// Shown on every launch before any idea is visible. Deliberately not
// remembered across launches: repeated acknowledgement is cheap and is the
// strongest evidence users saw the risk warning.
export function DisclaimerGate({
  disclaimer,
  onAccept,
}: {
  disclaimer: string;
  onAccept: () => void;
}) {
  return (
    <View style={styles.root}>
      <Text style={styles.title}>Before you start</Text>
      <ScrollView style={styles.body}>
        <Text style={styles.text}>{disclaimer}</Text>
        <Text style={styles.text}>
          Trinder does not hold your funds, place trades, or know anything about your financial
          situation. If you choose to trade, you do so on a third-party broker's platform, at your
          own risk, one decision at a time.
        </Text>
      </ScrollView>
      <Pressable style={styles.button} onPress={onAccept}>
        <Text style={styles.buttonText}>I understand — these are not recommendations</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 24, justifyContent: "center" },
  title: { color: "#fff", fontSize: 24, fontWeight: "800", marginBottom: 16 },
  body: { flexGrow: 0, marginBottom: 24 },
  text: { color: "#c9c9d4", fontSize: 15, lineHeight: 22, marginBottom: 14 },
  button: { backgroundColor: "#2b6cb0", borderRadius: 12, padding: 16, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 15, textAlign: "center" },
});
