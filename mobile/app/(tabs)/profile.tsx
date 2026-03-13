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
  avatarPlaceholder: {
    alignItems: "center",
    backgroundColor: "#2563EB",
    borderRadius: 40,
    height: 80,
    justifyContent: "center",
    width: 80,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "700",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    elevation: 2,
    gap: 8,
    marginTop: 8,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    width: "100%",
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
  content: {
    alignItems: "center",
    flex: 1,
    gap: 16,
    padding: 20,
    paddingTop: 40,
  },
  email: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "500",
  },
});
