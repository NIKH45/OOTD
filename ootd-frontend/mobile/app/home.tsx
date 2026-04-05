import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { clearAuthToken, getAuthToken } from "../services/api";
import { colors } from "../src/styles/colors";
import { getInteractivePressableStyle } from "../src/styles/globalStyles";
import { shadows } from "../src/styles/shadows";
import { radii, spacing } from "../src/styles/spacing";
import { typography } from "../src/styles/typography";

export default function HomeScreen(): React.JSX.Element {
  const router = useRouter();
  const [tokenPreview, setTokenPreview] = useState<string>("Loading token...");

  useEffect(() => {
    const loadToken = async (): Promise<void> => {
      const token = await getAuthToken();
      if (!token) {
        setTokenPreview("No token found");
        return;
      }

      // Show only part of token for debug/learning view.
      setTokenPreview(`${token.slice(0, 24)}...`);
    };

    loadToken();
  }, []);

  const handleLogout = async (): Promise<void> => {
    await clearAuthToken();
    router.replace("/signup");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome To OOTD Home</Text>
      <Text style={styles.subtitle}>Signup navigation is working correctly.</Text>
      <Text style={styles.tokenLabel}>Stored token preview:</Text>
      <Text style={styles.tokenValue}>{tokenPreview}</Text>

      <Pressable
        style={(state) => [styles.logoutButton, ...getInteractivePressableStyle(state)]}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  subtitle: {
    ...typography.bodySm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  tokenLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  tokenValue: {
    ...typography.bodySm,
    color: colors.textPrimary,
    marginTop: spacing.xxs,
    marginBottom: spacing.md,
    textAlign: "center",
  },
  logoutButton: {
    backgroundColor: colors.primaryButton,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
    ...shadows.soft,
  },
  logoutText: {
    ...typography.button,
    color: colors.primaryButtonText,
  },
});
