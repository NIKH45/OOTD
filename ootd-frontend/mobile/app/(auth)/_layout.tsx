import { Stack } from "expo-router";
import React from "react";

// Auth stack keeps signup UI full-screen and focused.
export default function AuthLayout(): React.JSX.Element {
  return (
    <Stack>
      <Stack.Screen name="signup" options={{ headerShown: false }} />
    </Stack>
  );
}
