SkyCast AI — Premium Mobile UI update

This bundle is based on the saved SkyCast 360 weather bundle. It adds CSS-only visual polish: premium glass-style cards, smoother transitions, responsive spacing and mobile navigation refinements. The original JavaScript and feature markup are preserved, including city search, GPS, weather data, sunset score, saved cities, sky preview controls and download, 7-day forecast, moon/stargazing, and the SkyCast map link.

Sky Preview note: the existing preview is drawn locally on a canvas and does not wait for an AI image-generation API. Its rendering logic was intentionally left unchanged. This source bundle does not contain a separate Gemini/AI photo-generation feature, so no unseen AI generation logic was fabricated or replaced.

Files: index.html, skymap.html
Deploy: extract the ZIP and upload both files to the same GitHub Pages folder, replacing index.html and retaining the existing skymap.html.
