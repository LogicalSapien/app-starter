import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Switch,
} from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthContext";
import { colors, spacing, radii } from "@/theme";

export default function SettingsScreen() {
  const { signOut } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

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

  const handleAppearance = () => {
    Alert.alert(
      "Appearance",
      "Theme switching is not yet implemented. Wire up your preferred theme solution here.",
    );
  };

  const handlePrivacy = () => {
    Alert.alert(
      "Privacy",
      "Privacy settings are not yet implemented. Add your privacy controls here.",
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General</Text>

          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Notifications</Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{
                  false: colors.border,
                  true: colors.primary,
                }}
                accessibilityLabel="Toggle notifications"
              />
            </View>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.row}
              onPress={handleAppearance}
              accessibilityRole="button"
            >
              <Text style={styles.rowLabel}>Appearance</Text>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.textPlaceholder}
              />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.row}
              onPress={handlePrivacy}
              accessibilityRole="button"
            >
              <Text style={styles.rowLabel}>Privacy</Text>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.textPlaceholder}
              />
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
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    flex: 1,
    gap: spacing.xxl,
    padding: spacing.xl,
  },
  destructive: {
    color: colors.destructive,
    fontWeight: "500",
  },
  divider: {
    backgroundColor: colors.divider,
    height: StyleSheet.hairlineWidth,
    marginLeft: spacing.lg,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
  },
  rowLabel: {
    color: colors.textPrimary,
    fontSize: 16,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
    paddingHorizontal: spacing.xs,
    textTransform: "uppercase",
  },
});
