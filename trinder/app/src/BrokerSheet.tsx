import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import type { Broker } from "./api";

export function BrokerSheet({
  visible,
  brokers,
  onPick,
  onClose,
}: {
  visible: boolean;
  brokers: Broker[];
  onPick: (brokerId: string) => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <Text style={styles.title}>Trade it yourself with a partner broker</Text>
          <Text style={styles.sub}>
            You'll leave the app. Signing up and placing any trade happens entirely on the
            broker's platform. We may earn a commission if you open an account.
          </Text>
          {brokers.map((b) => (
            <Pressable key={b.id} style={styles.broker} onPress={() => onPick(b.id)}>
              <Text style={styles.brokerName}>{b.name}</Text>
              <Text style={styles.brokerMeta}>{b.regulator}</Text>
            </Pressable>
          ))}
          <Pressable style={styles.cancel} onPress={onClose}>
            <Text style={styles.cancelText}>Just save the idea</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: "#1c1c24",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  title: { color: "#fff", fontSize: 18, fontWeight: "700" },
  sub: { color: "#8a8a99", fontSize: 13, lineHeight: 18, marginTop: 8, marginBottom: 16 },
  broker: {
    backgroundColor: "#26262f",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brokerName: { color: "#fff", fontSize: 16, fontWeight: "600" },
  brokerMeta: { color: "#8a8a99", fontSize: 12 },
  cancel: { padding: 14, alignItems: "center" },
  cancelText: { color: "#8a8a99", fontSize: 14 },
});
