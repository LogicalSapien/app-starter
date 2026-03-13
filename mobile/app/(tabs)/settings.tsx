import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../src/contexts/AuthContext";

export default function SettingsScreen() {
  const { signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General</Text>

          <View style={styles.card}>
            <TouchableOpacity style={styles.row} accessibilityRole="button">
              <Text style={styles.rowLabel}>Notifications</Text>
              <Text style={styles.rowChevron}>{">"}</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.row} accessibilityRole="button">
              <Text style={styles.rowLabel}>Appearance</Text>
              <Text style={styles.rowChevron}>{">"}</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.row} accessibilityRole="button">
              <Text style={styles.rowLabel}>Privacy</Text>
              <Text style={styles.rowChevron}>{">"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <View style={styles.card}>
            <TouchableOpacity
              style={styles.row}
              onPress={handleSignOut}
              accessibilityRole="button"
              accessibilityLabel="Sign out"
            >
              <Text style={[styles.rowLabel, styles.destructive]}>
                Sign Out
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  container: {
    backgroundColor: "#F9FAFB",
    flex: 1,
  },
  content: {
    flex: 1,
    gap: 24,
    padding: 20,
  },
  destructive: {
    color: "#DC2626",
    fontWeight: "500",
  },
  divider: {
    backgroundColor: "#E5E7EB",
    height: StyleSheet.hairlineWidth,
    marginLeft: 16,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowChevron: {
    color: "#9CA3AF",
    fontSize: 16,
    fontWeight: "600",
  },
  rowLabel: {
    color: "#111827",
    fontSize: 16,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
    paddingHorizontal: 4,
    textTransform: "uppercase",
  },
});
