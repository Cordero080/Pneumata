// ═══════════════════════════════════════════════════════════════════════════
// JARGON GLOSSARY
// ═══════════════════════════════════════════════════════════════════════════
//
// Every entry in this file becomes a CLICKABLE TERM inside the comparison
// modal (Technical mode only). When `JargonText` renders any text, it scans
// for matches against the keys below and wraps each match in a clickable span.
// Click → desktop opens a draggable floating popup; mobile expands inline.
//
// ───────────────────────────────────────────────────────────────────────────
// HOW TO ADD A NEW DEFINITION
// ───────────────────────────────────────────────────────────────────────────
//
// 1. Find the right section below (Memory, Processors, Power, etc.) OR add
//    a new "// ── Section ──" divider if your term doesn't fit any existing
//    bucket.
//
// 2. Add a new entry. The KEY must match the EXACT phrase as it appears in
//    organs.js (or anywhere else JargonText is used). Schema:
//
//        "Your Term": {
//          name:    "Full Name (Abbreviation)",   // shown as popup title
//          short:   "One plain-English sentence.", // the definition body
//          example: "Like a [household analogy].", // OPTIONAL: italicized
//        },
//
// 3. That's it. No imports to add, no components to wire up. The next time
//    the modal opens in Technical mode, your term will be highlighted in
//    cyan and clickable.
//
// ───────────────────────────────────────────────────────────────────────────
// MATCHING RULES
// ───────────────────────────────────────────────────────────────────────────
//
// • CASE-SENSITIVE. "RAM" matches "RAM" but NOT "ram" or "Ram".
//   → If a term appears in mixed case in the text, add BOTH variants as
//     separate keys (see "Firmware" / "firmware" below as an example).
//
// • WORD BOUNDARIES enforced. "RAM" will NOT match the "RAM" inside "FRAME"
//   or "DRAMATIC" — only as a standalone word.
//
// • LONGEST MATCH WINS. If both "Central Processing Unit" and "CPU" are in
//   the glossary, the phrase "Central Processing Unit" matches the long
//   entry, while standalone "CPU" matches the short one. Both can have
//   their own (or shared) definition.
//
// • If the same term appears multiple times in a single paragraph, ALL
//   instances become clickable.
//
// ───────────────────────────────────────────────────────────────────────────
// EXAMPLE — adding a new term
// ───────────────────────────────────────────────────────────────────────────
//
// Say you add a new organ in organs.js with hardware "L2 Cache". To make
// "L2 Cache" clickable in the modal, just add this anywhere in the object
// below (Memory & Storage section makes sense):
//
//     "L2 Cache": {
//       name: "L2 Cache",
//       short:
//         "Mid-tier high-speed memory built into the CPU, between the tiny L1 cache and main RAM. Holds data the CPU is about to need.",
//       example:
//         "Like keeping your most-used tools on a tray right next to you.",
//     },
//
// Save, refresh the modal, and "L2 Cache" inside any organ's text will
// now be highlighted and open a definition popup on click.
//
// ───────────────────────────────────────────────────────────────────────────
// REMOVING / EDITING
// ───────────────────────────────────────────────────────────────────────────
//
// • Delete a key → the term stops being clickable (text still shows).
// • Edit `short` or `example` → updates instantly on next modal open.
// • Edit a `name` → updates the popup title; doesn't affect matching.
//
// ═══════════════════════════════════════════════════════════════════════════

