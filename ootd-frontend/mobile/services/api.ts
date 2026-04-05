import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

export interface SignupRequestBody {
  email: string;
  password: string;
  username: string;
  gender: string;
  age: number;
  height: number;
  weight: number;
  location: string;
  // Optional profile attributes for future onboarding steps.
  body_type?: string;
  style_preference?: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  gender: string;
  age: number;
  height: number;
  weight: number;
  location: string;
  createdAt: string;
}

export interface SignupResponse {
  token: string;
  user: User;
}

export class ApiError extends Error {
  status: number | null;
  details: unknown;

  constructor(message: string, status: number | null = null, details: unknown = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL?.trim() || "http://localhost:3001";
const AUTH_TOKEN_STORAGE_KEY = "ootd.auth.token";

const readJsonSafely = async (response: Response): Promise<unknown> => {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  return null;
};

export const signup = async (payload: SignupRequestBody): Promise<SignupResponse> => {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    throw new ApiError("Network error. Please check your connection and try again.");
  }

  const data = await readJsonSafely(response);

  if (!response.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof data.message === "string"
        ? data.message
        : "Signup failed. Please try again.";

    throw new ApiError(message, response.status, data);
  }

  return data as SignupResponse;
};

// Stores auth token using localStorage on web and AsyncStorage on native platforms.
export const storeAuthToken = async (token: string): Promise<void> => {
  if (Platform.OS === "web") {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
    }
    return;
  }

  await AsyncStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
};

export const getAuthToken = async (): Promise<string | null> => {
  if (Platform.OS === "web") {
    if (typeof localStorage !== "undefined") {
      return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    }
    return null;
  }

  return AsyncStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
};

export const clearAuthToken = async (): Promise<void> => {
  if (Platform.OS === "web") {
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    }
    return;
  }

  await AsyncStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
};
