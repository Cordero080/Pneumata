import { useState, useReducer, useRef, useCallback, useEffect } from "react";
import "./App.scss";
import Scene from "./components/scene/Scene";
import LandingOverlay from "./components/landing/LandingOverlay";
import AnimatedScene from "./components/scene/animated-mode/AnimatedScene";
import GlassModal from "./components/modal/GlassModal";
import AboutModal from "./components/about/AboutModal";
import CategoryLegend from "./components/legend/CategoryLegend";
import ViewModeController from "./components/view-controller/ViewModeController";
import VerticalControls from "./components/controls/VerticalControls";
import OrbToggle from "./components/controls/OrbToggle";
import QiToggle from "./components/controls/QiToggle";
import CoachMarks from "./components/onboarding/CoachMarks";
import { organs } from "./data/organs";
import { IS_MOBILE } from "./utils/device";

// ── CAMERA REDUCER ───────────────────────────────────────────────────────────
// All camera state lives here. Dispatch via dispatchCam({ type, value }).
// Add a new case to support a new camera dimension (e.g. tilt, roll).
function cameraReducer(state, action) {
  switch (action.type) {
    case "reset":
      return {
        ...DEFAULTS,
        brainZoom: false,
        cellZoom: false,
        resetKey: state.resetKey + 1,
      };
    case "setBrainZoom":
      // Reset panY to center when entering brain zoom. The brain camera applies
      // panY as a Y offset (× 0.4) to the target, which at head scale (~0.2u
      // tall) badly mis-frames the head if panY wasn't centered — showing only
      // crown-to-nose. Centering panY on entry frames the whole head.
      return {
        ...state,
        brainZoom: action.value,
        panY: action.value ? DEFAULTS.panY : state.panY,
      };
    case "setCellZoom":
      return { ...state, cellZoom: action.value };
    case "setPanY":
      return { ...state, panY: action.value };
    case "setZoom":
      return { ...state, zoom: action.value };
    case "setOffsetX":
      return { ...state, offsetX: action.value };
    default:
      return state;
  }
}
// ── DEVICE DEFAULTS ──────────────────────────────────────────────────────────
// Starting camera values per device. Standalone = PWA (no browser chrome),
// which gives a taller canvas, so globalScale is reduced to keep the figure in frame.
//   panY:        0 = head end, 1 = feet end  (maps to the vertical slider)
//   zoom:        0 = close,    1 = far        (maps to the zoom slider)
//   globalScale: Three.js scale multiplier on the figure group
//   offsetX/Y:   figure offset from canvas center in world units
const IS_STANDALONE =
  window.navigator.standalone === true ||
  window.matchMedia("(display-mode: standalone)").matches;
// ── FIGURE SIZE & POSITION DEFAULTS ─────────────────────────────────────────
// globalScale : size of the figure (increase = bigger, 1.0 = full size)
// offsetY     : vertical position of the figure group in world units
//               (increase = figure moves UP, decrease = figure moves DOWN)
// offsetX     : horizontal shift (0 = centered)
// zoom        : 0 = close camera, 1 = far camera
// panY        : 0 = top of pan range, 1 = bottom of pan range
//
// These are also the values the Reset button snaps back to.

const DEFAULTS = IS_MOBILE
  ? IS_STANDALONE
    ? // ── Mobile PWA (no browser chrome — taller canvas) ──────────────────────
      { panY: 0.51, zoom: 0.4, globalScale: 0.9, offsetX: 0, offsetY: 0.1 }
    : // ── Mobile browser ──────────────────────────────────────────────────────
      { panY: 0.5, zoom: 0.4, globalScale: 0.96, offsetX: 0, offsetY: 0.1 }
  : // ── Desktop ───────────────────────────────────────────────────────────────
    { panY: 0.5, zoom: 0.4, globalScale: 0.95, offsetX: 0, offsetY: 0.08 };

