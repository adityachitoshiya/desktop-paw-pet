/**
 * CatSprites.js — High-Quality 16-bit style 2D pixel cat.
 * Features 5 themes and dynamic scaling.
 */

export const THEMES = {
  midnight: {
    black:      '#0a0a0c', 
    highlight:  '#2a2a35', 
    pink:       '#ff79c6', 
    nose:       '#ff4d6d', 
    eyeYellow:  '#f1fa8c', 
    eyeLight:   '#ffffff', 
    eyeGlint:   '#ffffff', 
    pupil:      '#000000', 
    whisker:    '#6272a4', 
  },
  snow: {
    black:      '#fdfdfd', 
    highlight:  '#e6e6e6', 
    pink:       '#ffb8d1', 
    nose:       '#ff9fb3', 
    eyeYellow:  '#8be9fd', // Icy blue eyes
    eyeLight:   '#ffffff', 
    eyeGlint:   '#ffffff', 
    pupil:      '#282a36', 
    whisker:    '#bd93f9', 
  },
  ginger: {
    black:      '#f5a623', 
    highlight:  '#f8c575', 
    pink:       '#ffcccc', 
    nose:       '#ff79c6', 
    eyeYellow:  '#50fa7b', // Green eyes
    eyeLight:   '#ffffff', 
    eyeGlint:   '#ffffff', 
    pupil:      '#282a36', 
    whisker:    '#ffffff', 
  },
  ash: {
    black:      '#6c757d', 
    highlight:  '#adb5bd', 
    pink:       '#ffb8d1', 
    nose:       '#ff79c6', 
    eyeYellow:  '#f1fa8c', 
    eyeLight:   '#ffffff', 
    eyeGlint:   '#ffffff', 
    pupil:      '#000000', 
    whisker:    '#ffffff', 
  },
  mocha: {
    black:      '#5c4033', 
    highlight:  '#8b5a2b', 
    pink:       '#ffb8d1', 
    nose:       '#ff79c6', 
    eyeYellow:  '#ffb86c', // Amber eyes
    eyeLight:   '#ffffff', 
    eyeGlint:   '#ffffff', 
    pupil:      '#282a36', 
    whisker:    '#f8f8f2', 
  }
};

export const FRAME_COUNTS = { idle: 8, typing: 6, swiping: 4, walking: 4, eating: 6 };

// 34 x 28
const CAT_BASE = [
  "                                  ",
  "          @@          ##          ",
  "         @PP#        #PP#         ",
  "        @PPPP#  @@  #PPPP#        ",
  "        @@@@@@@@@@@@@@@@##        ",
  "       @@@@################       ",
  "       @### LL      LL ####       ",
  "      @## LLYY #### LLYY ###      ",
  "  KK##### LWBY #### LWBY #####KK  ",
  "    K#### YBBY #### YBBY ####K    ",
  "  KK K### YYYY #### YYYY ###K KK  ",
  " KK   K##### YY NN YY #####K   KK ",
  "        @@################        ",
  "         @@##############         ",
  "          @@############          ",
  "           @@##########           ",
  "          @@############          ",
  "         @@##############         ",
  "        @@################        ",
  "       @@##################       ",
  "      @@####################      ",
  "     @@######################     ",
  "     @@######################     ",
  "     @@######################     ",
  "      @@####################      ",
  "        @@################        ",
  "          @@############          ",
  "                                  ",
];

function pxRect(ctx, x, y, w, h, color, pxSize) {
  ctx.fillStyle = color;
  const drawX = Math.floor(x * pxSize);
  const drawY = Math.floor(y * pxSize);
  const drawW = Math.ceil(w * pxSize);
  const drawH = Math.ceil(h * pxSize);
  ctx.fillRect(drawX, drawY, drawW, drawH);
}

function osc(frame, maxFrames, amplitude = 1) {
  return Math.sin((frame / maxFrames) * Math.PI * 2) * amplitude;
}

function getBlinkAmount(frame) {
  const cycle = frame % 36;
  if (cycle === 0) return 0.05;
  if (cycle === 1 || cycle === 35) return 0.3;
  if (cycle === 2 || cycle === 34) return 0.6;
  return 1.0;
}

function drawCatBase(ctx, ox, oy, blinkAmount, C, pxSize) {
  for (let y = 0; y < CAT_BASE.length; y++) {
    const row = CAT_BASE[y];
    for (let x = 0; x < row.length; x++) {
      const char = row[x];
      if (char === ' ') continue;
      
      let color = C.black;
      switch (char) {
        case '#': color = C.black; break;
        case '@': color = C.highlight; break;
        case 'P': color = C.pink; break;
        case 'N': color = C.nose; break;
        case 'K': color = C.whisker; break;
        case 'L': 
        case 'Y': 
        case 'W': 
        case 'B': {
          if (blinkAmount < 0.2) {
            color = C.black;
          } else if (blinkAmount < 0.5 && y <= 8) {
            color = C.black;
          } else {
            if (char === 'L') color = C.eyeLight;
            if (char === 'Y') color = C.eyeYellow;
            if (char === 'W') color = C.eyeGlint;
            if (char === 'B') color = C.pupil;
          }
          break;
        }
      }
      
      pxRect(ctx, ox + x, oy + y, 1, 1, color, pxSize);
    }
  }
}

