import axios from "axios";

const resolveApiBaseURL = () => {
  // Allows override when running against remote/staging backend.
  const envBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (envBaseUrl) {
    return envBaseUrl;
  }

  // Keep hostname aligned in local dev to avoid localhost vs 127.0.0.1 mismatch.
  if (typeof window !== "undefined" && window.location.hostname === "127.0.0.1") {
    return "http://127.0.0.1:3001/api";
  }

  return "http://localhost:3001/api";
};

export const apiClient = axios.create({
  // Call backend directly to avoid 3000-proxy 403 issues.
  baseURL: resolveApiBaseURL(),
  timeout: 10000,
});

const getErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.response?.status === 403) {
    return "Request was blocked (403). Verify backend is running on http://localhost:3001.";
  }

  if (error.code === "ECONNABORTED" || error.message === "Network Error" || !error.response) {
    return "Server not reachable";
  }

  return "Something went wrong. Please try again.";
};

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Full error log for debugging requested in requirements.
    console.error("[API ERROR]", {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
      baseURL: error.config?.baseURL,
    });

    return Promise.reject(error);
  }
);

export const signupUser = async (payload) => {
  try {
    const response = await apiClient.post("/auth/signup", payload);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const completeProfile = async (payload, token) => {
  try {
    const response = await apiClient.post("/auth/profile", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const loginUser = async (payload) => {
  try {
    const response = await apiClient.post("/auth/login", payload);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};
