# Contributing

Thanks for looking. This is a small project with a narrow spine, so the fastest way to get a change
merged is to know which parts are fixed.

## The two non-negotiables

**1. Nothing is invented.** Every number on screen must trace to a real source, or be labelled as a
placeholder. A district that has no data renders sparse and says why — it is never filled in to look
better. A pull request that adds a plausible-looking figure with no source behind it will not be
merged, however good it looks.

**2. It has to read as stipple.** The pass/fail test for any visual change is whether the result
looks like hand-drawn architectural stippling. Frame rate is not the test. The named failure mode is
uniform random scatter inside a shape: density must bias toward silhouettes, corners and edges,
points must be jittered off any grid, and density should vary with height on vertical structures.

## Stack constraints

These are deliberate, not incidental. Please do not "modernise" them:

- No npm, no bundler, no build step, no framework. A single self-contained page and plain JS.
- Three.js **r186**, vendored, loaded as ES modules through an import map. Never the UMD
  `OrbitControls` `<script>` pattern.
- Rendering is instanced screen-facing quads with a custom `ShaderMaterial`. **Not** `THREE.Points` —
  `gl_POINTS` sizing is inconsistent across GPUs and balloons on high-DPI displays.

## Running it locally

ES modules will not load over `file://`:

```bash
python3 -m http.server 8082 --bind 127.0.0.1
# open http://127.0.0.1:8082/procedural-city-demo.html
```

## Before you open a pull request

- **Check it renders.** Open the page and confirm the canvas is not blank. A silent shader compile
  error once produced an empty canvas with a perfectly working HUD and no JS error — a blank canvas
  is not always a JS failure.
- **Do not commit `usage.json` or `history.json`.** They are gitignored because they hold personal
  usage data. Keep them that way.
- **Never commit a key**, and never print one. `collect-usage.py` reads keys from the environment and
  reports only whether one is present. That behaviour is a requirement, not a convenience.
- **Changing the renderer is a last resort.** If you want a different city, edit `city.json` — the
  renderer is code, the city is data, and that split is what keeps the project extensible.

## Adding a district

Districts live in `city.json`. To bind one to a provider, set `source` to that provider's id and
give it a `reference` scale. Districts not bound to a provider must carry an `evidence` field naming
the real thing they map to.

Place a new district out beyond the current edge and the island will resize to hold it; add
`"tier": 1` to raise it onto a deck. Do not move or retune existing districts in the same change.

## Reporting bugs

Include your browser and OS, whether the canvas rendered at all, and any console output. If the
canvas is blank but the HUD works, say so explicitly — that is a specific failure mode with a
specific cause.