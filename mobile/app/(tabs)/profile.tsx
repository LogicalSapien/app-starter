import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import { colors, spacing, radii } from "@/theme";

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
    backgroundColor: colors.primary,
    borderRadius: 40,
    height: 80,
    justifyContent: "center",
    width: 80,
  },
  avatarText: {
    color: colors.white,
    fontSize: 32,
    fontWeight: "700",
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    elevation: 2,
    gap: spacing.sm,
    marginTop: spacing.sm,
    padding: spacing.xl,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    width: "100%",
  },
  cardBody: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: "600",
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    alignItems: "center",
    flex: 1,
    gap: spacing.lg,
    padding: spacing.xl,
    paddingTop: 40,
  },
  email: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: "500",
  },
});
