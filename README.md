# 🏃 Smart Escape — Intelligent Evacuation Routing System

**Smart Escape** is a frontend-only Single Page Application (SPA) built with **React** and **Tailwind CSS**. It provides real-time emergency routing, dynamic hazard navigation, and interactive 2D floor plan visualization using **Dijkstra's Shortest Path Algorithm** with strict 3-tier tie-breaking rules.

![Smart Escape](https://img.shields.io/badge/Smart%20Escape-v2.0-10b981?style=for-the-badge&logo=shield)
![React](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v3-38bdf8?style=for-the-badge&logo=tailwindcss)
![Vite](https://img.shields.io/badge/Vite-8-646cff?style=for-the-badge&logo=vite)
![Zero Dependencies](https://img.shields.io/badge/Backend-Zero%20Dependencies-brightgreen?style=for-the-badge)

---

## ⚡ Core Features

1. **JSON Upload & Interactive 2D Graph Map**
   - Supports uploading custom floor plans conforming to the standard schema (`nodes`, `edges`, `initial_state`).
   - Interactive SVG map with dynamic coordinate scaling, pan & zoom, middle corridor cost badges, and hover tooltips.
   - Includes 4 built-in realistic presets:
     - **Corporate Headquarters** (Default multi-wing office complex)
     - **Tie-Breaker Research Facility** (Engineered to test all 3 Dijkstra tie-breaker levels)
     - **City Hospital Emergency Ward** (ICU, Trauma bays, Ambulance exits)
     - **Metro Transit Station Sub-Level** (Underground concourse and escape shafts)

2. **Dijkstra Shortest Path with Strict Tie-Breakers**
   - Calculates the lowest-cost evacuation route from any unblocked starting room/junction to the nearest reachable open emergency exit.
   - **Tie-Breaker Hierarchy**:
     1. **Lowest total cost**
     2. **Lexicographically smallest exit ID** (e.g., `EX_A` vs `EX_B`)
     3. **Lexicographically smallest node ID sequence** (e.g., `['R_START', 'J_ALPHA', 'EX_A']` vs `['R_START', 'J_BETA', 'EX_A']`)

3. **Dynamic Hazard Toggles**
   - Click any node or corridor line on the map (or use the Hazard Manager list) to dynamically toggle blocked / unblocked status.
   - The optimal evacuation route recalculates instantly in response to real-time hazard changes.
   - **Reset to Initial State**: Restores the map to the preset/uploaded `initial_state`.
   - **Emergency Drill Simulator**: Triggers simulated random fires/collapses for drill training.

4. **Edge Cases & Error Handling**
   - **"Starting location blocked"** alert if the occupant's current room becomes hazardous.
   - **"No route available"** alert if all passages to open exits are severed.
   - **"No open exits available"** alert if all exits are locked or blocked.
   - **JSON Schema Validation**: Full syntax and semantic verification (identifies missing fields, negative costs, duplicate IDs, invalid types, or disconnected edge references).

5. **Bilingual User Interface (English / বাংলা)**
   - Complete toggle switch between **English** and **বাংলা (Bengali)** for all UI controls, status banners, hazard logs, navigation directions, and modals.

6. **Interactive Walkthrough & Micro-Audio Synthesis**
   - Step-by-step runner evacuation simulation with celebratory confetti on safe exit.
   - Synthesized sound effects generated purely client-side via the browser's **Web Audio API** (zero external sound files needed).

---

## 📋 JSON Map Schema Specification

Floor plans adhere to the following schema:

```json
{
  "name": "Corporate Headquarters",
  "nodes": [
    { "id": "R_OFFICE_101", "label": "Office 101", "type": "room", "x": 120, "y": 120 },
    { "id": "J_NORTH", "label": "North Junction", "type": "junction", "x": 240, "y": 220 },
    { "id": "EX_WEST", "label": "Exit West Wing", "type": "exit", "x": 40, "y": 230 }
  ],
  "edges": [
    { "id": "E_OFFICE_JN", "from": "R_OFFICE_101", "to": "J_NORTH", "cost": 12 },
    { "id": "E_JN_EXWEST", "from": "J_NORTH", "to": "EX_WEST", "cost": 18 }
  ],
  "initial_state": {
    "blocked_nodes": [],
    "blocked_edges": [],
    "closed_exits": []
  }
}
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/jawaid687/Smart_route222.git
cd Smart_route222

# Install dependencies
npm install
```

### Running Locally
```bash
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) in your browser.

### Running Automated Verification Tests
```bash
node test/verify.test.js
```
Runs 18 unit tests validating Dijkstra calculation, 3-tier tie-breakers, hazard states, and schema checks.

### Building for Production
```bash
npm run build
```
Creates optimized static assets in the `dist/` directory.

---

## 🛠️ Tech Stack
- **Framework**: React 19
- **Styling**: Tailwind CSS v3 (with PostCSS and Autoprefixer)
- **Icons**: Lucide React
- **Audio FX**: Web Audio API (Synthesized tone generator)
- **Particles**: Canvas-Confetti
- **Build Tool**: Vite 8
