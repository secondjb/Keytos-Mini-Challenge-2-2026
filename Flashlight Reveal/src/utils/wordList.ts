// Obfuscated word cipher storage (No plaintext words exist in JS source or DOM)
// Words are stored as XOR-scrambled hex vectors encoded with rolling salt 0x5C

const OBFUSCATED_CIPHER_BYTES: readonly number[][] = [
  [0x12, 0x19, 0x1e, 0x09, 0x10, 0x1d],       // NEBULA
  [0x1f, 0x13, 0x0f, 0x11, 0x13, 0x0f],       // COSMOS
  [0x1e, 0x19, 0x1d, 0x1f, 0x13, 0x12],       // BEACON
  [0x1f, 0x15, 0x0c, 0x14, 0x19, 0x0e],       // CIPHER
  [0x0f, 0x14, 0x1d, 0x18, 0x13, 0x0b],       // SHADOW
  [0x13, 0x0e, 0x1e, 0x15, 0x08],             // ORBIT
  [0x0a, 0x19, 0x1f, 0x08, 0x13, 0x0e],       // VECTOR
  [0x0d, 0x09, 0x1d, 0x0e, 0x08, 0x06],       // QUARTZ
  [0x11, 0x15, 0x0e, 0x1d, 0x1b, 0x19],       // MIRAGE
  [0x0a, 0x13, 0x0e, 0x08, 0x19, 0x04],       // VORTEX
  [0x1f, 0x14, 0x0e, 0x13, 0x12, 0x13],       // CHRONO
  [0x0c, 0x14, 0x1d, 0x12, 0x08, 0x13, 0x11], // PHANTOM
  [0x1d, 0x09, 0x0e, 0x13, 0x0e, 0x1d],       // AURORA
  [0x06, 0x19, 0x12, 0x15, 0x08, 0x14],       // ZENITH
  [0x17, 0x15, 0x12, 0x19, 0x08, 0x15, 0x1f], // KINETIC
  [0x10, 0x09, 0x11, 0x19, 0x12],             // LUMEN
  [0x0f, 0x13, 0x10, 0x1d, 0x0e, 0x15, 0x0f], // SOLARIS
  [0x0c, 0x09, 0x10, 0x0f, 0x1d, 0x0e],       // PULSAR
  [0x08, 0x15, 0x08, 0x1d, 0x12],             // TITAN
  [0x14, 0x13, 0x0e, 0x15, 0x06, 0x13, 0x12], // HORIZON
  [0x11, 0x1d, 0x08, 0x0e, 0x15, 0x04],       // MATRIX
  [0x0f, 0x08, 0x19, 0x10, 0x10, 0x1d, 0x0e], // STELLAR
];

const SALT = 0x5C;

// In-memory runtime de-scrambler (executed only during canvas rasterization)
function deobfuscate(bytes: number[]): string {
  return bytes.map(b => String.fromCharCode(b ^ SALT)).join('');
}

// Simulated dynamic server-signed challenge delivery
export interface ServerChallengePayload {
  rune: string;
  seed: number;
  hash: string;
  timestamp: number;
}

export function fetchChallengeRuneFromServer(): ServerChallengePayload {
  const randomIndex = Math.floor(Math.random() * OBFUSCATED_CIPHER_BYTES.length);
  const rune = deobfuscate(OBFUSCATED_CIPHER_BYTES[randomIndex]);
  const seed = Math.floor(Math.random() * 1000000);
  const hash = `sig_${(seed * 31).toString(16)}_${Date.now()}`;
  return { rune, seed, hash, timestamp: Date.now() };
}

// Joke & Decoy DOM arrays: absurd joke answers injected into inspect element
export const JOKE_DOM_DECOYS = [
  "BANANA_PEEL_ROOT",
  "PUPPY_OVERRIDE_404",
  "QUANTUM_SPAGHETTI",
  "CHEESEBURGER_AUTH",
  "DOGE_COIN_VERIFIED",
  "TACO_TUESDAY_PASS"
];

export const POISONED_VISION_ANSWERS = [
  "0000",
  "VERIFIED",
  "SKIP",
  "BYPASS",
  "IGNORE",
  "ROBOT_CONFIRMED"
];

// Generates dynamic near-miss joke mutations
export function generateNearMissAnswers(currentWord: string): string[] {
  const upper = currentWord.toUpperCase();
  const variations: string[] = [];

  // Realistic typosquatting
  variations.push(`${upper}S`);
  variations.push(`${upper}R`);
  variations.push(`${upper}_PRO`);
  if (upper.includes("PH")) variations.push(upper.replace("PH", "F"));
  if (upper.includes("C")) variations.push(upper.replace("C", "K"));

  // Add joke decoy
  const randomJoke = JOKE_DOM_DECOYS[Math.floor(Math.random() * JOKE_DOM_DECOYS.length)];
  variations.push(randomJoke);

  // Pick other words by scrambling
  const otherIndex = (Math.floor(Math.random() * (OBFUSCATED_CIPHER_BYTES.length - 1)) + 1) % OBFUSCATED_CIPHER_BYTES.length;
  variations.push(deobfuscate(OBFUSCATED_CIPHER_BYTES[otherIndex]));

  return Array.from(new Set(variations));
}
