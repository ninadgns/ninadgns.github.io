# ninadgns.github.io

My personal website and utility collection — mostly for CSEDU students, plus a few personal experiments. Everything runs client-side in the browser.

🔗 **Live:** [https://ninadgns.github.io](https://ninadgns.github.io)

## Tools

### 🧮 [CGPA Calculator](/cgpa/)
A CGPA calculator built with React + Vite for CSEDU students. Supports theory and lab subjects, previous-CGPA carry-over, real-time calculation, and a mobile-responsive layout.

### ⚡ [BPDB Prepaid Recharge Tracker](/bpdb/)
Log your BPDB prepaid electricity recharges and estimate how much you spent each month. Splits each recharge across calendar months proportionally by days, shows a summary, an SVG trend chart (exportable as PNG/SVG), and a recharge log. Data persists in `localStorage`, with CSV import/export.

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
