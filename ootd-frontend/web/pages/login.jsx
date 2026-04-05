import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import AuthShell from "../components/auth/AuthShell";
import { loginUser } from "../services/api";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const needsProfileCompletion = (user) => {
    const gender = (user?.gender || "").trim().toLowerCase();
    const bodyType = (user?.bodyType || "").trim().toLowerCase();

    const missingGender = !gender || gender === "not specified";
    const missingBodyType = !bodyType;

    return missingGender || missingBodyType;
  };

  const onChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError("");
  };

  const onSubmit = async (event) => {
    event.preventDefault();

    if (!form.email || !form.password) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);

    try {
      const data = await loginUser(form);
      const token = data?.token;

      if (!token) {
        setError("Invalid login response from server");
        return;
      }

      localStorage.setItem("ootd.jwt", token);
      // Route user to profile completion if key fit-profile fields are missing.
      if (needsProfileCompletion(data?.user)) {
        localStorage.setItem("ootd.pending.jwt", token);
        router.push("/complete-profile?from=login");
        return;
      }

      router.push("/home");
    } catch (apiError) {
      setError(apiError.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      mode="login"
      formTitle="Welcome Back"
      formSubtitle="Sign in to continue your outfit journey."
    >
      <form className="auth-form" onSubmit={onSubmit}>
        <label className="field-label">Email</label>
        <input
          className="field-input"
          type="email"
          value={form.email}
          onChange={(event) => onChange("email", event.target.value)}
          placeholder="you@example.com"
        />

        <label className="field-label">Password</label>
        <input
          className="field-input"
          type="password"
          value={form.password}
          onChange={(event) => onChange("password", event.target.value)}
          placeholder="Your password"
        />

        <p className="inline-links">
          New to OOTD? <Link href="/signup">Create an account</Link>
        </p>

        {error ? <p className="error-text">{error}</p> : null}

        <button type="submit" disabled={loading} className="primary-button">
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </AuthShell>
  );
}
