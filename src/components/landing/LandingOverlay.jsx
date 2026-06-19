import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import "./LandingOverlay.scss";

const ENDPOINT = "https://pneumata-backend.onrender.com/subscribe";
const REVEAL_DURATION_MS = 920;
const ENTRY_PATHS = [
  {
    key: "body",
    label: "Full Body",
    detail: "Whole chassis",
  },
  {
    key: "heart",
    label: "Heart",
    detail: "Power relay",
  },
  {
    key: "lungs",
    label: "Lungs",
    detail: "Cooling array",
  },
  {
    key: "brain",
    label: "Brain",
    detail: "Logic core",
  },
  {
    key: "nervous",
    label: "Nervous",
    detail: "Signal bus",
  },
];

const pathGridVariants = {
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
const pathCardVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.25, ease: "easeOut" },
  },
};

function PathCard({ path, isActive, onSelect, disabled }) {
  return (
    <motion.button
      className={`landing-path${isActive ? " landing-path--active" : ""}`}
      onClick={() => onSelect(path.key)}
      disabled={disabled}
      variants={pathCardVariants}
      whileTap={{ scale: 0.98 }}
    >
      <span className="landing-path__label">{path.label}</span>
      <span className="landing-path__detail">{path.detail}</span>
    </motion.button>
  );
}

function LandingOverlay({ onPreviewEntry, onEnter }) {
  const [email, setEmail] = useState("");
  const alreadySubscribed = !!localStorage.getItem("pneumata_subscribed");
  const [status, setStatus] = useState(alreadySubscribed ? "done" : "idle");
  const [entryPhase, setEntryPhase] = useState("idle");
  const [selectedPath, setSelectedPath] = useState(null);
  const [flashMode, setFlashMode] = useState(null);
  const hasInput = email.length > 0;

  useEffect(() => {
    if (status === "done" && entryPhase === "idle") {
      setEntryPhase("choosing");
    }
  }, [entryPhase, status]);

  useEffect(() => {
    if (entryPhase !== "revealing") return undefined;

    const timer = window.setTimeout(() => {
      onEnter(selectedPath);
    }, REVEAL_DURATION_MS);

    return () => window.clearTimeout(timer);
  }, [entryPhase, onEnter, selectedPath]);

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

  const handlePathSelect = (pathKey) => {
    localStorage.setItem("pneumata_subscribed", "1");
    onPreviewEntry?.(pathKey);
    setFlashMode("reveal");
    setSelectedPath(pathKey);
    setEntryPhase("revealing");
  };

  const handleBypass = () => {
    localStorage.setItem("pneumata_subscribed", "1");
    setStatus("done");
  };

  return (
    <div
      className={`landing-overlay landing-overlay--${entryPhase}${flashMode ? ` landing-overlay--flash-${flashMode}` : ""}`}
    >
      <div className="landing-flash" aria-hidden="true" />
      <div className="landing-scanline" aria-hidden="true" />
      <div className="landing-content landing-content--visible">
        <div className="landing-panel">
          <div className="landing-title">
            <h1>Pneumata</h1>
            <p className="landing-sub">
              An interactive 3D model mapping every human organ to its hardware analog.
              
            </p>
          </div>

          <div className="landing-divider" />

          {status === "done" ? (
            <p className="landing-confirm"></p>
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

          {status === "done" && (
            <div className={`landing-entry landing-entry--${entryPhase}`}>
              {(entryPhase === "choosing" || entryPhase === "revealing") && (
                <div className="landing-paths-shell">
                  <p className="landing-entry-kicker">Choose mode</p>
                  <motion.div
                    className="landing-paths"
                    initial="hidden"
                    animate="show"
                    variants={pathGridVariants}
                  >
                    {ENTRY_PATHS.map((path) => (
                      <PathCard
                        key={path.key}
                        path={path}
                        isActive={selectedPath === path.key}
                        onSelect={handlePathSelect}
                        disabled={entryPhase === "revealing"}
                      />
                    ))}
                  </motion.div>
                </div>
              )}
            </div>
          )}

          {status === "error" && (
            <button
              className="landing-enter landing-enter--bypass"
              onClick={handleBypass}
            >
              Enter without subscribing
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default LandingOverlay;
