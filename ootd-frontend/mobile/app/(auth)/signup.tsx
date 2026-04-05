import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import FormInput from "../../components/FormInput";
import FormSelect from "../../components/FormSelect";
import { ApiError, signup, SignupRequestBody, storeAuthToken } from "../../services/api";
import { colors } from "../../src/styles/colors";
import { getInteractivePressableStyle } from "../../src/styles/globalStyles";
import { shadows } from "../../src/styles/shadows";
import { layout, radii, spacing } from "../../src/styles/spacing";
import { typography } from "../../src/styles/typography";

type SignupFieldKey =
  | "email"
  | "password"
  | "username"
  | "gender"
  | "bodyType"
  | "stylePreference"
  | "age"
  | "height"
  | "weight"
  | "location";

interface SignupFormValues {
  email: string;
  password: string;
  username: string;
  gender: string;
  bodyType: string;
  stylePreference: string;
  age: string;
  height: string;
  weight: string;
  location: string;
}

type SignupFormErrors = Partial<Record<SignupFieldKey, string>>;

type FieldType = "text" | "email" | "password" | "numeric" | "select";

interface StepFieldConfig {
  name: SignupFieldKey;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: string[];
}

interface StepConfig {
  title: string;
  description: string;
  fields: StepFieldConfig[];
}

const INITIAL_FORM: SignupFormValues = {
  email: "",
  password: "",
  username: "",
  gender: "",
  bodyType: "",
  stylePreference: "",
  age: "",
  height: "",
  weight: "",
  location: "",
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NUMERIC_FIELDS: SignupFieldKey[] = ["age", "height", "weight"];
const HOME_ROUTE = "/home";

// Config-driven steps keep the flow reusable and easy to extend.
const SIGNUP_STEPS: StepConfig[] = [
  {
    title: "Account Details",
    description: "Start with your basic account information.",
    fields: [
      {
        name: "email",
        label: "Email",
        type: "email",
        required: true,
        placeholder: "you@example.com",
      },
      {
        name: "password",
        label: "Password",
        type: "password",
        required: true,
        placeholder: "Minimum 6 characters",
      },
      {
        name: "username",
        label: "Username",
        type: "text",
        required: true,
        placeholder: "Your display name",
      },
    ],
  },
  {
    title: "Profile Details",
    description: "Add profile preferences to personalize your experience.",
    fields: [
      {
        name: "gender",
        label: "Gender",
        type: "select",
        required: true,
        options: ["male", "female", "other"],
      },
      {
        name: "bodyType",
        label: "Body Type",
        type: "select",
        required: true,
        options: ["slim", "average", "athletic", "heavy"],
      },
      {
        name: "stylePreference",
        label: "Style Preference",
        type: "select",
        required: true,
        options: ["casual", "formal", "streetwear", "minimal"],
      },
      {
        name: "age",
        label: "Age",
        type: "numeric",
        required: true,
        placeholder: "e.g. 25",
      },
      {
        name: "height",
        label: "Height",
        type: "numeric",
        required: true,
        placeholder: "e.g. 175",
      },
      {
        name: "weight",
        label: "Weight",
        type: "numeric",
        required: true,
        placeholder: "e.g. 70",
      },
      {
        name: "location",
        label: "Location",
        type: "text",
        required: true,
        placeholder: "e.g. Bangalore",
      },
    ],
  },
];

const validateField = (field: StepFieldConfig, values: SignupFormValues): string | undefined => {
  const value = values[field.name].trim();

  if (field.required && value.length === 0) {
    return `${field.label} is required`;
  }

  if (field.name === "email" && value.length > 0 && !EMAIL_REGEX.test(value)) {
    return "Email format is invalid";
  }

  if (field.name === "password" && value.length > 0 && value.length < 6) {
    return "Password must be at least 6 characters";
  }

  if (NUMERIC_FIELDS.includes(field.name) && value.length > 0) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return `${field.label} must be a positive number`;
    }
  }

  return undefined;
};

const validateStep = (step: StepConfig, values: SignupFormValues): SignupFormErrors => {
  const errors: SignupFormErrors = {};

  step.fields.forEach((field) => {
    const fieldError = validateField(field, values);
    if (fieldError) {
      errors[field.name] = fieldError;
    }
  });

  return errors;
};

const validateAllSteps = (steps: StepConfig[], values: SignupFormValues): SignupFormErrors => {
  const errors: SignupFormErrors = {};

  steps.forEach((step) => {
    const stepErrors = validateStep(step, values);
    Object.assign(errors, stepErrors);
  });

  return errors;
};

