import { useState, useReducer, useRef, useCallback, useEffect } from "react";
import "./App.scss";
import Scene from "./components/scene/Scene";
import LandingOverlay from "./components/landing/LandingOverlay";
import AnimatedScene from "./components/scene/AnimatedScene";
import GlassModal from "./components/modal/GlassModal";
import AboutModal from "./components/about/AboutModal";
import CategoryLegend from "./components/legend/CategoryLegend";
import ViewModeController from "./components/view-controller/ViewModeController";
import VerticalControls from "./components/controls/VerticalControls";
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
      return { ...state, brainZoom: action.value };
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
      { panY: 0.51, zoom: 0.33, globalScale: 0.9, offsetX: 0, offsetY: 0.1 }
    : // ── Mobile browser ──────────────────────────────────────────────────────
      { panY: 0.5, zoom: 0.33, globalScale: 0.96, offsetX: 0, offsetY: 0.1 }
  : // ── Desktop ───────────────────────────────────────────────────────────────
    { panY: 0.5, zoom: 0.33, globalScale: 0.95, offsetX: 0, offsetY: 0.08};

// ── LANDING ENTRY PRESETS ────────────────────────────────────────────────────
// Each key maps to a path card on the landing screen. When the user picks one,
// the scene snaps to these values. Add a new key + object to add a new path card.
//   viewMode:   "logic" | "power" | "breathing" | "unified"
//   brainZoom:  if true, triggers the brain close-up camera path
//   zoom/panY:  override the slider starting values on entry
//   organId:    if set, the scene focuses on that organ node
//   showNerves: if true, the nerve overlay is enabled on entry
const LANDING_ENTRY_PRESETS = {
  brain: { viewMode: "logic", brainZoom: true },
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

function App() {
  const [selectedOrgan, setSelectedOrgan] = useState(null);
  const [organFocusY, setOrganFocusY] = useState(null);
  const [organFocusDistance, setOrganFocusDistance] = useState(null);
  const [viewMode, setViewMode] = useState("logic");
  const [showNerves, setShowNerves] = useState(false);
  const [showMeridians, setShowMeridians] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [bgMode, setBgMode] = useState(0);
  const [bgPanelOpen, setBgPanelOpen] = useState(false);
  // 0=Ghost 1=Silver-Trans 2=Silver-Solid 3=Bone 4=Aluminum-Trans 5=Aluminum-Solid 6=Crystal/Onyx
  // Dark mode uses a different cycle sequence — see onClick on .mesh-toggle-btn.
  const [meshMode, setMeshMode] = useState(5);
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
  const [showLanding, setShowLanding] = useState(true);
  const aboutRef = useRef(null);
  const bgPickerRef = useRef(null);

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
    document.body.classList.toggle("body--female", bodyModel === "female");
    dispatchCam({ type: "reset" });
    return () => document.body.classList.remove("body--female");
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
    },
    [bodyModel, globalScale, offsetY],
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
    [brainZoom, globalScale, offsetY],
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
      className={`app app--${bodyModel}${darkMode ? " app--dark" : ""}${bodyModel === "female" ? " app--female" : ""} app--bg-${BG_MODES[bgMode]}`}
    >
      <header
        className="app-header"
        style={showLanding ? { display: "none" } : undefined}
      >
        <div className="header-strip">
          <div className="header-accent header-accent--top">
            <button
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
              {!showAnimation && !showLanding && (
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
            className={`bg-toggle-btn${bgMode > 0 ? " bg-toggle-btn--active" : ""}`}
            onClick={() => setBgMode((m) => (m + 1) % BG_MODES.length)}
            title={`Background: ${BG_MODES[bgMode]}`}
          >
            {BG_ICONS[bgMode]}
          </button>
          <button
            className={`meridian-toggle-btn${showMeridians ? " meridian-toggle-btn--active" : ""}`}
            onClick={() => setShowMeridians((v) => !v)}
            title="Meridian points"
          >
            ☯︎
          </button>
        </div>
      </div>

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
        />
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

      {!showAnimation && <CategoryLegend onCategoryHover={setLegendCategory} />}

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
        className={`dark-capsule${darkMode ? " dark-capsule--dark" : ""}`}
        onClick={() => {
          const next = !darkMode;
          setDarkMode(next);
          setMeshMode(next ? 0 : 5);
        }}
        aria-label="Toggle dark mode"
      >
        <span className="dark-capsule__thumb" />
        <span className="dark-capsule__icon">☾</span>
        <span className="dark-capsule__icon">✦</span>
      </button>

      <p className="app-copyright">© 2026 Pablo Cordero</p>

      {showLanding && (
        <LandingOverlay
          onPreviewEntry={handleLandingPreview}
          onEnter={() => setShowLanding(false)}
        />
      )}
    </div>
  );
}

export default App;
