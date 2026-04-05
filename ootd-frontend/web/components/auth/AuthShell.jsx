import Link from "next/link";

export default function AuthShell({ mode, formTitle, formSubtitle, children }) {
  const isLogin = mode === "login";

  return (
    <main className="auth-page">
      <div className="auth-shell">
        <section className="brand-panel">
          <p className="brand-kicker">OOTD</p>
          <h1 className="brand-title">Style intelligence for everyday fashion decisions.</h1>
          <p className="brand-description">
            OOTD helps you pick better looks faster by combining your profile, style preference,
            and wardrobe intent into clean outfit-ready guidance.
          </p>

          <ul className="brand-points">
            <li>Discover looks aligned to your personal style.</li>
            <li>Reduce decision fatigue before every outing.</li>
            <li>Build consistency across casual, formal, and streetwear moods.</li>
          </ul>
        </section>

        <section className="auth-card">
          <div className="auth-switch">
            <Link href="/login" className={isLogin ? "auth-tab active" : "auth-tab"}>
              Sign In
            </Link>
            <Link href="/signup" className={isLogin ? "auth-tab" : "auth-tab active"}>
              Sign Up
            </Link>
          </div>

          <h2 className="auth-title">{formTitle}</h2>
          <p className="auth-subtitle">{formSubtitle}</p>

          {children}
        </section>
      </div>
    </main>
  );
}
