# 🐾 Desktop Paw-Pet

A transparent, interactive virtual desktop pet for macOS — a cute 2D cat that sits on your desktop and reacts to your keyboard and mouse activity!

![macOS](https://img.shields.io/badge/macOS-000?logo=apple&logoColor=white)
![Electron](https://img.shields.io/badge/Electron-35-47848F?logo=electron&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)

## ✨ Features

- **Transparent overlay** — the cat floats on your desktop with no window chrome
- **Click-through** — clicks pass right through to your other apps
- **Reacts to typing** — the cat mimics your keystrokes with paw tapping
- **Reacts to your cursor** — move your mouse near the cat and it swipes at it!
- **Always on top** — visible on all desktop spaces and over fullscreen apps
- **Drag mode** — press `⌘⇧P` to toggle drag mode and reposition the cat

## 🚀 Quick Start

### Prerequisites

- **macOS** (tested on macOS 14+)
- **Node.js** 18+ and npm
- **Xcode Command Line Tools** (for native module compilation):
  ```bash
  xcode-select --install
  ```

### Installation

```bash
# Clone or navigate to the project
cd desktop-paw-pet

# Install dependencies
npm install

# Rebuild native modules for Electron
npm run rebuild

# Start the app in dev mode
npm run dev
```

### Build for Production

```bash
npm run build
```

## 🔐 macOS Permissions Setup

**Desktop Paw-Pet requires two macOS permissions to capture global events:**

### 1. Accessibility Permission

1. Open **System Settings** → **Privacy & Security** → **Accessibility**
2. Click the **+** button
3. Add the **Desktop Paw-Pet** app (or Electron during development)
4. Make sure the toggle is **ON**

### 2. Input Monitoring Permission

1. Open **System Settings** → **Privacy & Security** → **Input Monitoring**
2. Click the **+** button
3. Add the **Desktop Paw-Pet** app
4. Make sure the toggle is **ON**

> **Note:** During development, you'll need to add the **Electron** app itself (found in `node_modules/electron/dist/Electron.app`) to both permissions. The app will prompt you automatically on first launch.

> **Tip:** If the cat doesn't react to keyboard/mouse after granting permissions, **restart the app** — macOS only activates permissions after a process restart.

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘⇧P` | Toggle click-through / drag mode |

## 🐱 Cat States

| State | Trigger | Animation |
|-------|---------|-----------|
| **Idle** | Default | Gentle breathing, tail sway, occasional blink |
| **Typing** | Any global keypress | Paw tapping animation (300ms debounce) |
| **Swiping** | Mouse within 80px | Paw swipe toward cursor direction |

## 🎨 Custom Sprites

The cat is rendered procedurally on a `<canvas>` element. To use your own sprite sheets:

### Option A: Sprite Sheet (Recommended)

1. Create a PNG sprite sheet with frames arranged in a grid
2. Place it in `src/renderer/public/`
3. Modify `src/renderer/src/sprites/CatSprites.js`:
   - Replace the `drawIdle/drawTyping/drawSwiping` functions with sprite sheet frame extraction
   - Use `ctx.drawImage(sheet, sourceX, sourceY, frameW, frameH, 0, 0, 200, 200)`

### Option B: WebM with Alpha

1. Export animations as WebM with alpha transparency
2. Use a `<video>` element with `transparent` background instead of `<canvas>`
3. Switch video source based on state

### Sprite API

Each draw function receives:
```js
drawIdle(ctx, frame, { width, height, cursorAngle })
```
- `ctx` — Canvas 2D rendering context
- `frame` — Current animation frame number (cycles through `FRAME_COUNTS[state]`)
- `width/height` — Canvas dimensions (200×200)
- `cursorAngle` — Angle from cat center to cursor (radians, used by swiping)

## 🏗️ Project Structure

```
desktop-paw-pet/
├── package.json
├── electron.vite.config.mjs        # Build config (main + preload + renderer)
├── src/
│   ├── main/
│   │   ├── index.js                # Electron entry: window, IPC, shortcuts
│   │   └── uiohook.js             # Global keyboard/mouse capture
│   ├── preload/
│   │   └── index.js               # Context bridge (secure IPC API)
│   └── renderer/
│       ├── index.html             # HTML shell
│       └── src/
│           ├── main.jsx           # React entry
│           ├── App.jsx            # Root component
│           ├── App.css            # Styles (transparent background)
│           ├── components/
│           │   ├── CatCanvas.jsx  # Canvas sprite renderer
│           │   └── StatusBadge.jsx # Dev state indicator
│           ├── hooks/
│           │   ├── useCatState.js  # State machine (idle/typing/swiping)
│           │   └── useGlobalEvents.js # IPC event listener
│           ├── sprites/
│           │   └── CatSprites.js  # Procedural cat drawing
│           └── utils/
│               └── geometry.js    # Distance/proximity math
└── out/                           # Build output (generated)
```

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Cat doesn't react to keyboard | Grant Accessibility + Input Monitoring permissions, restart app |
| White background appears | Ensure `html, body { background: transparent !important; }` in CSS |
| Cat invisible / not rendering | Check DevTools console (`⌘⇧P` to enable drag mode, then right-click → Inspect) |
| High CPU usage | Mouse throttling is set to 60ms; increase `MOUSE_THROTTLE_MS` in `uiohook.js` |
| App crashes on launch | Run `npm run rebuild` to recompile native modules for your Electron version |
| Can't drag the cat | Press `⌘⇧P` to toggle click-through off, then drag |

## 📄 License

MIT
# desktop-paw-pet
