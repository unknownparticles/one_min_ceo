<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# One Min CEO

This contains everything you need to run your app locally.

The app is built as a static Vite site for GitHub Pages. AI calls use the
SiliconFlow OpenAI-compatible chat completions API with
`deepseek-ai/DeepSeek-V4-Flash`.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set `VITE_SILICONFLOW_API_KEY` in `.env.local` to your SiliconFlow API key
3. Run the app:
   `npm run dev`

## Deploy to GitHub Pages

1. Enable GitHub Pages with “GitHub Actions” as the source.
2. Add repository secret `SILICONFLOW_API_KEY`.
3. Push to `main` or run the “发布 GitHub Pages” workflow manually.

The workflow writes the key into `public/runtime-config.js` during build so the
key is not committed to git. Because GitHub Pages is static hosting, the key is
still visible to browser users at runtime; use only short-lived or restricted
keys for this deployment mode.