function drawPixelTail(ctx, ox, oy, frame, maxFrames, swayAmt, C, pxSize) {
  const sway = Math.round(osc(frame, maxFrames, swayAmt));
  pxRect(ctx, ox + 3, oy + 23, 5, 2, C.black, pxSize); 
  pxRect(ctx, ox + 3, oy + 23, 5, 1, C.highlight, pxSize); 
  pxRect(ctx, ox + 3 + sway, oy + 17, 2, 7, C.black, pxSize); 
  pxRect(ctx, ox + 3 + sway, oy + 17, 1, 7, C.highlight, pxSize); 
  pxRect(ctx, ox + 2 + sway, oy + 15, 4, 2, C.black, pxSize);
  pxRect(ctx, ox + 2 + sway, oy + 15, 4, 1, C.highlight, pxSize); 
  pxRect(ctx, ox + 1 + sway, oy + 16, 2, 2, C.black, pxSize);
  pxRect(ctx, ox + 1 + sway, oy + 16, 1, 2, C.highlight, pxSize); 
}

function drawTypingPaws(ctx, ox, oy, frame, maxFrames, C, pxSize) {
  const pawAlt = osc(frame, maxFrames, 2.5);
  const leftPawY = -Math.abs(pawAlt) * 2;
  const rightPawY = -Math.abs(-pawAlt) * 2;

  pxRect(ctx, ox + 11, oy + 20 + Math.round(leftPawY), 4, 3, C.black, pxSize);
  pxRect(ctx, ox + 11, oy + 20 + Math.round(leftPawY), 4, 1, C.highlight, pxSize);
  pxRect(ctx, ox + 12, oy + 20 + Math.round(leftPawY), 2, 1, C.pink, pxSize);

  pxRect(ctx, ox + 19, oy + 20 + Math.round(rightPawY), 4, 3, C.black, pxSize);
  pxRect(ctx, ox + 19, oy + 20 + Math.round(rightPawY), 4, 1, C.highlight, pxSize);
  pxRect(ctx, ox + 20, oy + 20 + Math.round(rightPawY), 2, 1, C.pink, pxSize);
}

function drawSwipePaw(ctx, ox, oy, angle, extendAmount, C, pxSize) {
  const centerX = ox + 17;
  const centerY = oy + 20;
  
  const dist = 6 + extendAmount * 8;
  const dx = Math.round(Math.cos(angle) * dist);
  const dy = Math.round(Math.sin(angle) * dist);
  
  const pawX = centerX + dx;
  const pawY = centerY + dy;
  
  const x0 = centerX, y0 = centerY, x1 = pawX, y1 = pawY;
  let err = Math.abs(x1 - x0) - Math.abs(y1 - y0);
  let cx = x0, cy = y0;
  const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  
  while (true) {
    pxRect(ctx, cx - 1, cy - 1, 3, 3, C.black, pxSize);
    pxRect(ctx, cx - 1, cy - 1, 1, 3, C.highlight, pxSize);
    if (cx === x1 && cy === y1) break;
    const e2 = 2 * err;
    if (e2 > -Math.abs(y1 - y0)) { err -= Math.abs(y1 - y0); cx += sx; }
    if (e2 < Math.abs(x1 - x0)) { err += Math.abs(x1 - x0); cy += sy; }
  }
  
  pxRect(ctx, pawX - 2, pawY - 2, 5, 4, C.black, pxSize);
  pxRect(ctx, pawX - 2, pawY - 2, 5, 1, C.highlight, pxSize);
  pxRect(ctx, pawX - 1, pawY - 2, 3, 2, C.pink, pxSize);
  
  if (extendAmount > 0.5) {
    const clawDist = 4;
    const clx = pawX + Math.cos(angle) * clawDist;
    const cly = pawY + Math.sin(angle) * clawDist;
    pxRect(ctx, clx, cly, 1, 1, C.eyeLight, pxSize);
    pxRect(ctx, clx + 1, cly - 1, 1, 1, C.eyeLight, pxSize);
    pxRect(ctx, clx - 1, cly + 1, 1, 1, C.eyeLight, pxSize);
  }
}

