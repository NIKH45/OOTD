import React from "react";
import {
  KeyboardTypeOptions,
  StyleSheet,
  Text,
  TextStyle,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from "react-native";
import { colors } from "../src/styles/colors";
import { radii, spacing } from "../src/styles/spacing";
import { shadows } from "../src/styles/shadows";
import { typography } from "../src/styles/typography";

interface FormInputProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: TextInputProps["autoCapitalize"];
  autoCorrect?: boolean;
  error?: string;
}

// Reusable input used by the signup form so all fields share one UI pattern.
export default function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "none",
  autoCorrect = false,
  error,
}: FormInputProps): React.JSX.Element {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>

      {/* Keep depth/border styles on a View wrapper so TextInput remains purely text style typed. */}
      <View style={[styles.inputContainer, error ? styles.inputContainerError : null]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          style={styles.input}
        />
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

interface FormInputStyles {
  wrapper: ViewStyle;
  label: TextStyle;
  inputContainer: ViewStyle;
  inputContainerError: ViewStyle;
  input: TextStyle;
  errorText: TextStyle;
}

const styles = StyleSheet.create<FormInputStyles>({
  wrapper: {
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: spacing.xxs,
  },
  inputContainer: {
    borderWidth: 0,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
    ...shadows.soft,
  },
  inputContainerError: {
    borderWidth: 1,
    borderColor: colors.danger,
  },
  input: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
    ...typography.bodyMd,
    color: colors.textPrimary,
  },
  errorText: {
    marginTop: spacing.xxs,
    ...typography.caption,
    color: colors.danger,
  },
});
