// Meridian point coordinates use the same GLB space as organs.js:
//   y=0 → feet, y=1.75 → head
//   z>0 → front (anterior), z<0 → back (posterior)
//   x>0 → body's RIGHT side (mirrored to -x for bilateral left side)
//
// bilateral: true → mirrored; midline meridians (GV, CV) are not bilateral.
// isSource: true → yuan (source) point — rendered larger as visual anchor.
// Points in anatomical flow order (used for pathway lines).
//
// ARM COORDINATE SYSTEM (derived from ExtremitySampler, 2026-06-27):
//   Model is in A-pose — arms angle out and down.
//   Shoulder:  y≈1.42–1.50, x≈0.14–0.16
//   Upper arm: y≈1.30–1.48, x_ctr≈0.162–0.167
//   Elbow:     y≈1.08–1.12, x_ctr≈0.272 (anterior surface x≈0.22–0.27, lateral x≈0.29)
//   Forearm:   y≈0.88–1.08, x_ctr≈0.276–0.285
//   Wrist:     y≈0.80–0.86, x_ctr≈0.285–0.295 (widest point in body at y=0.84: xMax=0.385)
//   Wrist-hand bend: y≈0.76–0.80 (x_ctr collapses 0.300→0.163)
//   Palm/hand: y≈0.62–0.76, x≈0.13–0.14, z≈+0.01 (slightly anterior, between thighs)
//   Fingertips: y≈0.59–0.62, x≈0.11–0.12
//
//   Anterior arm (LU, PC, HT) z ≈ +0.02 to +0.05
//   Posterior arm (LI, TW, SI) z ≈ −0.04 to −0.06

