import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../src/contexts/AuthContext";

type AuthMode = "login" | "signup";

export default function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleMode = () => {
    setMode((prev) => (prev === "login" ? "signup" : "login"));
    setConfirmPassword("");
  };

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    if (mode === "signup" && password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "login") {
        const { error } = await signIn(email.trim(), password);
        if (error) {
          Alert.alert("Login Failed", error.message);
        }
      } else {
        const { error } = await signUp(email.trim(), password);
        if (error) {
          Alert.alert("Sign Up Failed", error.message);
        } else {
          Alert.alert(
            "Check Your Email",
            "We sent you a confirmation link. Please verify your email to continue.",
          );
        }
      }
    } catch (err) {
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </Text>
            <Text style={styles.subtitle}>
              {mode === "login"
                ? "Sign in to continue"
                : "Sign up to get started"}
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="emailAddress"
                accessibilityLabel="Email input"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Your password"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                textContentType={mode === "signup" ? "newPassword" : "password"}
                accessibilityLabel="Password input"
              />
            </View>

            {mode === "signup" && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Confirm your password"
                  placeholderTextColor="#9CA3AF"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  textContentType="newPassword"
                  accessibilityLabel="Confirm password input"
                />
              </View>
            )}

            <TouchableOpacity
              style={[styles.button, isSubmitting && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
              accessibilityLabel={mode === "login" ? "Sign In" : "Sign Up"}
              accessibilityRole="button"
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>
                  {mode === "login" ? "Sign In" : "Sign Up"}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toggleButton}
              onPress={toggleMode}
              accessibilityLabel={
                mode === "login" ? "Switch to sign up" : "Switch to sign in"
              }
              accessibilityRole="button"
            >
              <Text style={styles.toggleText}>
                {mode === "login"
                  ? "Don't have an account? Sign Up"
                  : "Already have an account? Sign In"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: "#2563EB",
    borderRadius: 8,
    marginTop: 8,
    paddingVertical: 14,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  container: {
    backgroundColor: "#FFFFFF",
    flex: 1,
  },
  form: {
    gap: 16,
  },
  header: {
    marginBottom: 32,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderColor: "#D1D5DB",
    borderRadius: 8,
    borderWidth: 1,
    color: "#111827",
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inputGroup: {
    gap: 6,
  },
  keyboardView: {
    flex: 1,
  },
  label: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "600",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  subtitle: {
    color: "#6B7280",
    fontSize: 16,
  },
  title: {
    color: "#111827",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
  },
  toggleButton: {
    alignItems: "center",
    paddingVertical: 12,
  },
  toggleText: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "500",
  },
});
