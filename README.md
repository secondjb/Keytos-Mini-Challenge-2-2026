# Keytos Mini-Challenge #2: Dual-Entropy Biometric CAPTCHA

An adversarial-resistant, multi-factor CAPTCHA system combining **Kinetic Motion-Coherence (RDK)** and **Darkroom Flashlight Vector Scanning** into a unified two-round verification challenge.

Built for **Keytos Mini-Challenge #2 (2026)** and ready for instant deployment on **Vercel**.

---

## 🌟 Overview & Concept

Automated bots powered by multimodal LLMs, vision transformers, and headless browsers can effortlessly solve static image challenges or OCR tasks. This challenge solves the bot problem by enforcing **human kinetic entropy** across two randomized, distinct biometric rounds:

1. **Round 1 & Round 2 (Randomized Order):**
   - **Kinetic Motion Coherence:** Random dots move chaotically at rest. When held by a human, coherent motion vector fields reveal the hidden word/shape via human visual persistence and motion parallax. Static screenshots or single-frame dumps contain zero legible content.
   - **Darkroom Flashlight Beam:** The target exists in a pitch-black canvas with ambient flicker and decoy glyphs. Users must continuously hold and sweep a flashlight spotlight beam to visually scan and locate the rotated vector text.
2. **Mandatory 2-Round Verification:**
   - The user must solve **both** rounds back-to-back to achieve verified status.
   - The order is randomly chosen (50% Motion → Flashlight, 50% Flashlight → Motion) on every session.
3. **Cryptographic Verification Token:**
   - Once both rounds pass, a signed verification token (`KEYTOS_PASS_<hash>_<timestamp>`) is issued alongside total elapsed solve time.

---

## 🛡️ Multi-Layered Security Architecture

| Security Layer | Mechanism | Protection Target |
| :--- | :--- | :--- |
| **Kinetic Trajectory Entropy** | Tracks mouse/touch speed, jitter, and angular deviations | Blocks synthetic macros moving in perfect straight lines or constant-tick intervals |
| **Continuous Hold Requirement** | Requires a physical press & hold (pointer or spacebar) | Prevents instant click-and-solve headless bots |
| **Dynamic Key Expiration (8s)** | Keys rotate every 8 seconds with mandatory release lockout | Stops bots from holding continuously forever |
| **Adversarial OCR Traps** | Canvas watermarks injecting `0000` instructions for vision LLMs | Triggers instant `VISION_INJECTION` bot detection if vision agents answer the prompt injection |
| **Deceptive DOM Honeypots** | Hidden, aria-hidden input fields with realistic fake token names | Triggers `DOM_HONEYPOT` violation when scrapers populate hidden form fields |
| **Dynamic Near-Miss Decoys** | Periodically mutates typo-squatted fake answers into offscreen DOM nodes | Traps scraping agents that harvest strings from the DOM |
| **Anti-Screenshot Defenses** | Overrides `toDataURL` and `toBlob`; blurs on `visibilitychange` or PrintScreen | Prevents headless scrapers from saving canvas bitmaps |
| **Rolling XOR Ciphers** | Word lists and shapes encoded with XOR salts in memory | Eliminates plaintext keywords from JavaScript bundles |

---

## 🚀 One-Click Deployment to Vercel

This repository is optimized for root deployment on Vercel:

1. Push this repository to GitHub: `https://github.com/secondjb/Keytos-Mini-Challenge-2-2026`
2. Open your [Vercel Dashboard](https://vercel.com/new).
3. Import the `Keytos-Mini-Challenge-2-2026` repository.
4. Leave settings as default:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click **Deploy**. Vercel will build and serve the application globally via edge CDN with full SPA routing (`vercel.json`).

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Build for production (TypeScript check + Vite Terser Minification)
npm run build

# Preview production build locally
npm run preview
```

---

## 📂 Project Structure

```
Keytos Challenge #2/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── BotDetectedCard.tsx       # Security violation screen with telemetry
│   │   ├── DualStageCaptchaCard.tsx  # Central 2-round verification coordinator
│   │   ├── FlashlightCanvas.tsx      # Darkroom vector beam canvas
│   │   ├── HoneypotTraps.tsx         # Deceptive DOM and adversarial traps
│   │   ├── MotionCanvas.tsx          # Kinetic random-dot motion coherence canvas
│   │   ├── RoundProgressStepper.tsx  # Interactive multi-round visual stepper
│   │   └── VerificationSuccessCard.tsx # Celebration screen with cryptographic token
│   ├── hooks/
│   │   ├── useFlashlightWords.ts     # Rotating server-signed target words & decoys
│   │   └── useSecurityEngine.ts      # Biometric kinetic entropy & macro detection engine
│   ├── utils/
│   │   ├── audioEffects.ts           # Web Audio API procedural sound cues
│   │   ├── captchaPatterns.ts        # Obfuscated shape & word vector masks
│   │   └── wordList.ts               # XOR-scrambled cipher runes & near-miss generators
│   ├── App.tsx                       # Main application shell
│   ├── index.css                     # Tailwind v4 theme, animations & scanlines
│   └── main.tsx                      # React root entry point
├── archive/                          # Original standalone source code archives
├── index.html                        # Application HTML entry point
├── package.json                      # Project dependencies & build scripts
├── tsconfig.json                     # TypeScript compiler configuration
├── vercel.json                       # Vercel deployment & security header configuration
└── vite.config.ts                    # Vite build pipeline with Terser obfuscation
```

---

## 🏆 Keytos Mini-Challenge #2 Deliverable
Designed and submitted for **Keytos Mini-Challenge #2 (2026)**.
Developed by: `secondjb`
Remote Repository: `https://github.com/secondjb/Keytos-Mini-Challenge-2-2026`
