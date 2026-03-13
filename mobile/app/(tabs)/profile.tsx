import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../src/contexts/AuthContext";

export default function ProfileScreen() {
  const { session } = useAuth();

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <View style={styles.content}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>
            {session?.user?.email?.charAt(0).toUpperCase() ?? "?"}
          </Text>
        </View>

        <Text style={styles.email}>{session?.user?.email ?? "No email"}</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Profile</Text>
          <Text style={styles.cardBody}>
            Customize this screen with user profile details, preferences, and
            account information.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    flex: 1,
    alignItems: "center",
    padding: 20,
    gap: 16,
    paddingTop: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  email: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    gap: 8,
    marginTop: 8,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111827",
  },
  cardBody: {
    fontSize: 15,
    color: "#6B7280",
    lineHeight: 22,
  },
});
