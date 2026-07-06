// Mesh-mode material recipes — one file, every mode × theme side by side,
// instead of the ~220-line if/else chain this replaced in AnatomyModel.jsx.
// meshMode: 0=Ghost 1=Silver/Onyx-open 2=Silver-Solid/Obsidian 3=Bone/X-Ray
//           4=Aluminum-Trans/Chrome-Trans 5=Aluminum-Solid/Chrome-Solid 6=Crystal/Onyx
//
// Returns { mat: {...props}, al?: {...props} } — `al` is omitted entirely for
// modes that never touch the aluminum layer (dark 0, dark 3), matching the
// original behavior of simply not writing to it.
export function getMeshStyle(meshMode, darkMode, colors) {
  const {
    obsColor,
    obsEmissive,
    ghostColor,
    ghostDark,
    alColor,
    alColorDark,
    whiteColor,
    whiteAlColor,
    whiteEmissiveLight,
    whiteEmissiveDark,
    onyxColor,
    onyxColorDark,
    onyxEmissive,
  } = colors;

  if (darkMode) {
    switch (meshMode) {
      // DARK · MODE 6 — ONYX: solid near-black with pulsing organ windows
      case 6:
        return {
          mat: {
            color: onyxColorDark,
            emissive: onyxEmissive,
            emissiveIntensity: 0.12,
            transparent: true,
            transmission: 0,
            opacity: 1.0,
            metalness: 0.95,
            roughness: 0.05,
            iridescence: 0.3,
            iridescenceIOR: 1.4,
            iridescenceThicknessRange: [80, 200],
            clearcoat: 1.0,
            clearcoatRoughness: 0.05,
            depthWrite: true,
          },
          al: { transparent: true, opacity: 0, depthWrite: false },
        };
      // DARK · MODE 5 — CHROME SOLID: ghost hidden, aluminum solid
      case 5:
        return {
          mat: {
            transparent: true,
            opacity: 0,
            iridescence: 0,
            depthWrite: false,
          },
          al: {
            transparent: false,
            color: alColorDark,
            metalness: 0.88,
            roughness: 0.15,
            opacity: 1.0,
            depthWrite: true,
          },
        };
      // DARK · MODE 4 — CHROME TRANSPARENT: ghost hidden, aluminum semi-transparent
      case 4:
        return {
          mat: {
            transparent: true,
            opacity: 0,
            iridescence: 0,
            depthWrite: false,
          },
          al: {
            transparent: true,
            color: alColorDark,
            metalness: 0.88,
            roughness: 0.15,
            opacity: 0.82,
            depthWrite: false,
          },
        };
      // DARK · MODE 3 — X-RAY/BONE: semi-transparent white (aluminum untouched)
      case 3:
        return {
          mat: {
            color: whiteColor,
            transparent: true,
            transmission: 0,
            opacity: 0.68,
            metalness: 0.3,
            roughness: 0.1,
            emissive: whiteEmissiveDark,
            emissiveIntensity: 0.1,
            iridescence: 0,
            depthWrite: false,
          },
        };
      // DARK · MODE 0 — GHOST: thin dark shell (aluminum untouched)
      case 0:
        return {
          mat: {
            color: obsColor,
            emissive: obsEmissive,
            transparent: true,
            transmission: 0,
            opacity: 0.85,
            metalness: 0.11,
            roughness: 0.12,
            iridescence: 0.001,
            depthWrite: false,
          },
        };
      // DARK · MODE 1 — ONYX OPEN: onyx body with transparent skull/torso windows
      case 1:
        return {
          mat: {
            color: onyxColorDark,
            emissive: onyxEmissive,
            emissiveIntensity: 0.12,
            transparent: true,
            transmission: 0,
            opacity: 1.0,
            metalness: 0.95,
            roughness: 0.05,
            iridescence: 0.3,
            iridescenceIOR: 1.4,
            iridescenceThicknessRange: [80, 200],
            clearcoat: 1.0,
            clearcoatRoughness: 0.05,
            depthWrite: true,
          },
          al: { transparent: true, opacity: 0, depthWrite: false },
        };
      // DARK · MODE 2 — OBSIDIAN SOLID: iridescent black (default case)
      default:
        return {
          mat: {
            color: obsColor,
            emissive: obsEmissive,
            transparent: false,
            transmission: 0,
            opacity: 1.0,
            metalness: 0.92,
            roughness: 0.08,
            iridescence: 0.95,
            depthWrite: true,
          },
          al: { transparent: true, opacity: 0, depthWrite: false },
        };
    }
  }

  switch (meshMode) {
    // LIGHT · MODE 6 — ONYX: same recipe as dark mode 6, light-mode onyx color
    case 6:
      return {
        mat: {
          color: onyxColor,
          emissive: onyxEmissive,
          emissiveIntensity: 0.12,
          transparent: false,
          transmission: 0,
          opacity: 1.0,
          metalness: 0.75,
          roughness: 0.05,
          iridescence: 1,
          iridescenceIOR: 2.4,
          iridescenceThicknessRange: [80, 200],
          clearcoat: 1.0,
          clearcoatRoughness: 0.05,
          depthWrite: true,
        },
        al: { transparent: true, opacity: 0, depthWrite: false },
      };
    // LIGHT · MODE 0 — GHOST: dark semi-transparent charcoal
    case 0:
      return {
        mat: {
          color: ghostDark,
          transparent: true,
          transmission: 0,
          opacity: 0.45,
          metalness: 15,
          roughness: 0.12,
          emissiveIntensity: 0,
          depthWrite: false,
        },
        al: { transparent: true, opacity: 0, depthWrite: false },
      };
    // LIGHT · MODE 3 — X-RAY/BONE: white ghost + aluminum overlay
    case 3:
      return {
        mat: {
          color: whiteColor,
          transparent: true,
          transmission: 0,
          opacity: 0.18,
          metalness: 0.01,
          roughness: 0.1,
          emissive: whiteEmissiveLight,
          emissiveIntensity: 0.1,
          depthWrite: false,
        },
        al: {
          transparent: true,
          color: whiteAlColor,
          metalness: 0.1,
          roughness: 0.1,
          opacity: 0.38,
          depthWrite: false,
        },
      };
    // LIGHT · MODE 4 — METALLIC CHROME (transparent): ghost hidden, aluminum semi-transparent
    case 4:
      return {
        mat: { transparent: true, opacity: 0, depthWrite: false },
        al: {
          transparent: true,
          color: alColor,
          metalness: 0.9,
          roughness: 0.15,
          opacity: 0.62,
          depthWrite: false,
        },
      };
    // LIGHT · MODE 2 — ghost + aluminum solid
    case 2:
      return {
        mat: {
          color: ghostColor,
          transmission: 0,
          opacity: 0.13,
          metalness: 0,
          roughness: 0.2,
          depthWrite: false,
        },
        al: {
          transparent: false,
          color: alColor,
          metalness: 0.88,
          roughness: 0.15,
          opacity: 1.0,
          depthWrite: true,
        },
      };
    // LIGHT · MODE 1 — ghost + aluminum transparent (default case)
    default:
      return {
        mat: {
          color: ghostColor,
          transmission: 0,
          opacity: 0.13,
          metalness: 0,
          roughness: 0.2,
          depthWrite: false,
        },
        al: {
          transparent: true,
          color: alColor,
          metalness: 0.88,
          roughness: 0.15,
          opacity: 0.82,
          depthWrite: false,
        },
      };
  }
}
