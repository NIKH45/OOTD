import { Redirect } from "expo-router";
import React from "react";

// App entry route forwards users to signup by default.
export default function Index(): React.JSX.Element {
  return <Redirect href="/signup" />;
}
