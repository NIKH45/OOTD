import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../src/styles/colors";
import { radii, spacing } from "../src/styles/spacing";
import { typography } from "../src/styles/typography";

interface FormSelectProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  error?: string;
}

// Reusable select-like UI for React Native without external picker libraries.
export default function FormSelect({
  label,
  value,
  options,
  onChange,
  error,
}: FormSelectProps): React.JSX.Element {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.optionsContainer}>
        {options.map((option) => {
          const isSelected = value === option;

          return (
            <Pressable
              key={option}
              onPress={() => onChange(option)}
              style={[styles.optionButton, isSelected ? styles.optionButtonSelected : null]}
            >
              <Text style={[styles.optionText, isSelected ? styles.optionTextSelected : null]}>
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: spacing.xxs,
    textTransform: "capitalize",
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xxs,
  },
  optionButton: {
    borderRadius: radii.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  optionButtonSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accentStrong,
  },
  optionText: {
    ...typography.bodySm,
    color: colors.textSecondary,
    textTransform: "capitalize",
  },
  optionTextSelected: {
    color: colors.textPrimary,
    fontWeight: "600",
  },
  errorText: {
    marginTop: spacing.xxs,
    ...typography.caption,
    color: colors.danger,
  },
});
