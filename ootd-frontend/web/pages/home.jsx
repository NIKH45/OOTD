import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function HomePage() {
  const router = useRouter();
  const [tokenPreview, setTokenPreview] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("ootd.jwt");
    if (!token) {
      router.replace("/login");
      return;
    }

    setTokenPreview(`${token.slice(0, 24)}...`);
  }, [router]);

  const logout = () => {
    localStorage.removeItem("ootd.jwt");
    router.push("/login");
  };

  return (
    <main className="home-wrap">
      <section className="home-card">
        <h1 className="home-title">Welcome to OOTD</h1>
        <p className="home-muted">
          You are signed in. Your style profile is now connected to the recommendation engine.
        </p>
        {tokenPreview ? <p className="home-muted">Session token: {tokenPreview}</p> : null}

        <button type="button" className="primary-button" onClick={logout}>
          Logout
        </button>
      </section>
    </main>
  );
}
