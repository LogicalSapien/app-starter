import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useState, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../src/contexts/AuthContext";

export default function HomeScreen() {
  const { session } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Fetch data here
    setRefreshing(false);
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>
            Welcome{session?.user?.email ? `, ${session.user.email}` : ""}
          </Text>
          <Text style={styles.subtitle}>Your dashboard is ready.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Getting Started</Text>
          <Text style={styles.cardBody}>
            This is your home screen. Replace this placeholder with your app
            content.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    elevation: 2,
    gap: 8,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  cardBody: {
    color: "#6B7280",
    fontSize: 15,
    lineHeight: 22,
  },
  cardTitle: {
    color: "#111827",
    fontSize: 17,
    fontWeight: "600",
  },
  container: {
    backgroundColor: "#F9FAFB",
    flex: 1,
  },
  greeting: {
    color: "#111827",
    fontSize: 24,
    fontWeight: "700",
  },
  header: {
    gap: 4,
  },
  scrollContent: {
    gap: 20,
    padding: 20,
  },
  subtitle: {
    color: "#6B7280",
    fontSize: 15,
  },
});
