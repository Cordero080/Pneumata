import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import "./CoachMarks.scss";

const SEEN_KEY = "pneumata-coachmarks-seen";
const INITIAL_DELAY = 4500; // ms before the first hint appears
const GAP_DELAY = 3500; // ms between one hint fading and the next appearing
const SHOW_DURATION = 5500; // ms a hint stays visible

// Order matters — this is the sequence hints play in.
const STEPS = [
  {
    id: "path",
    align: "bottom",
    text: "Switch between body systems — brain, heart, lungs, and more — from here.",
  },
  {
    id: "nav",
    align: "bottom-start",
    text: "Tap this corner tab to open more controls — material, reset, body swap, and background.",
  },
  {
    id: "dark",
    align: "left",
    text: "Flip here to switch between light and dark mode.",
  },
];

function useTargetRect(ref, watch) {
  const [rect, setRect] = useState(null);

  useEffect(() => {
    if (!watch || !ref?.current) {
      setRect(null);
      return;
    }
    const update = () => setRect(ref.current.getBoundingClientRect());
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [ref, watch]);

  return rect;
}

function positionFor(align, rect) {
  const style = { position: "fixed" };
  switch (align) {
    case "bottom":
      style.top = rect.bottom + 12;
      style.left = rect.left + rect.width / 2;
      style.transform = "translateX(-50%)";
      break;
    case "right":
      style.top = rect.top + rect.height / 2;
      style.left = rect.right + 12;
      style.transform = "translateY(-50%)";
      break;
    case "bottom-start":
      // Anchored to the target's bottom-left corner, growing right/down —
      // safe for elements pinned to a viewport edge (e.g. the top-left
      // corner trigger), where centering could push the bubble off-screen.
      style.top = rect.bottom + 10;
      style.left = rect.left;
      break;
    case "left":
      style.top = rect.top + rect.height / 2;
      style.right = window.innerWidth - rect.left + 12;
      style.transform = "translateY(-50%)";
      break;
    default:
      break;
  }
  return style;
}

// Idle-triggered onboarding hints. Plays STEPS in order, one at a time, then
// marks itself seen for the rest of the browser session.
function CoachMarks({ active, darkMode, targets }) {
  const [stepIndex, setStepIndex] = useState(-1);
  const timerRef = useRef(null);
  const seenRef = useRef(sessionStorage.getItem(SEEN_KEY) === "1");

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const queueStep = useCallback((index, delay) => {
    clearTimer();
    timerRef.current = setTimeout(() => setStepIndex(index), delay);
  }, []);

  const finish = useCallback(() => {
    clearTimer();
    seenRef.current = true;
    sessionStorage.setItem(SEEN_KEY, "1");
    setStepIndex(-1);
  }, []);

  // Kick off the sequence once the app becomes active.
  useEffect(() => {
    if (!active || seenRef.current) return;
    queueStep(0, INITIAL_DELAY);
    return clearTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  // Auto-hide the current hint, then queue the next one (or finish).
  useEffect(() => {
    if (stepIndex < 0) return;
    clearTimer();
    timerRef.current = setTimeout(() => {
      const next = stepIndex + 1;
      if (next < STEPS.length) queueStep(next, GAP_DELAY);
      else finish();
    }, SHOW_DURATION);
    return clearTimer;
  }, [stepIndex, queueStep, finish]);

  const step = stepIndex >= 0 ? STEPS[stepIndex] : null;
  const targetRef = step ? targets[step.id] : null;
  const rect = useTargetRect(targetRef, !!step);

  if (!step || !rect) return null;

  return createPortal(
    <div
      className={`coach-mark coach-mark--${step.align}${darkMode ? " coach-mark--dark" : ""}`}
      style={positionFor(step.align, rect)}
    >
      <span className="coach-mark__dot" />
      <span className="coach-mark__text">{step.text}</span>
      <button
        className="coach-mark__close"
        onClick={finish}
        aria-label="Dismiss hint"
      >
        ✕
      </button>
    </div>,
    document.body,
  );
}

export default CoachMarks;
