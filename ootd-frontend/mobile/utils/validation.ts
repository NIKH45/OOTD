export interface SignupFormValues {
  email: string;
  password: string;
  username: string;
  gender: string;
  age: string;
  height: string;
  weight: string;
  location: string;
}

export type SignupFormErrors = Partial<Record<keyof SignupFormValues, string>>;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isPositiveNumber = (value: string): boolean => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0;
};

// Centralized validation keeps form logic readable and easy to test.
export const validateSignupForm = (values: SignupFormValues): SignupFormErrors => {
  const errors: SignupFormErrors = {};

  if (!values.email.trim()) {
    errors.email = "Email is required";
  } else if (!emailRegex.test(values.email.trim())) {
    errors.email = "Email format is invalid";
  }

  if (!values.password.trim()) {
    errors.password = "Password is required";
  } else if (values.password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }

  if (!values.username.trim()) {
    errors.username = "Username is required";
  }

  if (!values.gender.trim()) {
    errors.gender = "Gender is required";
  }

  if (!values.age.trim()) {
    errors.age = "Age is required";
  } else if (!isPositiveNumber(values.age)) {
    errors.age = "Age must be a positive number";
  }

  if (!values.height.trim()) {
    errors.height = "Height is required";
  } else if (!isPositiveNumber(values.height)) {
    errors.height = "Height must be a positive number";
  }

  if (!values.weight.trim()) {
    errors.weight = "Weight is required";
  } else if (!isPositiveNumber(values.weight)) {
    errors.weight = "Weight must be a positive number";
  }

  if (!values.location.trim()) {
    errors.location = "Location is required";
  }

  return errors;
};
