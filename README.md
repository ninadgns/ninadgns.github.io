# ninadgns.github.io

My personal website and utility collection for CSEDU students.

## Overview

This repository contains my GitHub Pages website that hosts various educational tools and utilities, primarily designed for Computer Science and Engineering students at the University of Dhaka (CSEDU), particularly the 28th batch.

## Features

### 🧮 [CGPA Calculator](/cgpa)
A comprehensive CGPA calculator built with React that helps students calculate their cumulative grade point average. Features include:
- Support for theory and lab subjects
- Previous CGPA integration
- Real-time calculation
- Mobile-responsive design

### 📅 [CSEDU28 Class Routine](/routine)
Dynamic class routine display using FullCalendar library, synchronized with a Google Calendar that I maintain for the CSEDU 28th batch class schedule.
<span style="color: red;">**Note: This routine is not maintained properly**</span>

### 📄 [Lab Report Cover Generator](/cover)
A tool for generating standardized lab report covers. Currently redirects to a Python web application hosted on PythonAnywhere.
<span style="color: red;">**Note: This part of the project is also not maintained properly**</span>

## Project Structure

```
├── cover.html                     # Lab cover generator (redirects to external app)
├── presentation_references.html   # Academic presentation references
├── routine.html                   # Class routine display
├── README.md                      # Project documentation
├── style.css                      # Main stylesheet
├── style2.css                     # Additional styles
├── stylef.css                     # Additional styles
├── cgpa/                          # Built CGPA calculator (production)
│   ├── index.html
│   └── assets/
├── CGPASource/                    # CGPA calculator source code
│   ├── src/
│   │   ├── App.jsx               # Main React component
│   │   ├── InputSlider.jsx       # Slider input component
│   │   ├── LabSubject.jsx        # Lab subject component
│   │   ├── TheorySubject.jsx     # Theory subject component
│   │   ├── PrevCGPA.jsx          # Previous CGPA component
│   │   └── [Other components]
│   ├── package.json
│   └── vite.config.js
└── CoverSource/                   # Lab cover generator source
    └── app.py                     # Python Flask application
```

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript, React
- **Build Tool**: Vite
- **Calendar**: FullCalendar library
- **Backend**: Python Flask (for cover generator)
- **Hosting**: GitHub Pages, PythonAnywhere

## Development

### CGPA Calculator
The CGPA calculator is built with React and Vite. To run locally:

```bash
cd CGPASource
npm install
npm run dev
```

### Lab Cover Generator
The cover generator is a Python Flask application:

```bash
cd CoverSource
pip install flask
python app.py
```

## Live Website

Visit the live website at: [https://ninadgns.github.io](https://ninadgns.github.io)

## Contributing

This project is primarily for personal use and CSEDU students, but suggestions and improvements are welcome!

## License

This project is open source and available under the MIT License.