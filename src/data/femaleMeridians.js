// FEMALE meridian point coordinates. Male coordinates live in meridians.js.
// Starts as an exact copy of the male set — hand-adjust these to the female
// mesh. Comments (tech/simple) describe the anatomical location and are the
// same for both sexes; only the [x,y,z] coordinates should diverge.
// Coordinates use the same GLB space as organs.js:
//   y=0 → feet, y=1.75 → head
//   z>0 → front (anterior), z<0 → back (posterior)
//   x>0 → body's RIGHT side (mirrored to -x for bilateral left side)
//
// bilateral: true → mirrored; midline meridians (GV, CV) are not bilateral.
// isSource: true → yuan (source) point — rendered larger as visual anchor.
// Points in anatomical flow order (used for pathway lines).
//
// Each point carries two location comments:
//   tech:   the clinical TCM/anatomical definition
//   simple: the same spot in plain language
//
// ARM COORDINATE SYSTEM (derived from ExtremitySampler, 2026-06-27):
//   Model is in A-pose — arms angle out and down.
//   Anterior arm (LU, PC, HT) z ≈ +0.02 to +0.05
//   Posterior arm (LI, TW, SI) z ≈ −0.04 to −0.06

export const femaleMeridians = [
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
        // tech: below L2 spinous process, midline back
        // simple: on the spine in the small of the lower back, level with the navel
        function: "Gate of life — kidney yang, vitality root",
        isSource: true,
      },
      {
        id: "GV-14",
        name: "Dazhui",
        position: [0, 1.5484, -0.06],
        // tech: below C7 spinous process (most prominent vertebra at nape), midline
        // simple: the big bump at the base of the neck where it meets the shoulders
        function: "Clears heat, boosts yang, sea of all yang",
      },
      {
        id: "GV-20",
        name: "Baihui",
        position: [0, 1.6856, 0.0],
        // tech: crown of head, midline
        // simple: the very top of the head, center
        function: "Crown point — raises yang qi, calms shen",
      },
      {
        id: "GV-24",
        name: "Shenting",
        position: [0, 1.6366, 0.07],
        // tech: anterior hairline, midline forehead, 0.5 cun into hairline
        // simple: center of the forehead, just above where the hairline starts
        function: "Calms the mind, spirit gate on forehead",
      },
      {
        id: "GV-26",
        name: "Renzhong",
        position: [0, 1.5876, 0.09],
        // tech: philtrum center (groove below nose), midline upper lip
        // simple: the little groove between the nose and the upper lip
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
        // tech: 3 cun below navel, lower abdomen midline
        // simple: about four fingers below the navel, center
        function: "Gate of origin — lower dan tian, source qi",
        isSource: true,
      },
      {
        id: "CV-6",
        name: "Qihai",
        position: [0, 0.99, 0.08],
        // tech: 1.5 cun below navel, lower abdomen midline
        // simple: about two fingers below the navel, center
        function: "Sea of qi — tonifies qi and yang",
      },
      {
        id: "CV-8",
        name: "Shenque",
        position: [0, 1.02, 0.08],
        // tech: navel center, midline
        // simple: the navel
        function: "Navel — fortifies original qi, warms yang",
      },
      {
        id: "CV-12",
        name: "Zhongwan",
        position: [0, 1.12, 0.08],
        // tech: 4 cun above navel, midline epigastrium
        // simple: halfway between the navel and the bottom of the breastbone
        function: "Middle epigastrium — mu point of stomach",
      },
      {
        id: "CV-17",
        name: "Shanzhong",
        position: [0, 1.28, 0.08],
        // tech: sternum midline at 4th ICS level (between nipples)
        // simple: center of the breastbone, level with the nipples
        function: "Chest center — sea of qi, mu point of pericardium",
      },
      {
        id: "CV-22",
        name: "Tiantu",
        position: [0, 1.4406, 0.07],
        // tech: suprasternal notch (hollow at base of throat), midline
        // simple: the hollow at the base of the throat, above the breastbone
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
        name: "Zhongfu", //✅✅✅✅ new
        position: [0.13, 1.37, -0.01],
        // tech: subclavicular fossa, 1 cun lateral to midline at 1st ICS
        // simple: hollow just below the outer collarbone, near the shoulder
        function: "Front mu of lung — disperses lung qi, opens chest",
      },
      {
        id: "LU-5", //✅✅✅✅ new
        name: "Chize",
        position: [0.24, 1.1172, -0.05],
        // tech: elbow crease, radial side of biceps tendon (anterior arm)
        // simple: on the elbow crease, thumb side
        function: "Elbow crease — clears lung heat, descends lung qi",
      },
      {
        id: "LU-7",
        name: "Lieque", // ✅
        position: [0.26, 1.0094, -0.065],
        // tech: 1.5 cun above LU-9, radial forearm (anterior)
        // simple: thumb-side of the forearm, a bit above the wrist
        function: "Luo-connecting — opens conception vessel, headache",
      },
      {
        id: "LU-9",
        name: "Taiyuan",
        position: [0.356, 0.8732, -0.02],
        // tech: radial wrist crease, lateral to radial artery
        // simple: on the wrist crease at the base of the thumb, where you feel the pulse
        function: "Source point — tonifies lung qi, influential for vessels",
        isSource: true,
      },
      {
        id: "LU-11",
        name: "Shaoshang",
        position: [0.365, 0.768, -0.013],
        // tech: radial corner of the thumbnail (fingertip)
        // simple: outer corner of the thumbnail
        function: "Well point — clears heat, benefits throat, resuscitates",
        useHandLandmark: false,
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
        position: [0.302, 0.734, -0.073],
        // tech: dorsal hand, between 1st-2nd metacarpals, at midpoint of 2nd MC
        // simple: the web of muscle between thumb and index finger, back of the hand
        function: "Source point — the great eliminator, pain, immune",
        useHandLandmark: false,
        handOffset: [-0.01, 0.0, -0.03],
        isSource: true,
      },
      {
        id: "LI-10",
        name: "Shousanli",
        position: [0.27, 1.029, -0.02],
        // tech: 2 cun below LI-11, dorsal forearm
        // simple: on the back of the forearm, a bit below the elbow
        function: "3 cun below elbow — digestion, arm pain",
      },
      {
        id: "LI-11", //✅✅✅✅✅✅
        name: "Quchi",
        position: [0.26, 1.1074, -0.075],
        // tech: lateral elbow crease end, between biceps and lateral epicondyle
        // simple: the outer end of the elbow crease when the arm is bent
        function: "Elbow crease — clears heat, drains dampness, immunity",
      },
      {
        id: "LI-15", //✅✅✅✅✅✅
        name: "Jianyu",
        position: [0.135, 1.4, -0.059],
        // tech: anterior acromion depression, arm abducted
        // simple: the front dimple at the tip of the shoulder when the arm lifts
        function: "Anterior acromion — shoulder pain, wind-damp",
      },
      {
        id: "LI-20", //✅✅✅✅✅✅
        name: "Yingxiang",
        position: [0.015, 1.568, 0.09],
        // tech: nasolabial groove, lateral to ala nasi (nostril wing)
        // simple: the smile-line crease right beside the nostril
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
        position: [0.06, 1.02, 0.08],
        // tech: 2 cun lateral to navel, at navel level
        // simple: about three fingers out to the side from the navel
        function: "Mu of large intestine — regulates intestines, bowels",
      },
      {
        id: "ST-36",
        name: "Zusanli", //✅✅✅✅✅✅
        position: [0.08, 0.46, 0.01],
        // tech: 3 cun below knee, 1 finger lateral to tibia crest
        // simple: four fingers below the kneecap, one finger outside the shinbone
        function: "Master tonification point — qi, blood, immunity, digestion",
      },
      {
        id: "ST-40",
        name: "Fenglong", //✅✅✅✅✅✅
        position: [0.08, 0.28, 0.01],
        // tech: midpoint of lower leg, 2 fingers lateral to ST-38, anterior foreleg
        // simple: halfway down the shin, on the front-outer side
        function: "Luo-connecting — resolves phlegm and dampness",
      },
      {
        id: "ST-42",
        name: "Chongyang",
        position: [0.05, 0.11, 0.04],
        // tech: dorsal foot, between 2nd-3rd extensor tendons at highest arch point
        // simple: the highest point on the top of the foot
        function: "Source point — dorsum of foot, stomach qi, toothache",
        isSource: true,
      },
      {
        id: "ST-44",
        name: "Neiting",
        position: [0.05, 0.07, 0.03],
        // tech: web margin between 2nd-3rd toes, dorsal side
        // simple: the web between the 2nd and 3rd toes, top side
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
        position: [0.04, 0.1, 0.03],
        // tech: medial foot, proximal-inferior to 1st MTP joint
        // simple: inner edge of the foot, just behind the big-toe knuckle
        function: "Source point — tonifies spleen qi, resolves dampness",
        isSource: true,
      },
      {
        id: "SP-6",
        name: "Sanyinjiao", //✅✅✅✅✅✅
        position: [0.05, 0.078, -0.01],
        // tech: 3 cun above medial malleolus, posterior to tibia
        // simple: four fingers above the inner ankle bone, behind the shinbone
        function: "3 yin crossing — digestive, gynecological, sleep, blood",
      },
      {
        id: "SP-9",
        name: "Yinlingquan",
        position: [0.04, 0.52, 0.03],
        // tech: posterior-inferior to medial tibial condyle, in depression
        // simple: just below the inner knee, in the hollow beside the shinbone
        function: "Below medial knee — resolves dampness, urinary issues",
      },
      {
        id: "SP-10",
        name: "Xuehai", //✅✅✅✅✅✅✅✅
        position: [0.062, 0.56, 0.03],
        // tech: 2 cun above patella superior border, medial quadriceps
        // simple: on the inner thigh, a couple inches above the kneecap
        function: "Sea of blood — nourishes blood, skin, menstrual disorders",
      },
      {
        id: "SP-21", //✅✅✅✅✅✅✅✅
        name: "Dabao",
        position: [0.14, 1.2, -0.045],
        // tech: 6th ICS on midaxillary line, lateral chest
        // simple: on the side of the ribcage, straight down from the armpit
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
        position: [0.27, 1.1172, -0.02],
        // tech: medial elbow crease, ulnar side of biceps tendon (anterior arm)
        // simple: the inner end of the elbow crease, pinky side
        function: "Calms shen, clears heart fire, elbow pain",
      },
      {
        id: "HT-7",
        name: "Shenmen", //✅
        position: [0.32, 0.8624, -0.044],
        // tech: ulnar wrist crease, radial side of pisiform bone (anterior)
        // simple: on the wrist crease, pinky side
        function: "Source point — calms shen, anxiety, insomnia, palpitations",
        isSource: true,
      },
      {
        id: "HT-9",
        name: "Shaochong",
        position: [0.27, 0.725, -0.033],
        // tech: radial corner of the little fingernail (fingertip)
        // simple: inner corner of the pinky nail
        function: "Well point — opens orifices, cardiac emergencies",
        useHandLandmark: false,
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
        position: [0.338, 0.734, -0.063],
        // tech: dorsal hand, ulnar knuckle (5th MCP joint), fist raised
        // simple: the pinky knuckle on the edge of the hand, in a loose fist
        function: "Opens governing vessel — back pain, occipital headache",
        useHandLandmark: false,
        handOffset: [0.03, 0.0, -0.02],
      },
      {
        id: "SI-4",
        name: "Wangu",
        position: [0.33, 0.882, -0.03],
        // tech: ulnar wrist, between pisiform & hamate bones (dorsal side)
        // simple: on the pinky-side edge of the wrist, back of the hand
        function: "Source point — ulnar wrist, jaundice, neck stiffness",
        isSource: true,
      },
      {
        id: "SI-11",
        name: "Tianzong",
        position: [0.14, 1.2936, -0.07],
        // tech: center of infraspinous fossa, scapula (back)
        // simple: the middle of the shoulder blade, on the back
        function: "Center of scapula — shoulder, neck, breast issues",
      },
      {
        id: "SI-19",
        name: "Tinggong",
        position: [0.08, 1.5827, -0.015],
        // tech: anterior to ear tragus, depression with mouth open
        // simple: just in front of the ear opening
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
      [0.02, 1.617, 0.08], // inner eye (BL-1 area)
      [0.04, 1.6856, -0.01], // crown
      [0.04, 1.568, -0.05], // BL-10 nape
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
        position: [0.04, 1.568, -0.05],
        // tech: lateral to GV-15, lateral border of trapezius at nape
        // simple: back of the neck, just outside the midline at the base of the skull
        function: "Nape of neck — occipital headache, nasal congestion",
      },
      {
        id: "BL-23",
        name: "Shenshu",
        position: [0.05, 1.05, -0.07],
        // tech: 1.5 cun lateral to L2 spinous process, lumbar back
        // simple: on the lower back, either side of the spine at waist level
        function: "Back shu of kidney — tonifies kidney, lower back pain",
      },
      {
        id: "BL-40",
        name: "Weizhong",
        position: [0.04, 0.52, -0.03],
        // tech: center of popliteal crease (back of knee)
        // simple: center of the crease behind the knee
        function: "Popliteal crease — command point for the back, heat stroke",
      },
      {
        id: "BL-57",
        name: "Chengshan",
        position: [0.03, 0.32, -0.04],
        // tech: gastrocnemius belly, 8 cun below BL-40, midline calf (posterior)
        // simple: middle of the calf, where the muscle splits into two
        function: "Calf midline — cramping, hemorrhoids, lower back",
      },
      {
        id: "BL-64",
        name: "Jinggu",
        position: [0.09, 0.09, 0.01],
        // tech: lateral foot, distal to base of 5th metatarsal
        // simple: outer edge of the foot, below the little-toe bump
        function:
          "Source point — lateral foot, stiff neck, back pain, epilepsy",
        isSource: true,
      },
      {
        id: "BL-67",
        name: "Zhiyin", // ✅✅✅✅✅✅
        position: [0.119, 0.011, 0.135],
        // tech: lateral corner of the little (5th) toenail
        // simple: outer corner of the little-toe nail
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
        position: [0.04, 0.05, 0.04],
        // tech: sole of foot, anterior third (between 2nd-3rd metatarsals), plantar
        // simple: on the sole, in the hollow just behind the ball of the foot
        function: "Bubbling spring — sole of foot, grounds qi, emergencies",
      },
      {
        id: "KD-3",
        name: "Taixi",
        position: [0.04, 0.13, 0.0],
        // tech: midway between medial malleolus and Achilles tendon
        // simple: between the inner ankle bone and the Achilles tendon
        function: "Source point — tonifies kidney yin and yang, root of all",
        isSource: true,
      },
      {
        id: "KD-7",
        name: "Fuliu",
        position: [0.04, 0.21, 0.0],
        // tech: 2 cun above KD-3, anterior to Achilles tendon
        // simple: a couple inches above the inner ankle, in front of the Achilles
        function: "Tonifies kidney yang, edema, night sweats",
      },
      {
        id: "KD-27",
        name: "Shufu",
        position: [0.04, 1.381, 0.02],
        // tech: 2 cun lateral to midline, just below the clavicle
        // simple: just below the collarbone, near the breastbone
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
        name: "Quze", //✅✅✅✅✅✅
        position: [0.25, 1.1368, -0.035],
        // tech: medial elbow crease, ulnar side of biceps tendon (anterior arm)
        // simple: on the elbow crease, pinky side of the tendon
        function: "Elbow crease — clears heat, calms shen, nausea",
      },
      {
        id: "PC-6",
        name: "Neiguan", //✅✅✅✅✅✅
        position: [0.34, 0.9016, -0.068],
        // tech: 2 cun above PC-7, between palmaris longus & flexor carpi radialis (anterior)
        // simple: inner forearm, about three fingers above the wrist crease, center
        function: "Opens Yin Wei vessel — nausea, heart, anxiety, wrist",
      },
      {
        id: "PC-7",
        name: "Daling", //✅
        position: [0.353, 0.8673, -0.061],
        // tech: wrist crease center, between palmaris longus & flexor carpi radialis (anterior)
        // simple: center of the inner wrist crease
        function: "Source point — calms shen, carpal tunnel, chest pain",
        isSource: true,
      },
      {
        id: "PC-8",
        name: "Laogong",
        position: [0.311, 0.773, -0.023],
        // tech: palm center, at the 3rd metacarpal head
        // simple: center of the palm
        function: "Palm center — clears heat, calms the heart",
        useHandLandmark: false,
        handOffset: [0.0, 0.04, 0.02],
      },
      {
        id: "PC-9",
        name: "Zhongchong",
        position: [0.311, 0.734, -0.043],
        // tech: tip of the middle finger (fingertip)
        // simple: tip of the middle finger
        function: "Middle fingertip — heat stroke, loss of consciousness",
        useHandLandmark: false,
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
        position: [0.35, 0.8722, -0.04],
        // tech: dorsal wrist crease center, ulnar to extensor tendons (posterior)
        // simple: center of the back of the wrist crease
        function: "Source point — wrist pain, malaria, dry mouth",
        isSource: true,
      },
      {
        id: "TW-5",
        name: "Waiguan", //✅✅✅✅✅✅✅
        position: [0.3, 1.0045, -0.08],
        // tech: 2 cun above TW-4, dorsal forearm between radius & ulna (posterior)
        // simple: back of the forearm, about three fingers above the wrist, center
        function: "Opens Yang Wei vessel — fever, headache, deafness",
      },
      {
        id: "TW-14", //✅✅✅✅✅✅✅
        name: "Jianliao",
        position: [0.16, 1.3916, -0.06],
        // tech: posterior-inferior to acromion, between two deltoid tendons
        // simple: the back dimple at the tip of the shoulder when the arm lifts
        function: "Posterior shoulder — shoulder pain, limited mobility",
      },
      {
        id: "TW-23", //✅✅✅✅✅✅✅
        name: "Sizhukong",
        position: [0.05, 1.617, 0.05],
        // tech: lateral end of the eyebrow, in depression
        // simple: the outer end of the eyebrow
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
    // No pathPoints — node-driven; line follows the GB nodes starting
    // at GB-20 (nape), so it stops there instead of floating up to the
    // eye/temple. Add head nodes above GB-20 if that portion is wanted.
    points: [
      {
        id: "GB-20",
        name: "Fengchi",
        position: [0.03, 1.538, -0.07],
        // tech: below occipital bone, between SCM & trapezius (posterior)
        // simple: base of the skull, in the hollows either side of the neck
        function: "Wind pool — wind-cold, headache, neck, eyes, all wind",
      },
      {
        id: "GB-21", // ✅✅✅✅✅ new
        name: "Jianjing",
        position: [0.1, 1.41, -0.04],
        // tech: midpoint of shoulder, between GV-14 and acromion tip
        // simple: top of the shoulder, halfway between neck and shoulder tip
        function: "Shoulder well — neck/shoulder pain, induces labor",
      },
      {
        id: "GB-30",
        name: "Huantiao",
        position: [0.12, 0.88, -0.02],
        // tech: 1/3 of the way from greater trochanter to sacral hiatus (lateral hip)
        // simple: deep in the buttock, on the outer hip
        function: "Hip joint — sciatica, lateral leg pain, hip disorders",
      },
      {
        id: "GB-34",
        name: "Yanglingquan",
        position: [0.07, 0.5, 0.03],
        // tech: anterior-inferior to head of fibula, lateral knee
        // simple: just below and in front of the bony bump under the outer knee
        function: "Influential for sinews — lateral knee, tendons, cramps",
      },
      {
        id: "GB-40",
        name: "Qiuxu", //✅✅✅✅✅✅
        position: [0.099, 0.047, -0.023],
        // tech: anterior-inferior to lateral malleolus, in depression
        // simple: the dip just in front of and below the outer ankle bone
        function: "Source point — ankle pain, lateral leg, distension",
        isSource: true,
      },
      {
        id: "GB-44",
        name: "Zuqiaoyin",
        position: [0.06, 0.04, 0.03],
        // tech: lateral corner of the 4th toenail
        // simple: outer corner of the 4th-toe nail
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
        position: [0.04, 0.04, 0.03],
        // tech: lateral corner of the big toenail
        // simple: outer corner of the big-toe nail
        function: "Big toe — genitourinary, hernias, menstrual, revival",
      },
      {
        id: "LV-3",
        name: "Taichong",
        position: [0.04, 0.1, 0.04],
        // tech: dorsal foot, between 1st-2nd metatarsals, proximal to the web
        // simple: top of the foot, in the valley between the big and 2nd toe bones
        function: "Source point — moves liver qi, stress, headache, PMS",
        isSource: true,
      },
      {
        id: "LV-8",
        name: "Ququan",
        position: [0.04, 0.54, 0.03],
        // tech: medial knee crease, posterior to medial condyle of tibia
        // simple: inner end of the knee crease when the knee is bent
        function: "Medial knee — tonifies liver blood, genitourinary",
      },
      {
        id: "LV-13",
        name: "Zhangmen",
        position: [0.12, 1.12, 0.06],
        // tech: inferior tip of the 11th (floating) rib (lateral)
        // simple: on the side, at the tip of the lowest floating rib
        function: "Mu of spleen, influential for zang organs — lateral rib",
      },
      {
        id: "LV-14",
        name: "Qimen",
        position: [0.1, 1.25, 0.07],
        // tech: 6th ICS on the midclavicular line
        // simple: on the ribs just below the nipple line
        function: "Front mu of liver — liver/gallbladder, intercostal pain",
      },
    ],
  },
];
