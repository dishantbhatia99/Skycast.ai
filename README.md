# SkyCast AI — Pro refresh

This package is a mobile-first replacement for the main `index.html` plus a `skymap.html` page.

## What's improved
- Responsive dark glass-style layout for phones and desktop.
- City search and optional GPS location.
- Live current conditions and 7-day forecast using Open-Meteo's public forecast/geocoding endpoints.
- Sunset outlook score based on cloud cover, visibility and rain probability. It is an estimate, not a guarantee.
- Sky visualiser with sunrise/noon/sunset/night presets and a save-as-PNG button. This is a local illustration, **not** an AI-generated photograph.
- Approximate Moon phase label.
- Sky Map page links to the full Stellarium Web app. Embedding may be blocked by some browsers, so the page also explains how to open it directly.
- No Gemini API key is needed for these features.

## Upload using your phone
1. Download and extract `skycast-pro-update.zip`.
2. Open your repository: https://github.com/dishantbhatia99/skycast
3. Open `index.html` → Edit (pencil) → replace the entire file with the new `index.html` → Commit changes.
4. Add or replace `skymap.html` at the repository root with the file in this ZIP.
5. Wait a minute, then open https://dishantbhatia99.github.io/skycast/ and refresh the page. If old content remains, clear the browser cache or open in a private tab.

## Notes
- GitHub Pages is static hosting. This code does not need a server or build step.
- Weather/geocoding require internet access.
- The GPS button needs HTTPS (GitHub Pages is HTTPS) and browser location permission.
- Forecast endpoints can occasionally be unavailable or rate-limited.
- Stellarium is a third-party website. The map itself and its sensor behavior are controlled by Stellarium/browser, not this wrapper.
- The package intentionally does not include or request a secret API key.
