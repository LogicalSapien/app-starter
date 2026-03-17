import { useState, useCallback } from "react";
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
import { useAuth } from "@/contexts/AuthContext";
import { colors, spacing, radii } from "@/theme";

type AuthMode = "login" | "signup" | "forgot";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

interface FieldErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
}

function validateEmail(email: string): string | undefined {
  if (!email.trim()) return "Email is required";
  if (!EMAIL_REGEX.test(email.trim())) return "Enter a valid email address";
  return undefined;
}

function validatePassword(password: string): string | undefined {
  if (!password) return "Password is required";
  if (password.length < MIN_PASSWORD_LENGTH)
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  return undefined;
}

export default function AuthScreen() {
  const { signIn, signUp, resetPassword } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const setMode_ = (next: AuthMode) => {
    setMode(next);
    setConfirmPassword("");
    setErrors({});
    setTouched({});
  };

  const handleBlur = useCallback(
    (field: string) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      setErrors((prev) => {
        const next = { ...prev };
        if (field === "email") next.email = validateEmail(email);
        if (field === "password") next.password = validatePassword(password);
        if (field === "confirmPassword") {
          next.confirmPassword =
            confirmPassword && confirmPassword !== password
              ? "Passwords do not match"
              : undefined;
        }
        return next;
      });
    },
    [email, password, confirmPassword],
  );

  const validate = (): boolean => {
    const next: FieldErrors = {
      email: validateEmail(email),
      password: mode !== "forgot" ? validatePassword(password) : undefined,
      confirmPassword:
        mode === "signup" && password !== confirmPassword
          ? "Passwords do not match"
          : undefined,
    };
    setErrors(next);
    setTouched({ email: true, password: true, confirmPassword: true });
    return !next.email && !next.password && !next.confirmPassword;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      if (mode === "forgot") {
        const { error } = await resetPassword(email.trim());
        if (error) {
          Alert.alert("Error", error.message);
        } else {
          Alert.alert(
            "Check Your Email",
            "If that email is registered, you'll receive a password reset link.",
          );
          setMode_("login");
        }
        return;
      }

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
    } catch {
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const title =
    mode === "login"
      ? "Welcome Back"
      : mode === "signup"
        ? "Create Account"
        : "Reset Password";

  const subtitle =
    mode === "login"
      ? "Sign in to continue"
      : mode === "signup"
        ? "Sign up to get started"
        : "Enter your email to receive a reset link";

  const buttonLabel =
    mode === "login"
      ? "Sign In"
      : mode === "signup"
        ? "Sign Up"
        : "Send Reset Link";

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
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[
                  styles.input,
                  touched.email && errors.email ? styles.inputError : undefined,
                ]}
                placeholder="you@example.com"
                placeholderTextColor={colors.textPlaceholder}
                value={email}
                onChangeText={setEmail}
                onBlur={() => handleBlur("email")}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="emailAddress"
                accessibilityLabel="Email input"
              />
              {touched.email && errors.email ? (
                <Text style={styles.errorText}>{errors.email}</Text>
              ) : null}
            </View>

            {mode !== "forgot" && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={[
                    styles.input,
                    touched.password && errors.password
                      ? styles.inputError
                      : undefined,
                  ]}
                  placeholder="Your password"
                  placeholderTextColor={colors.textPlaceholder}
                  value={password}
                  onChangeText={setPassword}
                  onBlur={() => handleBlur("password")}
                  secureTextEntry
                  textContentType={
                    mode === "signup" ? "newPassword" : "password"
                  }
                  accessibilityLabel="Password input"
                />
                {touched.password && errors.password ? (
                  <Text style={styles.errorText}>{errors.password}</Text>
                ) : null}
              </View>
            )}

            {mode === "signup" && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <TextInput
                  style={[
                    styles.input,
                    touched.confirmPassword && errors.confirmPassword
                      ? styles.inputError
                      : undefined,
                  ]}
                  placeholder="Confirm your password"
                  placeholderTextColor={colors.textPlaceholder}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  onBlur={() => handleBlur("confirmPassword")}
                  secureTextEntry
                  textContentType="newPassword"
                  accessibilityLabel="Confirm password input"
                />
                {touched.confirmPassword && errors.confirmPassword ? (
                  <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                ) : null}
              </View>
            )}

            {mode === "login" && (
              <TouchableOpacity
                onPress={() => setMode_("forgot")}
                accessibilityRole="button"
                accessibilityLabel="Forgot password"
              >
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.button, isSubmitting && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
              accessibilityLabel={buttonLabel}
              accessibilityRole="button"
            >
              {isSubmitting ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.buttonText}>{buttonLabel}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() =>
                setMode_(
                  mode === "login" || mode === "forgot" ? "signup" : "login",
                )
              }
              accessibilityLabel={
                mode === "signup" ? "Switch to sign in" : "Switch to sign up"
              }
              accessibilityRole="button"
            >
              <Text style={styles.toggleText}>
                {mode === "signup"
                  ? "Already have an account? Sign In"
                  : "Don't have an account? Sign Up"}
              </Text>
            </TouchableOpacity>

            {mode === "forgot" && (
              <TouchableOpacity
                style={styles.toggleButton}
                onPress={() => setMode_("login")}
                accessibilityRole="button"
              >
                <Text style={styles.toggleText}>Back to Sign In</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: radii.sm,
    marginTop: spacing.sm,
    paddingVertical: 14,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  container: {
    backgroundColor: colors.surface,
    flex: 1,
  },
  errorText: {
    color: colors.destructive,
    fontSize: 13,
  },
  forgotText: {
    color: colors.primary,
    fontSize: 14,
    textAlign: "right",
  },
  form: {
    gap: spacing.lg,
  },
  header: {
    marginBottom: spacing.xxxl,
  },
  input: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: radii.sm,
    borderWidth: 1,
    color: colors.textPrimary,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inputError: {
    borderColor: colors.destructive,
  },
  inputGroup: {
    gap: 6,
  },
  keyboardView: {
    flex: 1,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.xxl,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 16,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  toggleButton: {
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  toggleText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "500",
  },
});
