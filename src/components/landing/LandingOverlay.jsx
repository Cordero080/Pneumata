import { useState, useEffect } from "react";
import AnimatedScene from "../scene/AnimatedScene";
import "./LandingOverlay.scss";

const ENDPOINT = "https://pneumata-backend.onrender.com/subscribe";
// Fallback: show content after this many ms even if animation hasn't fired
const FALLBACK_MS = 12000;

function LandingOverlay({ onEnter, darkMode, meshMode }) {
  const [animDone, setAnimDone] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | done | error
  const hasInput = email.length > 0;

  useEffect(() => {
    const t = setTimeout(() => setAnimDone(true), FALLBACK_MS);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || status === "sending") return;
    setStatus("sending");
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  const handleEnter = () => {
    localStorage.setItem("pneumata_subscribed", "1");
    onEnter();
  };

  return (
    <div className="landing-overlay">
      {/* Full-screen 3D canvas background */}
      <div className="landing-bg">
        <AnimatedScene
          darkMode={darkMode ?? true}
          meshMode={meshMode ?? 2}
          onSecondLoop={() => setAnimDone(true)}
        />
      </div>

      {/* Content panel — fades in after animation completes */}
      <div
        className={`landing-content${animDone ? " landing-content--visible" : ""}`}
      >
        <div className="landing-panel">
          <div className="landing-title">
            <h1>Pneumata</h1>
            <p className="landing-sub">
              An interactive system for exploring human cognition
            </p>
          </div>

          <div className="landing-divider" />

          {status === "done" ? (
            <p className="landing-confirm">Transmission received.</p>
          ) : (
            <form className="landing-form" onSubmit={handleSubmit}>
              <input
                className="landing-input"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button
                className={`landing-submit${hasInput ? " landing-submit--active" : ""}`}
                type="submit"
                disabled={status === "sending"}
              >
                {status === "sending" ? "..." : "Signal"}
              </button>
            </form>
          )}

          {status === "error" && (
            <p className="landing-error">Transmission failed. Try again.</p>
          )}

          <button className="landing-enter" onClick={handleEnter}>
            Explore
          </button>
        </div>
      </div>
    </div>
  );
}

export default LandingOverlay;
