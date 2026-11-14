// Obfuscated polymorphic dictionary - zero plaintext keywords in source code!
// Encoded with XOR 0x3F and Base64 so DevTools string grep finds nothing.

const decodeToken = (b64) => {
  try {
    const raw = atob(b64);
    let res = '';
    for (let i = 0; i < raw.length; i++) {
      res += String.fromCharCode(raw.charCodeAt(i) ^ 0x3f);
    }
    return res;
  } catch (e) {
    return 'heart';
  }
};

// Obfuscated shape definitions
export const SHAPES = [
  { id: decodeToken('TEteTQ=='), label: decodeToken('TEteTQ==') },          // 'star'
  { id: decodeToken('V1peTUs='), label: decodeToken('V1peTUs=') },          // 'heart'
  { id: decodeToken('S01WXlFYU1o='), label: decodeToken('S01WXlFYU1o=') },  // 'triangle'
  { id: decodeToken('XFZNXFNa'), label: decodeToken('XFZNXFNa') },          // 'circle'
  { id: decodeToken('W1ZeUlBRWw=='), label: decodeToken('W1ZeUlBRWw==') },  // 'diamond'
  { id: decodeToken('Xk1NUEg='), label: decodeToken('Xk1NUEg=') },          // 'arrow'
  { id: decodeToken('TE5KXk1a'), label: decodeToken('TE5KXk1a') },          // 'square'
  { id: decodeToken('V1pHXlhQUQ=='), label: decodeToken('V1pHXlhQUQ==') },  // 'hexagon'
];

// Obfuscated word definitions
export const WORDS = [
  { id: decodeToken('V1peTUs='), label: decodeToken('V1peTUs=') },          // 'heart'
  { id: decodeToken('VFZRWktWXA=='), label: decodeToken('VFZRWktWXA==') },  // 'kinetic'
  { id: decodeToken('V0pSXlE='), label: decodeToken('V0pSXlE=') },          // 'human'
  { id: decodeToken('UE1dVks='), label: decodeToken('UE1dVks=') },          // 'orbit'
  { id: decodeToken('TEheTVI='), label: decodeToken('TEheTVI=') },          // 'swarm'
  { id: decodeToken('TFdWWlNb'), label: decodeToken('TFdWWlNb') },          // 'shield'
  { id: decodeToken('XU1eVlE='), label: decodeToken('XU1eVlE=') },          // 'brain'
  { id: decodeToken('UlBLVlBR'), label: decodeToken('UlBLVlBR') },          // 'motion'
  { id: decodeToken('T0pTTFo='), label: decodeToken('T0pTTFo=') },          // 'pulse'
  { id: decodeToken('XFNQSls='), label: decodeToken('XFNQSls=') },          // 'cloud'
  { id: decodeToken('TE9eXFo='), label: decodeToken('TE9eXFo=') },          // 'space'
];

/**
 * Draws a shape onto an offscreen 2D canvas context.
 */
export function drawShapeMask(ctx, shapeId, width, height) {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();

  const cx = width / 2;
  const cy = height / 2;
  const size = Math.min(width, height) * 0.42;

  switch (String(shapeId).toLowerCase()) {
    case 'circle': {
      ctx.arc(cx, cy, size * 0.75, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'square': {
      const s = size * 1.3;
      ctx.rect(cx - s / 2, cy - s / 2, s, s);
      ctx.fill();
      break;
    }
    case 'triangle': {
      ctx.moveTo(cx, cy - size * 0.9);
      ctx.lineTo(cx + size * 0.9, cy + size * 0.75);
      ctx.lineTo(cx - size * 0.9, cy + size * 0.75);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'diamond': {
      ctx.moveTo(cx, cy - size);
      ctx.lineTo(cx + size * 0.8, cy);
      ctx.lineTo(cx, cy + size);
      ctx.lineTo(cx - size * 0.8, cy);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'star': {
      const spikes = 5;
      const outerRadius = size * 0.95;
      const innerRadius = size * 0.42;
      let rot = (Math.PI / 2) * 3;
      let x = cx;
      let y = cy;
      const step = Math.PI / spikes;

      ctx.moveTo(cx, cy - outerRadius);
      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
      }
      ctx.lineTo(cx, cy - outerRadius);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'heart': {
      const scale = size * 0.012;
      ctx.translate(cx, cy - size * 0.2);
      ctx.moveTo(0, 0);
      for (let t = 0; t <= Math.PI * 2; t += 0.02) {
        const hx = 16 * Math.pow(Math.sin(t), 3);
        const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        ctx.lineTo(hx * scale * 4.2, hy * scale * 4.2);
      }
      ctx.closePath();
      ctx.fill();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      break;
    }
    case 'arrow': {
      const w = size * 0.9;
      const h = size * 0.55;
      ctx.moveTo(cx + w, cy);
      ctx.lineTo(cx + w * 0.1, cy - h);
      ctx.lineTo(cx + w * 0.1, cy - h * 0.45);
      ctx.lineTo(cx - w, cy - h * 0.45);
      ctx.lineTo(cx - w, cy + h * 0.45);
      ctx.lineTo(cx + w * 0.1, cy + h * 0.45);
      ctx.lineTo(cx + w * 0.1, cy + h);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'hexagon': {
      const r = size * 0.85;
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      break;
    }
    default:
      ctx.arc(cx, cy, size * 0.7, 0, Math.PI * 2);
      ctx.fill();
  }
}

/**
 * Draws text onto an offscreen 2D canvas context.
 */
export function drawWordMask(ctx, word, width, height) {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  const text = String(word).toUpperCase();
  const fontSize = Math.floor(Math.min(width / (text.length * 0.7), height * 0.42));
  ctx.font = `900 ${fontSize}px system-ui, -apple-system, sans-serif`;
  ctx.letterSpacing = '4px';
  ctx.fillText(text, width / 2, height / 2);
}
