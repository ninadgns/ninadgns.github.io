# ninadgns.github.io

My personal website and utility collection — mostly for CSEDU students, plus a few personal experiments. Everything runs client-side in the browser.

🔗 **Live:** [https://ninadgns.github.io](https://ninadgns.github.io)

## Tools

### 🧮 [CGPA Calculator](/cgpa/)
A CGPA calculator built with React + Vite for CSEDU students. Supports theory and lab subjects, previous-CGPA carry-over, real-time calculation, and a mobile-responsive layout.

### ⚡ [BPDB Prepaid Recharge Tracker](/bpdb/)
Log your BPDB prepaid electricity recharges and estimate how much you spent each month. Splits each recharge across calendar months proportionally by days, then prices each day's use at that month's slab rate. Shows a monthly summary, an SVG chart (exportable as PNG/SVG) that plots taka, kWh, or kWh/day on a real date axis, and a sortable recharge log. Also forecasts when the next recharge is due, and spells out the tariff parameters and assumptions it used. Data persists in `localStorage`, with CSV import/export.

### 🌍 [3D Scroll Tour](/3d/)
A scroll-scrubbed WebGL flythrough of the site: one continuous camera flight over a miniature world where each island is one of the tools above. Built with Three.js and bundled by esbuild. Scroll position drives the camera, so stopping the scroll stops the flight; only small idle details (the clock, the power lines, the floating cards) move on their own. Falls back to a plain document when WebGL is unavailable or `prefers-reduced-motion` is set.

### 🏛️ [Government of Bangladesh Org Chart](/bangladesh-government/)
An interactive organizational chart of the Government of Bangladesh — ministries, divisions, and their structure.

### 📅 [CSEDU28 Class Routine](/routine/)
Dynamic class routine for the CSEDU 28th batch, rendered with FullCalendar and synced from a Google Calendar.
> **Note:** not actively maintained.

### 📄 [Lab Report Cover Generator](/cover.html)
Generates standardized lab report covers. Currently redirects to a Python (Flask) app hosted on PythonAnywhere.
> **Note:** not actively maintained.

## Project Structure

```
├── index.html                 # Landing page — indexes all tools
├── cover.html                 # Lab cover generator (redirects to external app)
├── style.css / style2.css / stylef.css
├── bpdb/                      # BPDB prepaid recharge tracker (self-contained HTML)
│   └── index.html
├── cgpa/                      # Built CGPA calculator (production)
│   ├── index.html
│   └── assets/
├── CGPASource/                # CGPA calculator source (React + Vite)
├── 3d/                        # Built 3D scroll tour (bundle.js / bundle.css)
├── 3dSource/                  # 3D scroll tour source (Three.js + esbuild)
├── bangladesh-government/     # Government org chart
├── routine/                   # Built class routine (Next.js export)
├── RoutineSource/             # Class routine source
└── CoverSource/               # Lab cover generator source (Flask)
```

## Development

### CGPA Calculator
```bash
cd CGPASource
npm install
npm run dev
```

### 3D Scroll Tour
```bash
cd 3dSource
pnpm install
pnpm dev     # esbuild watch + dev server
pnpm build   # bundles into ../3d/
```

### Lab Cover Generator
```bash
cd CoverSource
pip install flask
python app.py
```

The BPDB tracker and the org chart are self-contained static pages — just open their `index.html` in a browser.

## License

[PolyForm Noncommercial 1.0.0](LICENSE.md) — source-available, not open source.

Use it, read it, fork it, change it, share it: all fine for any **noncommercial**
purpose, including personal use, research, teaching and charitable work.

**Commercial use requires a separate licence in writing.** That includes using
this code, or a derivative of it, in or for a business — a product, an internal
tool, or a service you charge for. If that is what you want, get in touch; I am
happy to license it.

Earlier revisions of this README described the project as MIT-licensed. That
statement was removed on 2 Aug 2026 and does not apply to this or any later
revision. Nothing here revokes rights anyone actually obtained under those
earlier terms.
