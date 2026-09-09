import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Linking,
  PanResponder,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Broker, brokerLink, fetchBrokers, fetchIdeas, TradeIdea } from "./src/api";
import { IdeaCard } from "./src/IdeaCard";
import { DisclaimerGate } from "./src/DisclaimerGate";
import { BrokerSheet } from "./src/BrokerSheet";
import { SavedList } from "./src/SavedList";

const { width: SCREEN_W } = Dimensions.get("window");
const SWIPE_THRESHOLD = SCREEN_W * 0.3;

type Tab = "deck" | "saved";

export default function App() {
  const [ideas, setIdeas] = useState<TradeIdea[]>([]);
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [disclaimer, setDisclaimer] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [index, setIndex] = useState(0);
  const [saved, setSaved] = useState<TradeIdea[]>([]);
  const [sheetIdea, setSheetIdea] = useState<TradeIdea | null>(null);
  const [tab, setTab] = useState<Tab>("deck");
  const [error, setError] = useState<string | null>(null);

  const position = useRef(new Animated.ValueXY()).current;
  const indexRef = useRef(0);
  const ideasRef = useRef<TradeIdea[]>([]);
  indexRef.current = index;
  ideasRef.current = ideas;

  useEffect(() => {
    Promise.all([fetchIdeas(), fetchBrokers()])
      .then(([r, b]) => {
        setIdeas(r.ideas);
        setDisclaimer(r.disclaimer);
        setBrokers(b);
      })
      .catch(() => setError("Couldn't load ideas — is the server running?"));
  }, []);

  const advance = (liked: boolean) => {
    const idea = ideasRef.current[indexRef.current];
    if (liked && idea) {
      // Right swipe = the user chose this specific idea. Save it and offer
      // partner brokers; any signup or trade happens on the broker's own
      // platform — the app never places orders.
      setSaved((s) => (s.some((x) => x.id === idea.id) ? s : [idea, ...s]));
      setSheetIdea(idea);
    }
    position.setValue({ x: 0, y: 0 });
    setIndex((i) => i + 1);
  };

  const swipeOut = (dir: 1 | -1) => {
    Animated.timing(position, {
      toValue: { x: dir * SCREEN_W * 1.5, y: 0 },
      duration: 200,
      useNativeDriver: false,
    }).start(() => advance(dir === 1));
  };

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_e, g) => Math.abs(g.dx) > 8,
      onPanResponderMove: (_e, g) => position.setValue({ x: g.dx, y: g.dy }),
      onPanResponderRelease: (_e, g) => {
        if (g.dx > SWIPE_THRESHOLD) swipeOut(1);
        else if (g.dx < -SWIPE_THRESHOLD) swipeOut(-1);
        else
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
      },
    }),
  ).current;

  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_W, 0, SCREEN_W],
    outputRange: ["-12deg", "0deg", "12deg"],
  });

  if (!accepted) {
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar style="light" />
        <DisclaimerGate
          disclaimer={
            disclaimer ||
            "Trade ideas are AI-generated market commentary for educational purposes only and are not investment advice."
          }
          onAccept={() => setAccepted(true)}
        />
      </SafeAreaView>
    );
  }

  const current = ideas[index];
  const next = ideas[index + 1];

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="light" />
      <View style={styles.topBar}>
        <Text style={styles.title}>Trinder</Text>
        <View style={styles.tabs}>
          <TabButton label="Deck" active={tab === "deck"} onPress={() => setTab("deck")} />
          <TabButton
            label={`Saved (${saved.length})`}
            active={tab === "saved"}
            onPress={() => setTab("saved")}
          />
        </View>
      </View>

      {tab === "saved" ? (
        <View style={styles.savedWrap}>
          <SavedList ideas={saved} />
        </View>
      ) : (
        <>
          <View style={styles.deck}>
            {error && <Text style={styles.empty}>{error}</Text>}
            {!error && !current && (
              <Text style={styles.empty}>
                {ideas.length === 0 ? "Loading ideas…" : "No more ideas — check back soon."}
              </Text>
            )}
            {next && (
              <View style={[styles.cardWrap, styles.behind]}>
                <IdeaCard idea={next} />
              </View>
            )}
            {current && (
              <Animated.View
                style={[
                  styles.cardWrap,
                  { transform: [...position.getTranslateTransform(), { rotate }] },
                ]}
                {...pan.panHandlers}
              >
                <IdeaCard idea={current} />
              </Animated.View>
            )}
          </View>
          <Text style={styles.hint}>← pass · save & trade →</Text>
        </>
      )}

      <Text style={styles.disclaimer} numberOfLines={3}>
        {disclaimer}
      </Text>

      <BrokerSheet
        visible={sheetIdea !== null}
        brokers={brokers}
        onPick={(brokerId) => {
          const idea = sheetIdea;
          setSheetIdea(null);
          if (idea) Linking.openURL(brokerLink(brokerId, idea.id)).catch(() => {});
        }}
        onClose={() => setSheetIdea(null)}
      />
    </SafeAreaView>
  );
}

function TabButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.tabBtn, active && styles.tabActive]}>
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#101017", alignItems: "center" },
  topBar: {
    width: "90%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  title: { color: "#fff", fontSize: 22, fontWeight: "800" },
  tabs: { flexDirection: "row", gap: 6 },
  tabBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16 },
  tabActive: { backgroundColor: "#26262f" },
  tabText: { color: "#8a8a99", fontSize: 13, fontWeight: "600" },
  tabTextActive: { color: "#fff" },
  deck: { flex: 1, width: "90%", marginVertical: 16, justifyContent: "center" },
  savedWrap: { flex: 1, width: "90%", marginVertical: 16 },
  cardWrap: { position: "absolute", width: "100%", height: "92%" },
  behind: { transform: [{ scale: 0.96 }], opacity: 0.6 },
  empty: { color: "#8a8a99", textAlign: "center", fontSize: 16 },
  hint: { color: "#8a8a99", fontSize: 13, marginBottom: 8 },
  disclaimer: {
    color: "#55555f",
    fontSize: 10,
    paddingHorizontal: 24,
    marginBottom: 10,
    textAlign: "center",
  },
});