export const meridians = [
  // ── GOVERNING VESSEL (GV / Du Mai) — midline posterior ────────────────────
  {
    id: "gv",
    name: "Governing Vessel",
    abbreviation: "GV",
    element: "Yang",
    color: "#ffd700",
    bilateral: false,
    points: [
      {
        id: "GV-4",
        name: "Mingmen",
        position: [0, 1.05, -0.07], // below L2 spinous process, midline back — y≈1.03–1.07, z≈-0.07
        function: "Gate of life — kidney yang, vitality root",
        isSource: true,
      },
      {
        id: "GV-14",
        name: "Dazhui",
        position: [0, 1.58, -0.06], // BELOW C7 SPINOUS PROCESS (MOST PROMINENT VERTEBRA AT NAPE) — midline, z≈-0.06
        function: "Clears heat, boosts yang, sea of all yang",
      },
      {
        id: "GV-20",
        name: "Baihui",
        position: [0, 1.72, 0.0], // CROWN OF HEAD, MIDLINE — very top of skull, y≈1.71–1.73
        function: "Crown point — raises yang qi, calms shen",
      },
      {
        id: "GV-24",
        name: "Shenting",
        position: [0, 1.67, 0.07], // ANTERIOR HAIRLINE, MIDLINE FOREHEAD — 0.5 cun into hairline, y≈1.66–1.68
        function: "Calms the mind, spirit gate on forehead",
      },
      {
        id: "GV-26",
        name: "Renzhong",
        position: [0, 1.62, 0.09], // PHILTRUM CENTER (GROOVE BELOW NOSE) — midline upper lip, y≈1.61–1.63
        function: "Emergency revival, philtrum — wakes consciousness",
      },
    ],
  },

  // ── CONCEPTION VESSEL (CV / Ren Mai) — midline anterior ───────────────────
  {
    id: "cv",
    name: "Conception Vessel",
    abbreviation: "CV",
    element: "Yin",
    color: "#aaaaff",
    bilateral: false,
    points: [
      {
        id: "CV-4",
        name: "Guanyuan",
        position: [0, 0.96, 0.08], // 3 cun below navel, lower abdomen midline — y≈0.94–0.97
        function: "Gate of origin — lower dan tian, source qi",
        isSource: true,
      },
      {
        id: "CV-6",
        name: "Qihai",
        position: [0, 0.99, 0.08], // 1.5 cun below navel, lower abdomen midline — y≈0.97–1.00
        function: "Sea of qi — tonifies qi and yang",
      },
      {
        id: "CV-8",
        name: "Shenque",
        position: [0, 1.02, 0.08], // NAVEL CENTER, MIDLINE — y≈1.01–1.03
        function: "Navel — fortifies original qi, warms yang",
      },
      {
        id: "CV-12",
        name: "Zhongwan",
        position: [0, 1.12, 0.08], // 4 cun above navel, midline epigastrium — y≈1.10–1.14
        function: "Middle epigastrium — mu point of stomach",
      },
      {
        id: "CV-17",
        name: "Shanzhong",
        position: [0, 1.28, 0.08], // STERNUM MIDLINE AT 4TH ICS LEVEL (BETWEEN NIPPLES) — y≈1.26–1.30
        function: "Chest center — sea of qi, mu point of pericardium",
      },
      {
        id: "CV-22",
        name: "Tiantu",
        position: [0, 1.47, 0.07], // SUPRASTERNAL NOTCH (HOLLOW AT BASE OF THROAT) — midline, y≈1.50–1.54
        function: "Throat hollow — opens lungs, descends rebellious qi",
      },
    ],
  },

  // ── LUNG (LU) — Metal, bilateral — chest → anterior arm → thumb ───────────
  {
    id: "lu",
    name: "Lung",
    abbreviation: "LU",
    element: "Metal",
    color: "#aaddff",
    bilateral: true,
    points: [
      {
        id: "LU-1",
        name: "Zhongfu",//✅✅✅✅
        position: [0.13, 1.424, -0.03], // subclavicular fossa, 1 cun lateral to midline at 1st ICS — x≈0.10–0.14, y≈1.38–1.42
        function: "Front mu of lung — disperses lung qi, opens chest",
      },
      {
        id: "LU-5", //✅✅✅✅
        name: "Chize",
        position: [0.24, 1.14, -0.05], // elbow crease, radial side of biceps tendon — anterior arm, x≈0.22–0.26, y≈1.08–1.12
        function: "Elbow crease — clears lung heat, descends lung qi",
      },
      {
        id: "LU-7",
        name: "Lieque", // ✅
        position: [0.26, 1.03, -0.065], // 1.5 cun above LU-9, radial forearm — anterior, x≈0.27, y≈0.88
        function: "Luo-connecting — opens conception vessel, headache",
      },
      {
        id: "LU-9",
        name: "Taiyuan",
        position: [0.356, 0.891, -0.02], // radial wrist crease, lateral to radial artery — x≈0.28–0.30, y≈0.84
        function: "Source point — tonifies lung qi, influential for vessels",
        isSource: true,
      },
      {
        id: "LU-11",
        name: "Shaoshang",
        position: [0.133, 0.61, 0.04], // RADIAL CORNER OF THUMB NAIL — FINGERTIP: x≈0.11–0.13, y≈0.59–0.62, z>0
        function: "Well point — clears heat, benefits throat, resuscitates",
        useHandLandmark: true,
        handOffset: [0.06, 0.035, 0.03], ///✅✅✅✅✅✅✅✅✅
      },
    ],
  },

  // ── LARGE INTESTINE (LI) — Metal, bilateral — index finger → up arm → nose ─
  {
    id: "li",
    name: "Large Intestine",
    abbreviation: "LI",
    element: "Metal",
    color: "#e0e8ff",
    bilateral: true,
    // No pathPoints — line builds from the node positions below (starts at
    // LI-10, see MeridianPaths), so it locks onto the nodes.
    points: [
      {
        id: "LI-4",
        name: "Hegu",
        position: [0.14, 0.68, -0.02], // DORSAL hand, between 1st-2nd metacarpals, at midpoint of 2nd MC — x≈0.13–0.15, y≈0.65–0.70, z<0
        function: "Source point — the great eliminator, pain, immune",
        useHandLandmark: true,
        handOffset: [-0.01, 0.0, -0.03],
        isSource: true,
      },
      {
        id: "LI-10",
        name: "Shousanli",
        position: [0.27, 1.05, -0.02], // 2 cun below LI-11, dorsal forearm — posterior, x≈0.26–0.28, y≈1.03–1.07
        function: "3 cun below elbow — digestion, arm pain",
      },
      {
        id: "LI-11", //✅✅✅✅✅✅
        name: "Quchi",
        position: [0.26, 1.13, -0.075], // lateral elbow crease end, between biceps and lateral epicondyle — x≈0.28–0.31, y≈1.08–1.12
        function: "Elbow crease — clears heat, drains dampness, immunity",
      },
      {
        id: "LI-15",//✅✅✅✅✅✅
        name: "Jianyu",
        position: [0.169, 1.436, -0.059], // anterior acromion depression, arm abducted — x≈0.14–0.17, y≈1.40–1.44, z≈0
        function: "Anterior acromion — shoulder pain, wind-damp",
      },
      {
        id: "LI-20",//✅✅✅✅✅✅
        name: "Yingxiang",
        position: [0.015, 1.60, 0.090], // NASOLABIAL GROOVE, LATERAL TO ALA NASI (NOSTRIL WING) — x≈0.03–0.05, y≈1.62–1.64
        function: "Lateral nostril — opens nasal passages, facial issues",
      },
    ],
  },

  // ── STOMACH (ST) — Earth, bilateral — below eye → down body → 2nd toe ──────
  {
    id: "st",
    name: "Stomach",
    abbreviation: "ST",
    element: "Earth",
    color: "#ffe066",
    bilateral: true,
    points: [
      {
        id: "ST-25",
        name: "Tianshu",
        position: [0.06, 1.02, 0.08], // 2 cun lateral to navel, at navel level — x≈0.05–0.07, y≈1.01–1.03
        function: "Mu of large intestine — regulates intestines, bowels",
      },
      {
        id: "ST-36",
        name: "Zusanli",//✅✅✅✅✅✅
        position: [0.08, 0.46, 0.01], // 3 cun below knee, 1 finger lateral to tibia crest — x≈0.05–0.07, y≈0.43–0.47
        function: "Master tonification point — qi, blood, immunity, digestion",
      },
      {
        id: "ST-40",
        name: "Fenglong",//✅✅✅✅✅✅
        position: [0.08, 0.28, 0.01], // midpoint lower leg, 2 fingers lateral to ST-38, anterior foreleg — y≈0.33–0.37
        function: "Luo-connecting — resolves phlegm and dampness",
      },
      {
        id: "ST-42",
        name: "Chongyang",
        position: [0.05, 0.11, 0.04], // dorsal foot, between 2nd-3rd extensor tendons at highest arch point — y≈0.09–0.13
        function: "Source point — dorsum of foot, stomach qi, toothache",
        isSource: true,
      },
      {
        id: "ST-44",
        name: "Neiting",
        position: [0.05, 0.07, 0.03], // WEB MARGIN BETWEEN 2ND-3RD TOES, DORSAL SIDE — y≈0.06–0.08
        function: "Between 2nd-3rd toes — clears stomach heat, toothache",
      },
    ],
  },

  // ── SPLEEN (SP) — Earth, bilateral — big toe → up medial leg → chest ────────
  {
    id: "sp",
    name: "Spleen",
    abbreviation: "SP",
    element: "Earth",
    color: "#ffaa33",
    bilateral: true,
    points: [
      {
        id: "SP-3",
        name: "Taibai",
        position: [0.04, 0.1, 0.03], // medial foot, proximal-inferior to 1st MTP joint — x≈0.03–0.05, y≈0.09–0.11
        function: "Source point — tonifies spleen qi, resolves dampness",
        isSource: true,
      },
      {
        id: "SP-6",
        name: "Sanyinjiao", //✅✅✅✅✅✅
        position: [0.05, 0.078, -0.01], // 3 cun above medial malleolus, posterior to tibia — x≈0.03–0.05, y≈0.20–0.24
        function: "3 yin crossing — digestive, gynecological, sleep, blood",
      },
      {
        id: "SP-9",
        name: "Yinlingquan",
        position: [0.04, 0.52, 0.03], // posterior-inferior to medial tibial condyle, in depression — y≈0.50–0.54
        function: "Below medial knee — resolves dampness, urinary issues",
      },
      {
        id: "SP-10",
        name: "Xuehai", //✅✅✅✅✅✅✅✅
        position: [0.062, 0.56, 0.03], // 2 cun above patella superior border, medial quadriceps — y≈0.58–0.62
        function: "Sea of blood — nourishes blood, skin, menstrual disorders",
      },
      {
        id: "SP-21",//✅✅✅✅✅✅✅✅
        name: "Dabao",
        position: [0.14, 1.2, -0.045], // 6th ICS on midaxillary line, lateral chest — x≈0.13–0.16, y≈1.18–1.22
        function: "Great connecting luo — pain all over body, fatigue",
      },
    ],
  },

  // ── HEART (HT) — Fire, bilateral — axilla → medial arm → little finger ──────
  {
    id: "ht",
    name: "Heart",
    abbreviation: "HT",
    element: "Fire",
    color: "#ff4455",
    bilateral: true,
    points: [
      {
        id: "HT-3",
        name: "Shaohai", //✅✅✅✅✅✅
        position: [0.27, 1.14, -0.02], // medial elbow crease, ulnar side of biceps tendon — anterior arm, x≈0.19–0.23, y≈1.08–1.12
        function: "Calms shen, clears heart fire, elbow pain",
      },
      {
        id: "HT-7",
        name: "Shenmen", //✅
        position: [0.32, 0.88, -0.044], // ulnar wrist crease, radial side of pisiform bone — anterior, x≈0.26–0.29, y≈0.83–0.85
        function: "Source point — calms shen, anxiety, insomnia, palpitations",
        isSource: true,
      },
      {
        id: "HT-9",
        name: "Shaochong",
        position: [0.11, 0.61, 0.02], // RADIAL CORNER OF LITTLE FINGER NAIL — FINGERTIP: x≈0.10–0.12, y≈0.59–0.62, z>0
        function: "Well point — opens orifices, cardiac emergencies",
        useHandLandmark: true,
        handOffset: [-0.045, -0.01, 0.01], //✅✅✅✅✅✅✅✅
      },
    ],
  },

  // ── SMALL INTESTINE (SI) — Fire, bilateral — little finger → up arm → ear ───
  {
    id: "si",
    name: "Small Intestine",
    abbreviation: "SI",
    element: "Fire",
    color: "#ff7733",
    bilateral: true,
    // No pathPoints — line builds from the node positions below (SI-3 → SI-4
    // → SI-11 → SI-19), so it locks onto the nodes and follows when they move.
    // SI-11 (scapula) → SI-19 (front of ear) is the correct onward path; add
    // TCM neck points (SI-16/17) here as nodes to route it up the neck.
    points: [
      {
        id: "SI-3",
        name: "Houxi",
        position: [0.12, 0.65, -0.03], // DORSAL HAND, ULNAR KNUCKLE (5TH MCP JOINT) — fist raised, x≈0.11–0.14, y≈0.63–0.67, z<0
        function: "Opens governing vessel — back pain, occipital headache",
        useHandLandmark: true,
        handOffset: [0.03, 0.0, -0.02],
      },
      {
        id: "SI-4",
        name: "Wangu",
        position: [0.33, 0.9, -0.03], // ulnar wrist, between pisiform & hamate bones — dorsal side, x≈0.30–0.34, y≈0.88–0.92, z<0
        function: "Source point — ulnar wrist, jaundice, neck stiffness",
        isSource: true,
      },
      {
        id: "SI-11",
        name: "Tianzong",
        position: [0.14, 1.32, -0.07], // center of infraspinous fossa, scapula back — posterior, x≈0.12–0.16, y≈1.30–1.34, z≈-0.07
        function: "Center of scapula — shoulder, neck, breast issues",
      },
      {
        id: "SI-19",
        name: "Tinggong",
        position: [0.08, 1.615, -0.015], // ANTERIOR TO EAR TRAGUS, DEPRESSION WITH MOUTH OPEN — x≈0.07–0.09, y≈1.60–1.62, z≈0
        function: "Anterior tragus — ear disorders, tinnitus, deafness",
      },
    ],
  },

  // ── BLADDER (BL) — Water, bilateral — inner eye → over head → back → foot ───
  {
    id: "bl",
    name: "Bladder",
    abbreviation: "BL",
    element: "Water",
    color: "#4488ff",
    bilateral: true,
    pathPoints: [
      [0.02, 1.65, 0.08], // inner eye (BL-1 area)
      [0.04, 1.72, -0.01], // crown
      [0.04, 1.6, -0.05], // BL-10 nape
      [0.05, 1.05, -0.07], // BL-23
      [0.04, 0.52, -0.03], // BL-40
      [0.03, 0.32, -0.04], // BL-57
      [0.09, 0.09, 0.01], // BL-64
      [0.08, 0.04, 0.02], // BL-67
    ],
    points: [
      {
        id: "BL-10",
        name: "Tianzhu",
        position: [0.04, 1.6, -0.05], // lateral to GV-15, lateral border of trapezius at nape — x≈0.03–0.05, y≈1.58–1.62, z<0
        function: "Nape of neck — occipital headache, nasal congestion",
      },
      {
        id: "BL-23",
        name: "Shenshu",
        position: [0.05, 1.05, -0.07], // 1.5 cun lateral to L2 spinous process, lumbar back — x≈0.04–0.06, y≈1.03–1.07, z<0
        function: "Back shu of kidney — tonifies kidney, lower back pain",
      },
      {
        id: "BL-40",
        name: "Weizhong",
        position: [0.04, 0.52, -0.03], // CENTER OF POPLITEAL CREASE (BACK OF KNEE) — posterior, x≈0.03–0.05, y≈0.50–0.54, z<0
        function: "Popliteal crease — command point for the back, heat stroke",
      },
      {
        id: "BL-57",
        name: "Chengshan",
        position: [0.03, 0.32, -0.04], // gastrocnemius belly, 8 cun below BL-40, midline calf — posterior, y≈0.30–0.34, z<0
        function: "Calf midline — cramping, hemorrhoids, lower back",
      },
      {
        id: "BL-64",
        name: "Jinggu",
        position: [0.09, 0.09, 0.01], // lateral foot, distal to base of 5th metatarsal — x≈0.08–0.10, y≈0.08–0.11
        function:
          "Source point — lateral foot, stiff neck, back pain, epilepsy",
        isSource: true,
      },
      {
        id: "BL-67",
        name: "Zhiyin", // ✅✅✅✅✅✅
        position: [0.119, 0.011, 0.135], // LATERAL CORNER OF LITTLE (5TH) TOENAIL — x≈0.08–0.10, y≈0.03–0.05
        function: "Little toe — malposition of fetus, headache, eye pain",
      },
    ],
  },

  // ── KIDNEY (KD) — Water, bilateral — sole of foot → up medial leg → chest ───
  {
    id: "kd",
    name: "Kidney",
    abbreviation: "KD",
    element: "Water",
    color: "#5566ff",
    bilateral: true,
    points: [
      {
        id: "KD-1",
        name: "Yongquan",
        position: [0.04, 0.05, 0.04], // SOLE OF FOOT, ANTERIOR THIRD (BETWEEN 2ND-3RD METATARSALS) — plantar, y≈0.04–0.07, z>0
        function: "Bubbling spring — sole of foot, grounds qi, emergencies",
      },
      {
        id: "KD-3",
        name: "Taixi",
        position: [0.04, 0.13, 0.0], // midway between medial malleolus and Achilles tendon — x≈0.03–0.05, y≈0.12–0.15, z≈0
        function: "Source point — tonifies kidney yin and yang, root of all",
        isSource: true,
      },
      {
        id: "KD-7",
        name: "Fuliu",
        position: [0.04, 0.21, 0.0], // 2 cun above KD-3, anterior to Achilles tendon — x≈0.03–0.05, y≈0.19–0.23, z≈0
        function: "Tonifies kidney yang, edema, night sweats",
      },
      {
        id: "KD-27",
        name: "Shufu",
        position: [0.06, 1.42, 0.07], // 2 cun lateral to midline, just below clavicle — x≈0.05–0.07, y≈1.40–1.44
        function: "Below clavicle — descends rebellious lung qi, cough",
      },
    ],
  },

  // ── PERICARDIUM (PC) — Fire, bilateral — chest → anterior arm → middle finger
  {
    id: "pc",
    name: "Pericardium",
    abbreviation: "PC",
    element: "Fire",
    color: "#ff6688",
    bilateral: true,
    points: [
      {
        id: "PC-3",
        name: "Quze",//✅✅✅✅✅✅
        position: [0.25, 1.16, -0.035], // medial elbow crease, ulnar side of biceps tendon — anterior arm, x≈0.22–0.26, y≈1.08–1.12
        function: "Elbow crease — clears heat, calms shen, nausea",
      },
      {
        id: "PC-6",
        name: "Neiguan", //✅✅✅✅✅✅
        position: [0.34, 0.92, -0.068], // 2 cun above PC-7, between palmaris longus & flexor carpi radialis — anterior, y≈0.86–0.90
        function: "Opens Yin Wei vessel — nausea, heart, anxiety, wrist",
      },
      {
        id: "PC-7",
        name: "Daling",
        position: [0.353, 0.885, -0.061], //✅ wrist crease center, between palmaris longus & flexor carpi radialis — anterior, y≈0.83–0.85
        function: "Source point — calms shen, carpal tunnel, chest pain",
        isSource: true,
      },
      {
        id: "PC-8",
        name: "Laogong",
        position: [0.13, 0.68, 0.03], // PALM CENTER, AT 3RD METACARPAL HEAD — anterior hand, x≈0.12–0.14, y≈0.66–0.70, z>0
        function: "Palm center — clears heat, calms the heart",
        useHandLandmark: true,
        handOffset: [0.0, 0.04, 0.02],
      },
      {
        id: "PC-9",
        name: "Zhongchong",
        position: [0.12, 0.6, 0.02], // TIP OF MIDDLE FINGER — FINGERTIP: x≈0.11–0.13, y≈0.58–0.62, z>0
        function: "Middle fingertip — heat stroke, loss of consciousness",
        useHandLandmark: true,
        handOffset: [0.0, 0.0, 0.0],
      },
    ],
  },

  // ── TRIPLE WARMER (TW) — Fire, bilateral — ring finger → up arm → eyebrow ───
  {
    id: "tw",
    name: "Triple Warmer",
    abbreviation: "TW",
    element: "Fire",
    color: "#ff8800",
    bilateral: true,
    // No pathPoints — the line is built from the node positions below, so
    // moving a node moves the line. Add TCM points (e.g. an elbow point) to
    // this array to give the line more anchors to thread through.
    points: [
      {
        id: "TW-4",
        name: "Yangchi",
        position: [0.35, 0.89, -0.04], // dorsal wrist crease center, ulnar to extensor tendons — posterior, x≈0.28–0.32, y≈0.83–0.85, z<0
        function: "Source point — wrist pain, malaria, dry mouth",
        isSource: true,
      },
      {
        id: "TW-5",
        name: "Waiguan", //✅✅✅✅✅✅✅
        position: [0.3, 1.025, -0.08], // 2 cun above TW-4, dorsal forearm between radius & ulna — posterior, y≈0.86–0.90, z<0
        function: "Opens Yang Wei vessel — fever, headache, deafness",
      },
      {
        id: "TW-14",//✅✅✅✅✅✅✅
        name: "Jianliao",
        position: [0.16, 1.42, -0.06], // posterior-inferior to acromion, between two deltoid tendons — x≈0.13–0.16, y≈1.40–1.44, z<0
        function: "Posterior shoulder — shoulder pain, limited mobility",
      },
      {
        id: "TW-23",//✅✅✅✅✅✅✅
        name: "Sizhukong",
        position: [0.05, 1.65, 0.05], // LATERAL END OF EYEBROW, IN DEPRESSION — x≈0.06–0.08, y≈1.64–1.66
        function: "Lateral eyebrow end — headache, eye disorders, facial",
      },
    ],
  },

  // ── GALLBLADDER (GB) — Wood, bilateral — outer eye → head → body → 4th toe ─
  {
    id: "gb",
    name: "Gallbladder",
    abbreviation: "GB",
    element: "Wood",
    color: "#44dd44",
    bilateral: true,
    pathPoints: [
      [0.09, 1.63, 0.07], // outer eye (GB-1 area)
      [0.1, 1.66, 0.01], // lateral temple
      [0.06, 1.6, -0.04], // GB-20 nape
      [0.14, 1.45, -0.02], // GB-21 shoulder
      [0.12, 0.88, -0.02], // GB-30 hip
      [0.07, 0.5, 0.03], // GB-34 knee
      [0.07, 0.13, 0.04], // GB-40
      [0.06, 0.04, 0.03], // GB-44
    ],
    points: [
      {
        id: "GB-20",
        name: "Fengchi",
        position: [0.06, 1.6, -0.04], // below occipital bone, between SCM & trapezius — posterior, x≈0.05–0.07, y≈1.58–1.62, z<0
        function: "Wind pool — wind-cold, headache, neck, eyes, all wind",
      },
      {
        id: "GB-21",
        name: "Jianjing",
        position: [0.14, 1.45, -0.02], // midpoint of shoulder, between GV-14 and acromion tip — x≈0.12–0.16, y≈1.43–1.47
        function: "Shoulder well — neck/shoulder pain, induces labor",
      },
      {
        id: "GB-30",
        name: "Huantiao",
        position: [0.12, 0.88, -0.02], // 1/3 of the way from greater trochanter to sacral hiatus — lateral hip, x≈0.11–0.14, y≈0.86–0.90
        function: "Hip joint — sciatica, lateral leg pain, hip disorders",
      },
      {
        id: "GB-34",
        name: "Yanglingquan",
        position: [0.07, 0.5, 0.03], // anterior-inferior to head of fibula, lateral knee — x≈0.06–0.08, y≈0.48–0.52
        function: "Influential for sinews — lateral knee, tendons, cramps",
      },
      {
        id: "GB-40",
        name: "Qiuxu", //✅✅✅✅✅✅
        position: [0.099, 0.047, -0.023], // anterior-inferior to lateral malleolus, in depression — x≈0.06–0.08, y≈0.11–0.15
        function: "Source point — ankle pain, lateral leg, distension",
        isSource: true,
      },
      {
        id: "GB-44",
        name: "Zuqiaoyin",
        position: [0.06, 0.04, 0.03], // LATERAL CORNER OF 4TH TOENAIL — x≈0.05–0.07, y≈0.03–0.05
        function: "4th toe — headache, tinnitus, eye redness, rib pain",
      },
    ],
  },

  // ── LIVER (LV) — Wood, bilateral — big toe → up medial leg → chest/ribs ─────
  {
    id: "lv",
    name: "Liver",
    abbreviation: "LV",
    element: "Wood",
    color: "#22cc44",
    bilateral: true,
    points: [
      {
        id: "LV-1",
        name: "Dadun",
        position: [0.04, 0.04, 0.03], // LATERAL CORNER OF BIG TOENAIL — x≈0.03–0.05, y≈0.03–0.05
        function: "Big toe — genitourinary, hernias, menstrual, revival",
      },
      {
        id: "LV-3",
        name: "Taichong",
        position: [0.04, 0.1, 0.04], // dorsal foot, between 1st-2nd metatarsals, proximal to web — x≈0.03–0.05, y≈0.08–0.12
        function: "Source point — moves liver qi, stress, headache, PMS",
        isSource: true,
      },
      {
        id: "LV-8",
        name: "Ququan",
        position: [0.04, 0.54, 0.03], // medial knee crease, posterior to medial condyle of tibia — x≈0.03–0.05, y≈0.52–0.56
        function: "Medial knee — tonifies liver blood, genitourinary",
      },
      {
        id: "LV-13",
        name: "Zhangmen",
        position: [0.12, 1.12, 0.06], // inferior tip of 11th (floating) rib — lateral, x≈0.11–0.14, y≈1.10–1.14
        function: "Mu of spleen, influential for zang organs — lateral rib",
      },
      {
        id: "LV-14",
        name: "Qimen",
        position: [0.1, 1.25, 0.07], // 6th ICS on midclavicular line — x≈0.09–0.12, y≈1.23–1.27
        function: "Front mu of liver — liver/gallbladder, intercostal pain",
      },
    ],
  },
];
