import { useRouter } from "next/router";
import { useState } from "react";
import AuthShell from "../components/auth/AuthShell";
import { completeProfile } from "../services/api";

const GENDER_OPTIONS = [
  "Woman",
  "Man",
  "Non-binary",
  "Prefer not to say",
];

const BODY_TYPE_OPTIONS = [
  "Slim",
  "Athletic",
  "Balanced",
  "Curvy",
  "Plus",
];

export default function CompleteProfilePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    gender: "",
    body_type: "",
    age: "",
    height: "",
    weight: "",
    location: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const fromLogin = router.query.from === "login";

  const onChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError("");
  };

  const onSubmit = async (event) => {
    event.preventDefault();

    if (!form.gender || !form.body_type || !form.age || !form.height || !form.weight || !form.location) {
      setError("All fields are required");
      return;
    }

    const age = Number(form.age);
    const height = Number(form.height);
    const weight = Number(form.weight);

    if (!Number.isInteger(age) || age <= 0) {
      setError("Age must be a positive integer");
      return;
    }

    if (!Number.isFinite(height) || height <= 0 || !Number.isFinite(weight) || weight <= 0) {
      setError("Height and weight must be positive numbers");
      return;
    }

    const token = localStorage.getItem("ootd.pending.jwt") || localStorage.getItem("ootd.jwt");
    if (!token) {
      setError("Session expired. Please sign up again.");
      return;
    }

    setLoading(true);

    try {
      await completeProfile(
        {
          gender: form.gender,
          body_type: form.body_type,
          age,
          height,
          weight,
          location: form.location,
        },
        token
      );

      localStorage.setItem("ootd.jwt", token);
      localStorage.removeItem("ootd.pending.jwt");
      router.push("/home");
    } catch (apiError) {
      setError(apiError.message || "Could not save profile details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      mode="signup"
      formTitle={fromLogin ? "Finish Your Style Profile" : "Complete Your Profile"}
      formSubtitle={
        fromLogin
          ? "Add your body and location details to unlock better outfit recommendations."
          : "Add your body and location details for better outfit recommendations."
      }
    >
      <form className="auth-form" onSubmit={onSubmit}>
        <label className="field-label">Gender</label>
        <div className="option-grid" role="radiogroup" aria-label="Gender options">
          {GENDER_OPTIONS.map((option) => {
            const isActive = form.gender === option;
            return (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={isActive}
                className={`option-chip ${isActive ? "active" : ""}`}
                onClick={() => onChange("gender", option)}
              >
                {option}
              </button>
            );
          })}
        </div>
        <p className="field-helper">Pick the option that best matches you.</p>

        <label className="field-label">Body Type</label>
        <div className="option-grid" role="radiogroup" aria-label="Body type options">
          {BODY_TYPE_OPTIONS.map((option) => {
            const isActive = form.body_type === option;
            return (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={isActive}
                className={`option-chip ${isActive ? "active" : ""}`}
                onClick={() => onChange("body_type", option)}
              >
                {option}
              </button>
            );
          })}
        </div>
        <p className="field-helper">Used to personalize outfit fit and silhouettes.</p>

        <label className="field-label">Age</label>
        <input
          className="field-input"
          type="number"
          value={form.age}
          onChange={(event) => onChange("age", event.target.value)}
          placeholder="e.g. 24"
        />

        <label className="field-label">Height</label>
        <input
          className="field-input"
          type="number"
          value={form.height}
          onChange={(event) => onChange("height", event.target.value)}
          placeholder="e.g. 170"
        />

        <label className="field-label">Weight</label>
        <input
          className="field-input"
          type="number"
          value={form.weight}
          onChange={(event) => onChange("weight", event.target.value)}
          placeholder="e.g. 65"
        />

        <label className="field-label">Location</label>
        <input
          className="field-input"
          type="text"
          value={form.location}
          onChange={(event) => onChange("location", event.target.value)}
          placeholder="e.g. Bangalore"
        />

        {error ? <p className="error-text">{error}</p> : null}

        <button type="submit" disabled={loading} className="primary-button">
          {loading ? "Saving profile..." : "Finish Setup"}
        </button>
      </form>
    </AuthShell>
  );
}
