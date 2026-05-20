// Meridian point coordinates use the same GLB space as organs.js:
//   y=0 → feet, y=1.75 → head
//   z>0 → front (anterior), z<0 → back (posterior)
//   x<0 → body's RIGHT, x>0 → body's LEFT
//
// bilateral: true → point is mirrored on both sides (render at +x AND -x)
// All positions stored for body's LEFT side (x>0); mirroring flips x sign.
// Midline meridians (GV, CV) are not bilateral.
//
// ⚠️  Positions are first-approximation. Calibrate in browser by nudging constants.

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
        position: [0, 1.05, -0.07],
        function: "Gate of life — kidney yang, vitality root",
      },
      {
        id: "GV-14",
        name: "Dazhui",
        position: [0, 1.58, -0.06],
        function: "Clears heat, boosts yang, sea of all yang",
      },
      {
        id: "GV-20",
        name: "Baihui",
        position: [0, 1.72, 0.0],
        function: "Crown point — raises yang qi, calms shen",
      },
      {
        id: "GV-24",
        name: "Shenting",
        position: [0, 1.67, 0.06],
        function: "Calms the mind, spirit gate on forehead",
      },
      {
        id: "GV-26",
        name: "Renzhong",
        position: [0, 1.62, 0.08],
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
        position: [0, 0.96, 0.08],
        function: "Gate of origin — lower dan tian, source qi",
      },
      {
        id: "CV-6",
        name: "Qihai",
        position: [0, 0.99, 0.08],
        function: "Sea of qi — tonifies qi and yang",
      },
      {
        id: "CV-8",
        name: "Shenque",
        position: [0, 1.02, 0.08],
        function: "Navel — fortifies original qi, warms yang",
      },
      {
        id: "CV-12",
        name: "Zhongwan",
        position: [0, 1.12, 0.08],
        function: "Middle epigastrium — mu point of stomach",
      },
      {
        id: "CV-17",
        name: "Shanzhong",
        position: [0, 1.28, 0.08],
        function: "Chest center — sea of qi, mu point of pericardium",
      },
      {
        id: "CV-22",
        name: "Tiantu",
        position: [0, 1.52, 0.07],
        function: "Throat hollow — opens lungs, descends rebellious qi",
      },
    ],
  },

  // ── LUNG (LU) — Metal, bilateral ──────────────────────────────────────────
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
        name: "Zhongfu",
        position: [0.12, 1.4, 0.07],
        function: "Front mu of lung — disperses lung qi, opens chest",
      },
      {
        id: "LU-5",
        name: "Chize",
        position: [0.15, 1.1, 0.03],
        function: "Elbow crease — clears lung heat, descends lung qi",
      },
      {
        id: "LU-7",
        name: "Lieque",
        position: [0.15, 0.88, 0.02],
        function: "Luo-connecting — opens conception vessel, headache",
      },
      {
        id: "LU-9",
        name: "Taiyuan",
        position: [0.15, 0.84, 0.02],
        function: "Source point — tonifies lung qi, influential for vessels",
      },
      {
        id: "LU-11",
        name: "Shaoshang",
        position: [0.14, 0.66, 0.02],
        function: "Well point — clears heat, benefits throat, resuscitates",
      },
    ],
  },

  // ── LARGE INTESTINE (LI) — Metal, bilateral ───────────────────────────────
  {
    id: "li",
    name: "Large Intestine",
    abbreviation: "LI",
    element: "Metal",
    color: "#e0e8ff",
    bilateral: true,
    points: [
      {
        id: "LI-4",
        name: "Hegu",
        position: [0.15, 0.7, 0.02],
        function: "Source point — the great eliminator, pain, immune",
      },
      {
        id: "LI-10",
        name: "Shousanli",
        position: [0.15, 1.05, 0.04],
        function: "3 cun below elbow — digestion, arm pain",
      },
      {
        id: "LI-11",
        name: "Quchi",
        position: [0.15, 1.1, 0.04],
        function: "Elbow crease — clears heat, drains dampness, immunity",
      },
      {
        id: "LI-15",
        name: "Jianyu",
        position: [0.15, 1.42, 0.04],
        function: "Anterior acromion — shoulder pain, wind-damp",
      },
      {
        id: "LI-20",
        name: "Yingxiang",
        position: [0.04, 1.63, 0.09],
        function: "Lateral nostril — opens nasal passages, facial issues",
      },
    ],
  },

  // ── STOMACH (ST) — Earth, bilateral ───────────────────────────────────────
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
        position: [0.06, 1.02, 0.08],
        function: "Mu of large intestine — regulates intestines, bowels",
      },
      {
        id: "ST-36",
        name: "Zusanli",
        position: [0.06, 0.45, 0.05],
        function: "Master tonification point — qi, blood, immunity, digestion",
      },
      {
        id: "ST-40",
        name: "Fenglong",
        position: [0.06, 0.35, 0.04],
        function: "Luo-connecting — resolves phlegm and dampness",
      },
      {
        id: "ST-44",
        name: "Neiting",
        position: [0.05, 0.07, 0.03],
        function: "Between 2nd-3rd toes — clears stomach heat, toothache",
      },
    ],
  },

  // ── SPLEEN (SP) — Earth, bilateral ────────────────────────────────────────
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
        position: [0.04, 0.1, 0.03],
        function: "Source point — tonifies spleen qi, resolves dampness",
      },
      {
        id: "SP-6",
        name: "Sanyinjiao",
        position: [0.04, 0.22, 0.02],
        function: "3 yin crossing — digestive, gynecological, sleep, blood",
      },
      {
        id: "SP-9",
        name: "Yinlingquan",
        position: [0.04, 0.52, 0.03],
        function: "Below medial knee — resolves dampness, urinary issues",
      },
      {
        id: "SP-10",
        name: "Xuehai",
        position: [0.04, 0.6, 0.03],
        function: "Sea of blood — nourishes blood, skin, menstrual disorders",
      },
      {
        id: "SP-21",
        name: "Dabao",
        position: [0.14, 1.2, 0.02],
        function: "Great connecting luo — pain all over body, fatigue",
      },
    ],
  },

  // ── HEART (HT) — Fire, bilateral ──────────────────────────────────────────
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
        name: "Shaohai",
        position: [0.15, 1.1, 0.02],
        function: "Calms shen, clears heart fire, elbow pain",
      },
      {
        id: "HT-7",
        name: "Shenmen",
        position: [0.15, 0.84, 0.01],
        function: "Source point — calms shen, anxiety, insomnia, palpitations",
      },
      {
        id: "HT-9",
        name: "Shaochong",
        position: [0.14, 0.66, 0.01],
        function: "Well point — opens orifices, cardiac emergencies",
      },
    ],
  },

  // ── SMALL INTESTINE (SI) — Fire, bilateral ────────────────────────────────
  {
    id: "si",
    name: "Small Intestine",
    abbreviation: "SI",
    element: "Fire",
    color: "#ff7733",
    bilateral: true,
    points: [
      {
        id: "SI-3",
        name: "Houxi",
        position: [0.15, 0.7, 0.0],
        function: "Opens governing vessel — back pain, occipital headache",
      },
      {
        id: "SI-11",
        name: "Tianzong",
        position: [0.14, 1.32, -0.07],
        function: "Center of scapula — shoulder, neck, breast issues",
      },
      {
        id: "SI-19",
        name: "Tinggong",
        position: [0.09, 1.6, 0.07],
        function: "Anterior tragus — ear disorders, tinnitus, deafness",
      },
    ],
  },

  // ── BLADDER (BL) — Water, bilateral ───────────────────────────────────────
  {
    id: "bl",
    name: "Bladder",
    abbreviation: "BL",
    element: "Water",
    color: "#4488ff",
    bilateral: true,
    points: [
      {
        id: "BL-10",
        name: "Tianzhu",
        position: [0.04, 1.6, -0.05],
        function: "Nape of neck — occipital headache, nasal congestion",
      },
      {
        id: "BL-23",
        name: "Shenshu",
        position: [0.05, 1.05, -0.07],
        function: "Back shu of kidney — tonifies kidney, lower back pain",
      },
      {
        id: "BL-40",
        name: "Weizhong",
        position: [0.04, 0.52, -0.03],
        function: "Popliteal crease — command point for the back, heat stroke",
      },
      {
        id: "BL-57",
        name: "Chengshan",
        position: [0.03, 0.32, -0.04],
        function: "Calf midline — cramping, hemorrhoids, lower back",
      },
      {
        id: "BL-67",
        name: "Zhiyin",
        position: [0.08, 0.04, 0.02],
        function: "Little toe — malposition of fetus, headache, eye pain",
      },
    ],
  },

  // ── KIDNEY (KD) — Water, bilateral ────────────────────────────────────────
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
        position: [0.04, 0.05, 0.04],
        function: "Bubbling spring — sole of foot, grounds qi, emergencies",
      },
      {
        id: "KD-3",
        name: "Taixi",
        position: [0.04, 0.13, 0.0],
        function: "Source point — tonifies kidney yin and yang, root of all",
      },
      {
        id: "KD-7",
        name: "Fuliu",
        position: [0.04, 0.21, 0.0],
        function: "Tonifies kidney yang, edema, night sweats",
      },
      {
        id: "KD-27",
        name: "Shufu",
        position: [0.06, 1.42, 0.07],
        function: "Below clavicle — descends rebellious lung qi, cough",
      },
    ],
  },

  // ── PERICARDIUM (PC) — Fire, bilateral ────────────────────────────────────
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
        name: "Quze",
        position: [0.15, 1.1, 0.03],
        function: "Elbow crease — clears heat, calms shen, nausea",
      },
      {
        id: "PC-6",
        name: "Neiguan",
        position: [0.15, 0.88, 0.03],
        function: "Opens Yin Wei vessel — nausea, heart, anxiety, wrist",
      },
      {
        id: "PC-7",
        name: "Daling",
        position: [0.15, 0.84, 0.03],
        function: "Source point — calms shen, carpal tunnel, chest pain",
      },
      {
        id: "PC-8",
        name: "Laogong",
        position: [0.14, 0.72, 0.02],
        function: "Palm center — clears heat, calms the heart",
      },
      {
        id: "PC-9",
        name: "Zhongchong",
        position: [0.14, 0.63, 0.02],
        function: "Middle fingertip — heat stroke, loss of consciousness",
      },
    ],
  },

  // ── TRIPLE WARMER (TW) — Fire, bilateral ──────────────────────────────────
  {
    id: "tw",
    name: "Triple Warmer",
    abbreviation: "TW",
    element: "Fire",
    color: "#ff8800",
    bilateral: true,
    points: [
      {
        id: "TW-4",
        name: "Yangchi",
        position: [0.15, 0.84, 0.0],
        function: "Source point — wrist pain, malaria, dry mouth",
      },
      {
        id: "TW-5",
        name: "Waiguan",
        position: [0.15, 0.88, 0.0],
        function: "Opens Yang Wei vessel — fever, headache, deafness",
      },
      {
        id: "TW-14",
        name: "Jianliao",
        position: [0.15, 1.42, -0.02],
        function: "Posterior shoulder — shoulder pain, limited mobility",
      },
      {
        id: "TW-23",
        name: "Sizhukong",
        position: [0.07, 1.65, 0.07],
        function: "Lateral eyebrow end — headache, eye disorders, facial",
      },
    ],
  },

  // ── GALLBLADDER (GB) — Wood, bilateral ────────────────────────────────────
  {
    id: "gb",
    name: "Gallbladder",
    abbreviation: "GB",
    element: "Wood",
    color: "#44dd44",
    bilateral: true,
    points: [
      {
        id: "GB-20",
        name: "Fengchi",
        position: [0.06, 1.6, -0.04],
        function: "Wind pool — wind-cold, headache, neck, eyes, all wind",
      },
      {
        id: "GB-21",
        name: "Jianjing",
        position: [0.14, 1.45, -0.02],
        function: "Shoulder well — neck/shoulder pain, induces labor",
      },
      {
        id: "GB-30",
        name: "Huantiao",
        position: [0.12, 0.88, -0.02],
        function: "Hip joint — sciatica, lateral leg pain, hip disorders",
      },
      {
        id: "GB-34",
        name: "Yanglingquan",
        position: [0.07, 0.5, 0.03],
        function: "Influential for sinews — lateral knee, tendons, cramps",
      },
      {
        id: "GB-40",
        name: "Qiuxu",
        position: [0.07, 0.13, 0.04],
        function: "Source point — ankle pain, lateral leg, distension",
      },
      {
        id: "GB-44",
        name: "Zuqiaoyin",
        position: [0.06, 0.04, 0.03],
        function: "4th toe — headache, tinnitus, eye redness, rib pain",
      },
    ],
  },

  // ── LIVER (LV) — Wood, bilateral ──────────────────────────────────────────
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
        position: [0.04, 0.04, 0.03],
        function: "Big toe — genitourinary, hernias, menstrual, revival",
      },
      {
        id: "LV-3",
        name: "Taichong",
        position: [0.04, 0.1, 0.04],
        function: "Source point — moves liver qi, stress, headache, PMS",
      },
      {
        id: "LV-8",
        name: "Ququan",
        position: [0.04, 0.54, 0.03],
        function: "Medial knee — tonifies liver blood, genitourinary",
      },
      {
        id: "LV-13",
        name: "Zhangmen",
        position: [0.12, 1.12, 0.06],
        function: "Mu of spleen, influential for zang organs — lateral rib",
      },
      {
        id: "LV-14",
        name: "Qimen",
        position: [0.1, 1.25, 0.07],
        function: "Front mu of liver — liver/gallbladder, intercostal pain",
      },
    ],
  },
];