// ── LANDING ENTRY PRESETS ────────────────────────────────────────────────────
// Each key maps to a path card on the landing screen. When the user picks one,
// the scene snaps to these values. Add a new key + object to add a new path card.
//   viewMode:   "logic" | "power" | "breathing" | "unified"
//   brainZoom:  if true, triggers the brain close-up camera path
//   zoom/panY:  override the slider starting values on entry
//   organId:    if set, the scene focuses on that organ node
//   showNerves: if true, the nerve overlay is enabled on entry
//   meshMode:   if set, overrides the mesh material on entry (light mode only)
const LANDING_ENTRY_PRESETS = {
  brain: { viewMode: "logic", brainZoom: true, meshMode: 3 },
  lungs: { viewMode: "breathing", zoom: 0.02, panY: 0.25 },
  heart: { viewMode: "power", zoom: 0.02, panY: 0.25 },
  nervous: {
    viewMode: "unified",
    organId: "spinal_cord",
    showNerves: true,
  },
  body: { viewMode: "logic", zoom: 0.4, panY: IS_MOBILE ? 0.48 : 0.5 },
};

// ── BACKGROUND MODES ─────────────────────────────────────────────────────────
// Each index maps to an app--bg-{name} CSS class in App.scss.
// BG_ICONS are the characters shown on the cycle button for each mode.
// To add a background: append to both arrays and add an app--bg-{name} rule to App.scss.
const BG_MODES = ["default", "nebula", "space", "sunset", "matrix"];
const BG_ICONS = ["⬡︎", "✵︎", "✦︎", "◐︎", "⊞︎"];

// ── AMBIENT ORBS (SceneOrbs particle field) — per-background default ───────
// Nebula defaults the ambient orb field on; every other themed background
// defaults off but stays user-togglable via .orb-toggle-btn, which only
// renders while a themed background (bgMode > 0) is active. "default" (no
// theme) never shows the orb field or its toggle at all.
const ORB_DEFAULT_BY_BG = {
  default: false,
  nebula: true,
  space: false,
  sunset: false,
  matrix: false,
};

