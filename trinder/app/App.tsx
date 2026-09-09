import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Linking,
  PanResponder,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { brokerLink, fetchIdeas, TradeIdea } from "./src/api";
import { IdeaCard } from "./src/IdeaCard";

const { width: SCREEN_W } = Dimensions.get("window");
const SWIPE_THRESHOLD = SCREEN_W * 0.3;
const DEFAULT_BROKER = "icmarkets";

export default function App() {
  const [ideas, setIdeas] = useState<TradeIdea[]>([]);
  const [disclaimer, setDisclaimer] = useState("");
  const [index, setIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const position = useRef(new Animated.ValueXY()).current;
  const indexRef = useRef(0);
  const ideasRef = useRef<TradeIdea[]>([]);
  indexRef.current = index;
  ideasRef.current = ideas;

  useEffect(() => {
    fetchIdeas()
      .then((r) => {
        setIdeas(r.ideas);
        setDisclaimer(r.disclaimer);
      })
      .catch(() => setError("Couldn't load ideas — is the server running?"));
  }, []);

  const advance = (liked: boolean) => {
    const idea = ideasRef.current[indexRef.current];
    if (liked && idea) {
      // Swipe right = "I want to trade this myself" → open the broker's own
      // platform via the affiliate link. The user takes every trade there;
      // the app never places orders.
      Linking.openURL(brokerLink(DEFAULT_BROKER, idea.id)).catch(() => {});
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

  const current = ideas[index];
  const next = ideas[index + 1];

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="light" />
      <Text style={styles.title}>Trinder</Text>
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
      <Text style={styles.hint}>← pass · trade with broker →</Text>
      <Text style={styles.disclaimer} numberOfLines={4}>
        {disclaimer}
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#101017", alignItems: "center" },
  title: { color: "#fff", fontSize: 22, fontWeight: "800", marginTop: 12 },
  deck: { flex: 1, width: "90%", marginVertical: 16, justifyContent: "center" },
  cardWrap: { position: "absolute", width: "100%", height: "92%" },
  behind: { transform: [{ scale: 0.96 }], opacity: 0.6 },
  empty: { color: "#8a8a99", textAlign: "center", fontSize: 16 },
  hint: { color: "#8a8a99", fontSize: 13, marginBottom: 8 },
  disclaimer: { color: "#55555f", fontSize: 10, paddingHorizontal: 24, marginBottom: 10, textAlign: "center" },
});