export default function SignupScreen(): React.JSX.Element {
  const router = useRouter();

  const [formValues, setFormValues] = useState<SignupFormValues>(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState<SignupFormErrors>({});
  const [apiError, setApiError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  const currentStep = SIGNUP_STEPS[currentStepIndex];
  const isLastStep = currentStepIndex === SIGNUP_STEPS.length - 1;

  const progressText = useMemo(
    () => `Step ${currentStepIndex + 1} of ${SIGNUP_STEPS.length}`,
    [currentStepIndex]
  );

  const handleInputChange = (field: SignupFieldKey, value: string): void => {
    setFormValues((previous) => ({
      ...previous,
      [field]: value,
    }));

    // Clear only the edited field error for better UX.
    setFormErrors((previous) => ({
      ...previous,
      [field]: undefined,
    }));
    setApiError("");
  };

  const handleNext = (): void => {
    const stepErrors = validateStep(currentStep, formValues);
    if (Object.keys(stepErrors).length > 0) {
      setFormErrors((previous) => ({
        ...previous,
        ...stepErrors,
      }));
      return;
    }

    setCurrentStepIndex((previous) => previous + 1);
  };

  const handleBack = (): void => {
    if (currentStepIndex === 0) {
      return;
    }

    setCurrentStepIndex((previous) => previous - 1);
  };

  const handleSubmit = async (): Promise<void> => {
    const validationErrors = validateAllSteps(SIGNUP_STEPS, formValues);
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }

    setLoading(true);
    setApiError("");

    const requestPayload: SignupRequestBody = {
      email: formValues.email.trim(),
      password: formValues.password,
      username: formValues.username.trim(),
      gender: formValues.gender.trim(),
      age: Number(formValues.age),
      height: Number(formValues.height),
      weight: Number(formValues.weight),
      location: formValues.location.trim(),
      body_type: formValues.bodyType.trim(),
      style_preference: formValues.stylePreference.trim(),
    };

    try {
      const response = await signup(requestPayload);
      await storeAuthToken(response.token);

      Alert.alert("Signup Successful", "Your account has been created.");
      router.replace(HOME_ROUTE);
    } catch (error) {
      if (error instanceof ApiError) {
        setApiError(error.message);
      } else {
        setApiError("Unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field: StepFieldConfig): React.JSX.Element => {
    if (field.type === "select") {
      return (
        <FormSelect
          key={field.name}
          label={field.label}
          value={formValues[field.name]}
          options={field.options || []}
          onChange={(value) => handleInputChange(field.name, value)}
          error={formErrors[field.name]}
        />
      );
    }

    return (
      <FormInput
        key={field.name}
        label={field.label}
        value={formValues[field.name]}
        onChangeText={(value) => handleInputChange(field.name, value)}
        placeholder={field.placeholder}
        secureTextEntry={field.type === "password"}
        keyboardType={field.type === "numeric" ? "numeric" : field.type === "email" ? "email-address" : "default"}
        autoCapitalize={field.type === "email" || field.type === "password" ? "none" : "words"}
        error={formErrors[field.name]}
      />
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressBadge}>{progressText}</Text>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${((currentStepIndex + 1) / SIGNUP_STEPS.length) * 100}%` },
                ]}
              />
            </View>
          </View>

          <Text style={styles.heading}>{currentStep.title}</Text>
          <Text style={styles.subheading}>{currentStep.description}</Text>

          {currentStep.fields.map(renderField)}

          {apiError ? <Text style={styles.apiError}>{apiError}</Text> : null}

          <View style={styles.buttonRow}>
            <Pressable
              style={(state) => [
                styles.backButton,
                ...getInteractivePressableStyle(state),
                currentStepIndex === 0 || loading ? styles.backButtonDisabled : null,
              ]}
              onPress={handleBack}
              disabled={currentStepIndex === 0 || loading}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </Pressable>

            <Pressable
              style={(state) => [
                styles.submitButton,
                ...getInteractivePressableStyle(state),
                loading ? styles.submitButtonDisabled : null,
              ]}
              onPress={isLastStep ? handleSubmit : handleNext}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.primaryButtonText} />
              ) : (
                <Text style={styles.submitButtonText}>{isLastStep ? "Submit" : "Next"}</Text>
              )}
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
  },
  card: {
    width: "100%",
    maxWidth: layout.maxFormWidth,
    alignSelf: "center",
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
    ...shadows.medium,
  },
  progressHeader: {
    marginBottom: spacing.xs,
  },
  progressBadge: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xxs,
  },
  progressTrack: {
    height: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceSoft,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: radii.pill,
    backgroundColor: colors.accentStrong,
  },
  heading: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.xxs,
  },
  subheading: {
    ...typography.bodySm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  apiError: {
    ...typography.caption,
    color: colors.danger,
    marginTop: spacing.xxs,
    marginBottom: spacing.xs,
  },
  buttonRow: {
    marginTop: spacing.xs,
    flexDirection: "row",
    gap: spacing.xxs,
  },
  backButton: {
    flex: 1,
    borderRadius: radii.sm,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonDisabled: {
    opacity: 0.5,
  },
  backButtonText: {
    ...typography.button,
    color: colors.textSecondary,
  },
  submitButton: {
    flex: 1,
    borderRadius: radii.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primaryButton,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.soft,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    ...typography.button,
    color: colors.primaryButtonText,
  },
});
