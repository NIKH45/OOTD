import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import AuthShell from "../components/auth/AuthShell";
import { signupUser } from "../services/api";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const emailValid = useMemo(() => /^\S+@\S+\.\S+$/.test(form.email), [form.email]);

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

    if (!emailValid) {
      setError("Please enter a valid email address");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const data = await signupUser({
        email: form.email,
        password: form.password,
      });

      const token = data?.token;
      if (!token) {
        setError("Invalid signup response from server");
        return;
      }

      localStorage.setItem("ootd.pending.jwt", token);
      router.push("/complete-profile");
    } catch (apiError) {
      setError(apiError.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      mode="signup"
      formTitle="Create Account"
      formSubtitle="Start with your account, then complete your body profile in the next step."
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
          placeholder="Minimum 6 characters"
        />

        <p className="inline-links">
          Already have an account? <Link href="/login">Sign in</Link>
        </p>

        {error ? <p className="error-text">{error}</p> : null}

        <button type="submit" disabled={loading} className="primary-button">
          {loading ? "Creating account..." : "Continue"}
        </button>
      </form>
    </AuthShell>
  );
}