export const glossary = {
  // ── Meridian / Power-Rail Layer ─────────────────────────────────────────
  "meridian network": {
    name: "Meridian Network",
    short:
      "In this project, the meridian system is treated as the body's electrical power layer — the wiring that distributes the heart's baseline current (Qi) to every organ. Distinct from the nervous system, which carries data signals.",
    example:
      "Like the power cables behind your walls. The nervous system is the ethernet cables; the meridian network is the AC wiring that lets the ethernet exist at all.",
  },
  "meridian power rails": {
    name: "Meridian Power Rails",
    short:
      "The 14 major meridian channels mapped as the high-voltage trunk lines that carry electrical current to specific organ groups.",
    example:
      "Like the bus bars in an electrical panel — every circuit branches off of them.",
  },
  "meridian grid": {
    name: "Meridian Grid",
    short:
      "The full mesh of meridian channels and sub-channels acting as the body's power distribution network.",
    example: "The grid that delivers electricity to every house in a city.",
  },
  Qi: {
    name: "Qi (TCM)",
    short:
      "Traditional Chinese Medicine concept for the body's vital energy. In this project's hardware analogy, treated as the raw electrical current the heart distributes through the meridian network.",
    example: "Voltage you can't see, but every component needs it to function.",
  },

  // ── Memory & Storage ────────────────────────────────────────────────────
  RAM: {
    name: "RAM (Random Access Memory)",
    short:
      "The computer's short-term workspace. Holds whatever you're actively using right now — open apps, current documents.",
    example:
      "Like a desk: spread out the papers you're working on. Turn off the lamp (cut power), the desk gets wiped clean.",
  },
  "Random Access Memory": {
    name: "Random Access Memory (RAM)",
    short:
      "The computer's short-term workspace. Holds whatever you're actively using right now — open apps, current documents.",
    example:
      "Like a desk: spread out the papers you're working on. Turn off the lamp, the desk gets wiped clean.",
  },
  SSD: {
    name: "SSD (Solid-State Drive)",
    short:
      "Permanent storage with no moving parts. Keeps files even when the power is off.",
    example: "Like a filing cabinet: nothing disappears when you go to sleep.",
  },
  HDD: {
    name: "HDD (Hard Disk Drive)",
    short:
      "Permanent storage that uses a spinning magnetic disc. Older, slower, cheaper version of an SSD.",
    example: "Same job as the filing cabinet, just older mechanics.",
  },
  "Solid-state storage": {
    name: "Solid-State Storage",
    short:
      "Permanent memory with no moving parts. Holds onto everything even after the power goes out.",
    example:
      "Your photo library survives a phone reboot because it lives here.",
  },

  // ── Processors ──────────────────────────────────────────────────────────
  CPU: {
    name: "CPU (Central Processing Unit)",
    short:
      "The main chip that runs the computer. Does one task at a time, very fast, in strict order.",
    example: "Like a single skilled worker following a recipe step by step.",
  },
  "Central Processing Unit": {
    name: "Central Processing Unit (CPU)",
    short:
      "The main chip that runs the computer. Does one task at a time, very fast, in strict order.",
    example: "Like a single skilled worker following a recipe step by step.",
  },
  GPU: {
    name: "GPU (Graphics Processing Unit)",
    short:
      "A chip built to do thousands of small calculations at the same time — drawing pixels, recognizing images, training AI.",
    example:
      "Like a stadium of workers each painting one square of a giant mural at once.",
  },
  "Graphics Processing Unit": {
    name: "Graphics Processing Unit (GPU)",
    short:
      "A chip built to do thousands of small calculations at the same time — drawing pixels, recognizing images, training AI.",
    example:
      "Like a stadium of workers each painting one square of a giant mural at once.",
  },

  // ── Control & Coordination ──────────────────────────────────────────────
  "Interrupt Controller": {
    name: "Interrupt Controller",
    short:
      "A small chip that decides which incoming signals get the CPU's attention first and which have to wait.",
    example:
      "Like a receptionist routing calls — they don't answer questions, they decide who talks to the boss.",
  },
  "interrupt controller": {
    name: "Interrupt Controller",
    short:
      "A small chip that decides which incoming signals get the CPU's attention first and which have to wait.",
    example:
      "Like a receptionist routing calls — they don't answer questions, they decide who talks to the boss.",
  },
  "Interrupt Handler": {
    name: "Interrupt Handler",
    short:
      "A piece of code that runs the instant an urgent signal arrives — even if the CPU was doing something else.",
    example:
      "Like a fire alarm: whatever you were doing, you stop and respond immediately.",
  },
  "interrupt handler": {
    name: "Interrupt Handler",
    short:
      "A piece of code that runs the instant an urgent signal arrives — even if the CPU was doing something else.",
    example:
      "Like a fire alarm: whatever you were doing, you stop and respond immediately.",
  },
  BIOS: {
    name: "BIOS (Basic Input/Output System)",
    short:
      "The very first software that runs when a computer turns on. Wakes up the hardware before the operating system loads.",
    example:
      "Like the safety checks a pilot runs before the plane even taxis to the runway.",
  },
  Firmware: {
    name: "Firmware",
    short:
      "Permanent low-level software built into a device — the instructions that come pre-loaded and rarely change.",
    example:
      "The unchangeable rules that make your microwave act like a microwave.",
  },
  firmware: {
    name: "Firmware",
    short:
      "Permanent low-level software built into a device — the instructions that come pre-loaded and rarely change.",
    example:
      "The unchangeable rules that make your microwave act like a microwave.",
  },
  "Control Chip": {
    name: "Control Chip",
    short:
      "A small chip whose only job is to issue commands to other chips. It doesn't compute results — it directs the system.",
    example:
      "Like a conductor: doesn't play any instrument, but every instrument follows them.",
  },

  // ── Clocks & Timing ─────────────────────────────────────────────────────
  "Clock Crystal": {
    name: "Clock Crystal",
    short:
      "A tiny quartz crystal that vibrates at an exact frequency — every other chip in the computer keeps time with it.",
    example:
      "Like the metronome the entire orchestra plays to. Without it, the music falls apart.",
  },
  "System Clock": {
    name: "System Clock (BCLK)",
    short:
      "The master timing signal every component synchronizes to. Faster clock = faster computer (but more heat).",
    example:
      "The tempo a band plays at. Push it too fast and things start falling apart.",
  },
  BCLK: {
    name: "Base Clock (BCLK)",
    short:
      "The fundamental tempo the whole computer runs at. Every other clock is calculated as a multiple of this.",
    example: "The kick drum the rest of the band locks into.",
  },

  // ── Power ───────────────────────────────────────────────────────────────
  PSU: {
    name: "PSU (Power Supply Unit)",
    short:
      "Converts wall power into the steady, regulated electricity every component inside the computer needs.",
    example:
      "Like a building's electrical room — outside power comes in messy, gets distributed clean and steady inside.",
  },
  "Power Supply Unit": {
    name: "Power Supply Unit (PSU)",
    short:
      "Converts wall power into the steady, regulated electricity every component inside the computer needs.",
    example: "The building's electrical room — clean voltage to every room.",
  },
  VRM: {
    name: "VRM (Voltage Regulator Module)",
    short:
      "Takes power from the PSU and adjusts it to the exact voltage each chip needs. Different chips need different voltages.",
    example:
      "Like a power strip that gives every device exactly the right plug shape and current.",
  },
  "Voltage Regulator": {
    name: "Voltage Regulator (VRM)",
    short:
      "A circuit that fine-tunes incoming voltage to the exact level a chip needs. Slightly wrong voltage causes weird crashes.",
    example: "An adjustable transformer for each individual chip.",
  },
  Overclock: {
    name: "Overclocking",
    short:
      "Pushing a chip to run faster than its rated speed. Gains short-term performance, costs heat and lifespan.",
    example:
      "Redlining a car engine. Faster while it lasts, shorter total life.",
  },
  "Overclock Mechanism": {
    name: "Overclock Mechanism",
    short:
      "The system that lets a chip run beyond its rated speed for bursts of extra performance.",
    example: "The car's nitro button — power on demand, wear on the engine.",
  },
  "Capacitor Bank": {
    name: "Capacitor Bank",
    short:
      "A group of capacitors that store electrical charge and release it in a burst when a chip suddenly needs extra power.",
    example: "A water tower: fills slowly, dumps fast when you need pressure.",
  },

  // ── Cooling ─────────────────────────────────────────────────────────────
  "Heat Sink": {
    name: "Heat Sink",
    short:
      "A metal block that pulls heat away from a chip and spreads it out so air can carry it off.",
    example:
      "The metal fins on the back of an old radio — designed to shed heat fast.",
  },
  "Fan Controller": {
    name: "Fan Controller",
    short:
      "Decides how fast the cooling fans should spin based on how hot things are getting.",
    example: "The thermostat that decides when the AC kicks on harder.",
  },

  // ── Bus / Data Movement ─────────────────────────────────────────────────
  PCIe: {
    name: "PCIe (Peripheral Component Interconnect Express)",
    short:
      "The main highway inside a computer — the physical wiring every component uses to talk to the CPU.",
    example:
      "Like the central nervous system of the motherboard. Everything plugs into it.",
  },
  "Data Bus": {
    name: "Data Bus",
    short:
      "A set of wires that moves data between chips. Wider bus = more data per trip.",
    example: "The conveyor belt between stations on an assembly line.",
  },
  "data bus": {
    name: "Data Bus",
    short:
      "A set of wires that moves data between chips. Wider bus = more data per trip.",
    example: "The conveyor belt between stations on an assembly line.",
  },
  "Input Queue": {
    name: "Input Queue",
    short: "A holding line where incoming data waits its turn to be processed.",
    example: "The line at the deli counter — first come, first served.",
  },

  // ── Software pipelines ──────────────────────────────────────────────────
  Parser: {
    name: "Parser",
    short:
      "Software that breaks raw input (text, code, data) into pieces the computer can recognize and act on.",
    example: "Like reading a sentence and identifying each word and its role.",
  },
  Compiler: {
    name: "Compiler",
    short:
      "Translates human-readable code into instructions the CPU can actually execute.",
    example:
      "A translator turning a recipe in French into one a kitchen in Tokyo can follow.",
  },
  "Garbage Collector": {
    name: "Garbage Collector",
    short:
      "A background process that finds memory the program is no longer using and frees it up for reuse.",
    example:
      "The cleaning crew that quietly empties wastebaskets so the office keeps running.",
  },

  // ── I/O & Conversion ────────────────────────────────────────────────────
  ADC: {
    name: "ADC (Analog-to-Digital Converter)",
    short:
      "Turns continuous real-world signals (sound, light, voltage) into discrete numbers the computer can process.",
    example:
      "Taking 44,000 snapshots of a sound wave per second to record it digitally.",
  },
  DAC: {
    name: "DAC (Digital-to-Analog Converter)",
    short:
      "The reverse of an ADC — turns numbers back into real-world signals like sound or voltage.",
    example:
      "Reads the digital recording and recreates the original sound wave.",
  },
  "Render Pipeline": {
    name: "Render Pipeline",
    short:
      "The chain of steps a GPU runs to turn 3D math into the 2D image you see on screen.",
    example:
      "An assembly line that takes geometry in one end and outputs finished pixels at the other.",
  },
  "Output Buffer": {
    name: "Output Buffer",
    short:
      "A holding area where finished data waits until it's ready to be sent out all at once.",
    example: "The outgoing mail tray — fills up, gets sent on a schedule.",
  },

  // ── Memory management ──────────────────────────────────────────────────
  "Swap File": {
    name: "Swap File",
    short:
      "A reserved chunk of disk space the computer uses as overflow when RAM gets full.",
    example:
      "An overflow parking lot when the main lot is jammed — slower to reach, but it works.",
  },
  "Virtual Memory": {
    name: "Virtual Memory",
    short:
      "A clever trick that makes the computer act like it has more RAM than it does by quietly using disk space as backup.",
    example: "Like spreading your desk overflow onto a side table.",
  },

  // ── Security ────────────────────────────────────────────────────────────
  Firewall: {
    name: "Firewall",
    short:
      "A filter that inspects incoming and outgoing network traffic, blocking anything that looks suspicious.",
    example: "A border guard checking every passport before entry.",
  },
  SIEM: {
    name: "SIEM (Security Information and Event Management)",
    short:
      "Software that collects alerts from every security tool in a network and shows the big picture of what's happening.",
    example:
      "The dispatcher at police HQ — every patrol radios in, dispatch sees the citywide pattern.",
  },
  "Edge Security": {
    name: "Edge Security",
    short:
      "Security checks done at the outer boundary of a network — before traffic ever reaches the important systems.",
    example: "Metal detectors at the airport entrance, not at the gate.",
  },
  Antivirus: {
    name: "Antivirus",
    short:
      "Software that scans for known malicious programs and removes them. Needs frequent updates to recognize new threats.",
    example:
      "A guard who memorizes mugshots — only useful if the photo book stays current.",
  },
};
