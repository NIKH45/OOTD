import { Stack } from "expo-router";
import React from "react";
import { colors } from "../src/styles/colors";
import { typography } from "../src/styles/typography";

// Root stack for the app.
export default function RootLayout(): React.JSX.Element {
  return (
    <Stack
      screenOptions={{
        headerTitleAlign: "center",
        headerStyle: {
          backgroundColor: colors.backgroundAlt,
        },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: {
          ...typography.bodyMd,
          color: colors.textPrimary,
          fontWeight: "600",
        },
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="home" options={{ title: "Home" }} />
    </Stack>
  );
}
