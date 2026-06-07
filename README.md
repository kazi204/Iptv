# 📺 StreamZone — Premium Live TV & IPTV Client

StreamZone is a high-performance, single-page React IPTV and HLS player crafted with TypeScript, Vite, Tailwind CSS, and Framer Motion. It enables modern digital live TV web-tuners to load worldwide digital broadcasting lists seamlessly.

---

## ✨ Features & Polish

- 🎨 **Premium Aesthetic**: Clean, high-contrast dark space theme built using custom elegant **Outfit** displays paired with code-formatted **JetBrains Mono** data labels.
- 🚀 **Virtualized Channel Feed**: Custom dynamic grid virtualization using `react-window` that handles directory lists exceeding **200+ channels** at a buttery-smooth 60fps.
- ⚡ **Lazy Load Optimization**: Route-splitting via `React.lazy()` and visual Suspense loader indicators for lightning-fast page entry performance.
- 🛡️ **Boundary Protection**: Self-contained React `ErrorBoundary` wraps the video container, ensuring graceful debug feedbacks if network streams or CORS security blocks decoding.
- 📂 **M3U Loader**: Drag-and-drop or select digital playlists instantly, featuring instant channel categorical splitting.
- ❤️ **Interactive Favorites**: Bookmark and archive streams locally using native persistence.

---

## 🛠️ Technology Stack Reference

- **Language**: TypeScript
- **Runtime Env / Bundler**: React 19 + Vite 6
- **Layout & CSS**: Tailwind CSS
- **Media Engine**: HLS.js
- **Animations**: Motion (`motion/react`)
- **Icons**: Lucide React
- **Virtualizer**: `react-window`

---

## 🏃 Local Quick Start

To boot the developer environment locally, run the standard development sequence:

```bash
# 1. Install Node modules
npm install

# 2. Start the local server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) inside your browser to start streaming!

---

## 🚀 Build and Test

```bash
# Verify type imports & run linters
npm run lint

# Build static SPA asset distributions
npm run build
```

---

## 📍 Directory Structure

```
├── /src
│   ├── /components      # UI Cards, Navbar, ErrorBoundary, lists
│   ├── /context         # TVContext state provider module
│   ├── /pages           # Code-split views (Home, WatchPage)
│   ├── /utils           # Stream validators & network diagnostics
│   └── main.tsx         # Virtual DOM renderer entry-point
├── /index.html          # App Shell, SEO og:meta, Favicons
├── /vercel.json         # Routing rules for production servers
└── /DEPLOYMENT.md       # Vercel deploy steps documentation
```