function App() {
  const [selectedOrgan, setSelectedOrgan] = useState(null);
  const [organFocusY, setOrganFocusY] = useState(null);
  const [organFocusDistance, setOrganFocusDistance] = useState(null);
  const [viewMode, setViewMode] = useState("logic");
  const [showNerves, setShowNerves] = useState(false);
  const [showMeridians, setShowMeridians] = useState(false);
  const [showQi, setShowQi] = useState(false);
  const [wipBadgeDismissed, setWipBadgeDismissed] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);

  // Reset the dismissed state each time meridians are toggled off, so the badge
  // reappears next time the layer is turned back on.
  useEffect(() => {
    if (!showMeridians) setWipBadgeDismissed(false);
  }, [showMeridians]);
  const [showAbout, setShowAbout] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [bgMode, setBgMode] = useState(0);
  const [bgPanelOpen, setBgPanelOpen] = useState(false);
  const [orbsEnabled, setOrbsEnabled] = useState(ORB_DEFAULT_BY_BG.default);

  // Reset ambient orb visibility to that background's default each time the
  // background theme changes.
  useEffect(() => {
    setOrbsEnabled(ORB_DEFAULT_BY_BG[BG_MODES[bgMode]] ?? false);
  }, [bgMode]);
  // 0=Ghost 1=Silver-Trans 2=Silver-Solid 3=Bone 4=Aluminum-Trans 5=Aluminum-Solid 6=Crystal/Onyx
  // Dark mode uses a different cycle sequence — see onClick on .mesh-toggle-btn.
  // Default is dark mode's Ghost (0) — matches darkMode's default of true above.
  const [meshMode, setMeshMode] = useState(0);
  const [bodyModel, setBodyModel] = useState("male");
  const modelPath =
    bodyModel === "male"
      ? "/models/body/male-body.glb"
      : "/models/body/female-body.glb";
  const [cam, dispatchCam] = useReducer(cameraReducer, {
    brainZoom: false,
    cellZoom: false,
    panY: DEFAULTS.panY,
    zoom: DEFAULTS.zoom,
    globalScale: DEFAULTS.globalScale,
    offsetX: DEFAULTS.offsetX,
    offsetY: DEFAULTS.offsetY,
    resetKey: 0,
  });
  const {
    brainZoom,
    cellZoom,
    panY,
    zoom,
    globalScale,
    offsetX,
    offsetY,
    resetKey,
  } = cam;
  const clearLandingFocus = useCallback(() => {
    setOrganFocusY(null);
  }, []);

  const handleReset = useCallback(() => {
    clearLandingFocus();
    dispatchCam({ type: "reset" });
  }, [clearLandingFocus]);
  const [showAnimation, setShowAnimation] = useState(false);
  const [showTopNav, setShowTopNav] = useState(false);
  const [viewPanelOpen, setViewPanelOpen] = useState(false);
  const [legendCategory, setLegendCategory] = useState(null);
  const [showLanding, setShowLanding] = useState(
    () => !localStorage.getItem("pneumata_entered"),
  );
  const aboutRef = useRef(null);
  const bgPickerRef = useRef(null);
  const pathBtnRef = useRef(null);
  const navTriggerRef = useRef(null);
  const darkModeRef = useRef(null);
  const bgToggleRef = useRef(null);
  const [orbTogglePos, setOrbTogglePos] = useState({ top: 260, left: 90 });

  // Position the orb-toggle chip against bg-toggle-btn's actual rendered
  // rect rather than a hardcoded pixel guess — the drawer's button stack
  // shifts position across breakpoints (mobile vs desktop button sizes),
  // so a fixed value drifts out of alignment depending on viewport.
  useEffect(() => {
    if (bgMode === 0 || !bgToggleRef.current) return;
    const rect = bgToggleRef.current.getBoundingClientRect();
    setOrbTogglePos({
      top: rect.top + rect.height / 2 - 12.5, // 12.5 = half the chip's own height
      left: rect.right - 4,
    });
  }, [bgMode, showTopNav]);

  // Qi-toggle chip — same slide-out approach as the orb chip, but anchored to
  // the meridian-toggle button (☯) so it slides out from behind that button.
  const meridianToggleRef = useRef(null);
  const [qiTogglePos, setQiTogglePos] = useState({ top: 300, left: 90 });
  useEffect(() => {
    if (!showMeridians || !meridianToggleRef.current) return;
    const rect = meridianToggleRef.current.getBoundingClientRect();
    setQiTogglePos({
      top: rect.top + rect.height / 2 - 12.5,
      left: rect.right - 4,
    });
  }, [showMeridians, showTopNav]);

  useEffect(() => {
    if (!bgPanelOpen) return;
    const handler = (e) => {
      if (bgPickerRef.current && !bgPickerRef.current.contains(e.target))
        setBgPanelOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [bgPanelOpen]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") {
        if (cellZoom) dispatchCam({ type: "setCellZoom", value: false });
        else if (brainZoom) dispatchCam({ type: "setBrainZoom", value: false });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [brainZoom, cellZoom]);

  useEffect(() => {
    dispatchCam({ type: "reset" });
  }, [bodyModel]);

  const handleTilt = useCallback((e) => {
    const btn = aboutRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    btn.style.transform = `perspective(400px) rotateY(${x * 20}deg) rotateX(${-y * 20}deg) scale(1.05)`;
  }, []);

  const resetTilt = useCallback(() => {
    const btn = aboutRef.current;
    if (btn) btn.style.transform = "";
  }, []);

  const handleLandingPreview = useCallback(
    (pathKey) => {
      const preset =
        LANDING_ENTRY_PRESETS[pathKey] ?? LANDING_ENTRY_PRESETS.body;
      const targetOrgan = preset.organId
        ? organs.find((organ) => organ.id === preset.organId)
        : null;
      const focusPoint =
        bodyModel === "female"
          ? (targetOrgan?.femalePosition ??
            targetOrgan?.position ??
            targetOrgan?.points?.[4])
          : (targetOrgan?.position ??
            targetOrgan?.femalePosition ??
            targetOrgan?.points?.[4]);

      if (!preset.brainZoom) handleReset();
      setSelectedOrgan(null);
      setLegendCategory(null);
      setShowAnimation(false);
      setViewMode(preset.viewMode);
      setShowNerves(!!preset.showNerves);
      setShowMeridians(false);
      setOrganFocusY(focusPoint ? focusPoint[1] * globalScale + offsetY : null);

      dispatchCam({ type: "setCellZoom", value: false });
      dispatchCam({ type: "setBrainZoom", value: !!preset.brainZoom });
      if (preset.zoom != null)
        dispatchCam({ type: "setZoom", value: preset.zoom });
      if (preset.panY != null)
        dispatchCam({ type: "setPanY", value: preset.panY });
      if (preset.meshMode != null && !darkMode) setMeshMode(preset.meshMode);
    },
    [bodyModel, globalScale, offsetY, darkMode],
  );

  const handleOpenLanding = useCallback(() => {
    setShowLanding(true);
    setShowAbout(false);
    setViewPanelOpen(false);
    setShowTopNav(false);
  }, []);

  const handleViewModeChange = useCallback(
    (nextMode) => {
      clearLandingFocus();
      setViewMode(nextMode);
    },
    [clearLandingFocus],
  );

  const handleShowNervesChange = useCallback(
    (valueOrUpdater) => {
      clearLandingFocus();
      setShowNerves(valueOrUpdater);
    },
    [clearLandingFocus],
  );

  const handlePanChange = useCallback(
    (value) => {
      clearLandingFocus();
      dispatchCam({ type: "setPanY", value });
    },
    [clearLandingFocus],
  );

  const handleZoomChange = useCallback(
    (value) => {
      clearLandingFocus();
      dispatchCam({ type: "setZoom", value });
    },
    [clearLandingFocus],
  );

  // ── ORGAN SELECTION ──────────────────────────────────────────────────────────
  // Called when the user clicks an organ node in the 3D scene.
  // If the organ has focusZoom, the camera jumps to those exact slider values.
  // Otherwise it auto-computes a Y target from the organ's world position.
  // focusYAdjust lets individual organs nudge that computed Y (see organs.js).
  const handleOrganSelect = useCallback(
    (organ) => {
      setSelectedOrgan(organ);
      // Clicking a brain-region node from anywhere should land on the same
      // look as entering via the dedicated Brain path (see LANDING_ENTRY_PRESETS.brain).
      if (organ?.brainPosition) {
        setViewMode("logic");
        if (!darkMode) setMeshMode(3);
      }
      if (
        !brainZoom &&
        organ &&
        !organ.brainPosition &&
        organ.type !== "line" &&
        organ.position
      ) {
        if (organ.focusZoom != null) {
          dispatchCam({ type: "setZoom", value: organ.focusZoom });
          dispatchCam({ type: "setPanY", value: organ.focusPanY ?? 0.5 });
          setOrganFocusY(null);
          setOrganFocusDistance(null);
        } else {
          setOrganFocusY(
            organ.position[1] * globalScale +
              offsetY +
              (organ.focusYAdjust ?? 0),
          );
          setOrganFocusDistance(organ.focusDistance ?? null);
        }
      } else {
        setOrganFocusY(null);
        setOrganFocusDistance(null);
      }
    },
    [brainZoom, globalScale, offsetY, darkMode],
  );

  // Same focus logic as handleOrganSelect but fires on hover — no selection state change.
  const handleOrganFocus = useCallback(
    (organ) => {
      if (
        !brainZoom &&
        organ &&
        !organ.brainPosition &&
        organ.type !== "line" &&
        organ.position
      ) {
        setOrganFocusY(
          organ.position[1] * globalScale + offsetY + (organ.focusYAdjust ?? 0),
        );
        setOrganFocusDistance(organ.focusDistance ?? null);
      }
    },
    [brainZoom, globalScale, offsetY],
  );

  return (
    <div
      className={`app app--${bodyModel}${darkMode ? " app--dark" : ""} app--bg-${BG_MODES[bgMode]}`}
    >
      <header
        className={`app-header${showLanding ? " app-header--hidden" : ""}`}
      >
        <div className="header-strip">
          <div className="header-accent header-accent--top">
            <button
              ref={navTriggerRef}
              className={`header-nav-trigger${showTopNav ? " header-nav-trigger--open" : ""}`}
              onClick={() => setShowTopNav((v) => !v)}
            >
              {showTopNav ? "✕" : "⊞︎"}
            </button>
          </div>
          <div className="header-panel">
            <h1>Pneumata</h1>
            <p>Analogical Anatomy</p>
            <div className="header-panel__actions">
              <button
                ref={pathBtnRef}
                className="about-btn about-btn--entry"
                onClick={handleOpenLanding}
                aria-label="Open path menu"
                title="Open path menu"
              >
                Path
              </button>
              <button
                ref={aboutRef}
                className="about-btn"
                onClick={() => setShowAbout(true)}
                onMouseMove={handleTilt}
                onMouseLeave={resetTilt}
              >
                Info
              </button>
              {!showAnimation && (
                <VerticalControls
                  panY={panY}
                  onPanChange={handlePanChange}
                  zoom={zoom}
                  onZoomChange={handleZoomChange}
                  offsetX={offsetX}
                  onOffsetXChange={(v) =>
                    dispatchCam({ type: "setOffsetX", value: v })
                  }
                  darkMode={darkMode}
                  closeOnOrgan={!!selectedOrgan}
                  autoRotate={autoRotate}
                  onAutoRotateToggle={() => setAutoRotate((v) => !v)}
                />
              )}
            </div>
          </div>
          <div className="header-accent header-accent--bottom" />
        </div>
      </header>

      {/* Utility controls — dropdown from header-accent trigger */}
      <div className="top-left-strip">
        <div
          className={`top-nav-drawer${showTopNav ? " top-nav-drawer--open" : ""}${bgPanelOpen ? " top-nav-drawer--picker-open" : ""}`}
        >
          <button
            className={`mesh-toggle-btn mesh-toggle-btn--${meshMode}`}
            title={
              (darkMode
                ? [
                    "Ghost",
                    "Onyx (Open)",
                    "Obsidian (Solid)",
                    "Bone / X-Ray",
                    "Chrome (Transparent)",
                    "Chrome (Solid)",
                    "Onyx",
                  ]
                : [
                    "Ghost",
                    "Silver (Transparent)",
                    "Silver (Solid)",
                    "Bone / X-Ray",
                    "Aluminum (Transparent)",
                    "Aluminum (Solid)",
                    "Crystal",
                  ])[meshMode] ?? "Skin"
            }
            onClick={() =>
              setMeshMode((m) => {
                if (darkMode) {
                  return { 0: 1, 1: 6, 6: 3, 3: 4, 4: 2, 2: 0 }[m] ?? 0;
                }
                return m === 4 ? 6 : m === 6 ? 0 : (m + 1) % 6;
              })
            }
          >
            {meshMode === 0
              ? "◻\uFE0E"
              : meshMode === 1
                ? "◈\uFE0E"
                : meshMode === 2
                  ? "◼\uFE0E"
                  : meshMode === 3
                    ? "◇\uFE0E"
                    : meshMode === 4
                      ? "◎\uFE0E"
                      : "⬛\uFE0E"}
          </button>
          <button
            className="reset-btn"
            title="Reset camera"
            onClick={handleReset}
          >
            ↺
          </button>
          <button
            className={`body-toggle-btn${bodyModel === "female" ? " body-toggle-btn--active" : ""}`}
            title={
              bodyModel === "male"
                ? "Male — switch to Female"
                : "Female — switch to Male"
            }
            onClick={() => {
              setBodyModel((m) => (m === "male" ? "female" : "male"));
              handleReset();
            }}
          >
            {bodyModel === "male" ? "♂\uFE0E" : "♀\uFE0E"}
          </button>
          {/* animation button — blocked until fully developed
          <button
            className={`anim-toggle-btn${showAnimation ? " anim-toggle-btn--active" : ""}`}
            title={showAnimation ? "Stop animation" : "Play animation"}
            onClick={() => setShowAnimation((v) => !v)}
          >
            {showAnimation ? "✕" : "▶"}
          </button>
          */}
          <button
            ref={bgToggleRef}
            className={`bg-toggle-btn${bgMode > 0 ? " bg-toggle-btn--active" : ""}`}
            onClick={() => setBgMode((m) => (m + 1) % BG_MODES.length)}
            title={`Background: ${BG_MODES[bgMode]}`}
          >
            {BG_ICONS[bgMode]}
          </button>
          <button
            ref={meridianToggleRef}
            className={`meridian-toggle-btn${showMeridians ? " meridian-toggle-btn--active" : ""}`}
            onClick={() => setShowMeridians((v) => !v)}
            title="Meridian points"
          >
            ☯︎
          </button>
        </div>
      </div>

      {bgMode > 0 && !showAnimation && !showLanding && (
        <OrbToggle
          key={bgMode}
          enabled={orbsEnabled}
          onToggle={() => setOrbsEnabled((v) => !v)}
          style={{ top: orbTogglePos.top, left: orbTogglePos.left }}
        />
      )}
      {showMeridians && !showAnimation && !showLanding && (
        <QiToggle
          enabled={showQi}
          onToggle={() => setShowQi((v) => !v)}
          style={{ top: qiTogglePos.top, left: qiTogglePos.left }}
        />
      )}

      {showAnimation ? (
        <AnimatedScene darkMode={darkMode} meshMode={meshMode} />
      ) : (
        <Scene
          globalScale={globalScale}
          offsetX={offsetX}
          offsetY={offsetY + -0.02}
          style={showLanding ? { pointerEvents: "none" } : undefined}
          onSelect={handleOrganSelect}
          onFocus={handleOrganFocus}
          selectedOrgan={selectedOrgan}
          viewMode={viewMode}
          showNerves={showNerves}
          darkMode={darkMode}
          meshMode={meshMode}
          brainZoom={brainZoom}
          setBrainZoom={(v) => dispatchCam({ type: "setBrainZoom", value: v })}
          cellZoom={cellZoom}
          setCellZoom={(v) => dispatchCam({ type: "setCellZoom", value: v })}
          panY={panY}
          zoom={zoom}
          resetKey={resetKey}
          modelPath={modelPath}
          femaleMode={bodyModel === "female"}
          organFocusY={organFocusY}
          organFocusDistance={organFocusDistance}
          viewPanelOpen={viewPanelOpen}
          bgMode={bgMode}
          bgModeName={BG_MODES[bgMode]}
          legendCategory={legendCategory}
          showMeridians={showMeridians}
          showQi={showQi}
          autoRotate={autoRotate}
          orbsEnabled={orbsEnabled}
        />
      )}

      {showMeridians && !wipBadgeDismissed && (
        <div className="meridian-wip-badge" aria-live="polite">
          <span className="meridian-wip-badge__dot" />
          <span className="meridian-wip-badge__text">
            Meridian layer · under construction
          </span>
          <button
            className="meridian-wip-badge__close"
            onClick={() => setWipBadgeDismissed(true)}
            aria-label="Dismiss notice"
          >
            ✕
          </button>
        </div>
      )}

      {(brainZoom || cellZoom) && (
        <button
          className="brain-back-btn"
          onClick={() => {
            if (cellZoom) dispatchCam({ type: "setCellZoom", value: false });
            else dispatchCam({ type: "setBrainZoom", value: false });
            handleReset();
          }}
        >
          ← Back
        </button>
      )}

      <GlassModal
        organ={selectedOrgan}
        onClose={() => {
          setSelectedOrgan(null);
          setOrganFocusY(null);
          setOrganFocusDistance(null);
        }}
      />

      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}

      {!showAnimation && (
        <CategoryLegend
          onCategoryHover={setLegendCategory}
          darkMode={darkMode}
        />
      )}

      {!showAnimation && (
        <ViewModeController
          viewMode={viewMode}
          setViewMode={handleViewModeChange}
          showNerves={showNerves}
          setShowNerves={handleShowNervesChange}
          open={viewPanelOpen}
          onToggle={setViewPanelOpen}
        />
      )}

      <button
        ref={darkModeRef}
        className={`dark-mode-switch${darkMode ? " dark-mode-switch--dark" : ""}`}
        onClick={() => {
          const next = !darkMode;
          setDarkMode(next);
          setMeshMode(next ? 0 : 5);
        }}
        role="switch"
        aria-checked={darkMode}
        aria-label="Toggle dark mode"
        title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        <span className="dark-mode-switch__knob">
          <span key={String(darkMode)} className="dark-mode-switch__icon">
            {darkMode ? "☾︎" : "☀︎"}
          </span>
        </span>
      </button>

      <p className="app-copyright">© 2026 Pablo Cordero</p>

      {showLanding && (
        <LandingOverlay
          onPreviewEntry={handleLandingPreview}
          onEnter={() => {
            localStorage.setItem("pneumata_entered", "1");
            setShowLanding(false);
          }}
        />
      )}

      <CoachMarks
        active={!showLanding && !showAnimation}
        darkMode={darkMode}
        targets={{
          path: pathBtnRef,
          nav: navTriggerRef,
          dark: darkModeRef,
        }}
      />
    </div>
  );
}

export default App;