function drawWalkingPaws(ctx, ox, oy, frame, maxFrames, C, pxSize) {
  const cycle = (frame / maxFrames) * Math.PI * 2;
  const frontPawY = Math.sin(cycle) * 2;
  const backPawY = Math.sin(cycle + Math.PI) * 2;
  
  pxRect(ctx, ox + 19, oy + 25 + Math.round(frontPawY), 3, 2, C.black, pxSize);
  pxRect(ctx, ox + 12, oy + 25 + Math.round(backPawY), 3, 2, C.black, pxSize);
}

// ─── EXPORTED ─────────────────────────────────────────

export function drawIdle(ctx, frame, { width, height, pxSize, themeId }) {
  const C = THEMES[themeId] || THEMES.midnight;
  const ox = Math.round((width / pxSize - 34) / 2);
  const oy = Math.round((height / pxSize - 28) / 2) + 2;

  ctx.save();
  drawPixelTail(ctx, ox, oy, frame, FRAME_COUNTS.idle, 1, C, pxSize);
  drawCatBase(ctx, ox, oy, getBlinkAmount(frame), C, pxSize);
  ctx.restore();
}

export function drawTyping(ctx, frame, { width, height, pxSize, themeId }) {
  const C = THEMES[themeId] || THEMES.midnight;
  const ox = Math.round((width / pxSize - 34) / 2);
  const oy = Math.round((height / pxSize - 28) / 2) + 2;
  const bounce = Math.round(Math.abs(osc(frame, FRAME_COUNTS.typing, 1)));

  ctx.save();
  drawPixelTail(ctx, ox, oy - bounce, frame, FRAME_COUNTS.typing * 2, 0.5, C, pxSize);
  drawCatBase(ctx, ox, oy - bounce, 0.8, C, pxSize);
  drawTypingPaws(ctx, ox, oy - bounce, frame, FRAME_COUNTS.typing, C, pxSize);
  ctx.restore();
}

export function drawSwiping(ctx, frame, { width, height, cursorAngle, pxSize, themeId }) {
  const C = THEMES[themeId] || THEMES.midnight;
  const ox = Math.round((width / pxSize - 34) / 2);
  const oy = Math.round((height / pxSize - 28) / 2) + 2;
  const extendAmount = 0.5 + osc(frame, FRAME_COUNTS.swiping, 0.5);

  ctx.save();
  drawPixelTail(ctx, ox, oy, frame, FRAME_COUNTS.swiping, 2, C, pxSize);
  drawCatBase(ctx, ox, oy, 1.0, C, pxSize);
  drawSwipePaw(ctx, ox, oy, cursorAngle, extendAmount, C, pxSize);
  ctx.restore();
}

export function drawWalking(ctx, frame, { width, height, pxSize, themeId }) {
  const C = THEMES[themeId] || THEMES.midnight;
  const ox = Math.round((width / pxSize - 34) / 2);
  const oy = Math.round((height / pxSize - 28) / 2) + 2;
  const bounce = Math.abs(osc(frame, FRAME_COUNTS.walking, 1));

  ctx.save();
  drawPixelTail(ctx, ox, oy - Math.round(bounce), frame, FRAME_COUNTS.walking, 2, C, pxSize); 
  drawCatBase(ctx, ox, oy - Math.round(bounce), 1.0, C, pxSize); 
  drawWalkingPaws(ctx, ox, oy - Math.round(bounce), frame, FRAME_COUNTS.walking, C, pxSize);
  ctx.restore();
}

function drawFish(ctx, ox, oy, C, pxSize) {
  const fx = ox + 15;
  const fy = oy + 25;
  
  // Tail
  pxRect(ctx, fx, fy, 2, 3, '#ff79c6', pxSize);
  // Body
  pxRect(ctx, fx + 2, fy + 1, 5, 2, '#8be9fd', pxSize);
  // Head
  pxRect(ctx, fx + 6, fy, 2, 3, '#8be9fd', pxSize);
  // Eye
  pxRect(ctx, fx + 6, fy + 1, 1, 1, '#282a36', pxSize);
}

export function drawEating(ctx, frame, { width, height, pxSize, themeId }) {
  const C = THEMES[themeId] || THEMES.midnight;
  const ox = Math.round((width / pxSize - 34) / 2);
  const oy = Math.round((height / pxSize - 28) / 2) + 2;

  const chewBounce = Math.abs(osc(frame, FRAME_COUNTS.eating, 1));
  const headOy = oy + 2 + Math.round(chewBounce);

  ctx.save();
  drawPixelTail(ctx, ox, oy, frame, FRAME_COUNTS.eating, 3, C, pxSize); 
  drawFish(ctx, ox, oy, C, pxSize);
  drawCatBase(ctx, ox, headOy, 1.0, C, pxSize); 
  ctx.restore();
}
