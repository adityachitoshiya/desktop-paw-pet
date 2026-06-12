<div align="center">
  <h1>🐾 Desktop Paw-Pet</h1>
  <p>An adorable, fully interactive 16-bit pixel art pet that lives on your desktop!</p>
</div>

## 🌟 Overview
Desktop Paw-Pet is a lightweight, cross-platform desktop pet that physically roams across your screen. Built with Electron and React, it features a unique Hybrid Rendering Engine that supports both infinite procedural coloring and traditional `.png` sprite sheets!

It constantly runs in the background and reacts to your global system activity.

## 📥 Download

Get the latest version of Desktop Paw-Pet:

- 🍎 **[Download for macOS (Apple Silicon)](https://github.com/adityachitoshiya/desktop-paw-pet/releases/download/v1.0.0/Desktop%20Paw-Pet-1.0.0-arm64-mac.zip)**
- 🪟 **[Download for Windows (ARM/x64)](https://github.com/adityachitoshiya/desktop-paw-pet/releases/download/v1.0.0/Desktop%20Paw-Pet%20Setup%201.0.0.exe)**

*(Note: Go to the [Releases page](https://github.com/adityachitoshiya/desktop-paw-pet/releases) if the direct links do not work yet!)*

## ✨ Features
* **Global Interactivity**: 
  * ⌨️ **Typing**: The cat bounces up and down playfully when you type on your physical keyboard.
  * 🖱️ **Mouse Tracking**: Move your mouse near the cat, and it will look at your cursor and try to swipe at it!
* **Physical Roaming**: Your pet will randomly stand up and walk across your screen, bouncing off the edges of your monitor so it never gets lost.
* **Hybrid Graphics Engine**:
  * **Procedural Pixel Art**: Choose between 5 different dynamic color themes (Midnight, Snow, Ginger, Ash, Mocha).
  * **Sprite Sheets**: Includes custom support for `.png` sprite sheets, featuring the exclusive **Oreo Cat (Aichan)**!
* **Feeding**: Treat your pet! Click the **"Feed Cat 🐟"** button to drop a pixel-art fish for them to nibble on.
* **Drag & Drop**: Grab your cat and toss it anywhere on your screen.

## ⚙️ Settings
Access the **Settings Dashboard** from your macOS Menu Bar or Windows System Tray to:
- Adjust Cat Size (Shrink or Grow!)
- Adjust Walking Speed
- Change Themes
- Enable/Disable Roaming
- Toggle Click-Through Mode

## 🛠️ Development Setup
To run this project locally:

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev

# Build for production
npm run build:mac
npm run build:win
```

## 📜 License
Personal Project. Uses `electron-vite` and `uiohook-napi` for global keyboard/mouse tracking. 
Sprite Sheet `Oreo Cat - Aichan_owo` integrated via custom hybrid raster engine.
