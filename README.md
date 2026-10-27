# SkyCast AI — Own-site Sky Map + Sky Preview update

## Files
- `index.html`: replacement home page entry point. It links to the two new on-site tools.
- `skymap.html`: an interactive SkyCast canvas map with drag rotation, zoom, layers, object finder UI, GPS coordinates, date/time and optional weather.
- `sky-preview.html`: a sky-appearance illustration tool and prompt builder for an external AI image-generation model.

## Important honesty note
The sky map is an original SkyCast canvas visualisation with a generated star field and illustrative constellation lines. It is **not** the full Stellarium catalogue, and object positions are not yet precision astronomy ephemerides. It does not redirect the user to the Stellarium website.
The sky-preview is an illustration and prompt builder, not true AI photo generation. Real AI image generation needs an image API. Do not put a private API key into GitHub Pages JavaScript; visitors can inspect it. To add true generation securely, use a serverless backend/proxy and a provider account/API key.

## Install on phone via GitHub
1. Open the ZIP and extract it.
2. Open the repo: https://github.com/dishantbhatia99/skycast
3. For `skymap.html` and `sky-preview.html`: use **Add file → Create new file**, enter the exact filename, paste the corresponding file's complete code, then commit.
4. To replace the home page, edit `index.html`, replace the full contents with this package's `index.html`, and commit.
5. Visit https://dishantbhatia99.github.io/skycast/ and hard refresh or use an incognito tab.

Weather comes from the public Open-Meteo API and needs internet access. GPS needs browser permission.
