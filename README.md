# point-cloud-city

A procedural city drawn entirely as pencil stipple on paper, where **every district is a real
AI provider and every district's completeness is that provider's measured usage.**

No decorative density. If a district looks built, that provider is genuinely heavy. If a
provider reports nothing, its district renders as sparse scaffold and says why.

## What it is

- **Stippled, not scattered.** Points are biased toward silhouettes, corners and edges, jittered
  off any grid, with density varying by height. The pass/fail test is whether it reads as
  hand-drawn architecture — uniform random scatter inside a shape is the named failure mode.
- **One district per provider.** Hermes, OpenRouter, Z.ai, OpenCode, Gemini/Antigravity.
- **Provider figures are account-scoped.** They come from each provider's own account/key
  endpoint, so they include usage from *any* application on that account — nothing needs
  instrumenting or cooperating. Query the account, not the app.
- **Blind spots stay blind.** No key, or no usage API at all → sparse and labelled. A gap in
  knowledge is never papered over into a confident-looking structure.
- **It grows on its own.** A daily job re-reads the accounts, so the city fills in without
  being touched. It can also grow *structurally*: sideways (the island resizes to hold new
  districts) and up (a district can be raised onto a tiered deck with support columns).

## Run it

Needs a static file server — ES modules will not load over `file://`.

```bash
python3 -m http.server 8082 --bind 127.0.0.1
# then open http://127.0.0.1:8082/procedural-city-demo.html
```

To wire in real usage:

```bash
python3 collect-usage.py
```

It reads Hermes's local session database and any provider keys present in the environment
(`OPENROUTER_API_KEY`, `ZAI_API_KEY`, `OPENCODE_GO_API_KEY`). It never writes, logs or transmits
a key value — only whether one is present. With no keys it still runs and reports every
provider as `no key set`.

## Deploy to Vercel

Static site, no build step. Import the repo — Vercel serves it as-is and `vercel.json` maps `/`
to the demo page. Nothing else to configure.

## Controls

| | |
|---|---|
| `T` or the button | light / dark theme |
| `L` | show / hide the legend |
| `R` | reset the camera |
| legend checkboxes | show any combination of districts; `ALL` / `NONE` |
| drag / scroll | orbit / zoom |

Theme and district selection persist across visits.

## Stack rules

Deliberately unfashionable, and load-bearing:

- Single self-contained page. Plain JS. **No npm, no bundler, no build step, no framework.**
- Three.js r186 as ES modules, vendored locally, resolved through an import map. Never the UMD
  `OrbitControls` `<script>` pattern.
- Rendering is **instanced screen-facing quads with a custom `ShaderMaterial`** — CSS-pixel dot
  sizing that stays constant across depth and device pixel ratio, circular dots via `discard`,
  one draw call. Not `THREE.Points`; `gl_POINTS` sizing is inconsistent across GPUs and balloons
  on high-DPI displays.

## Layout

| File | Role |
|---|---|
| `procedural-city-demo.html` | The page: legend, theme, filter, usage wiring |
| `procedural-city-renderer.js` | Renderer. Owns `THEMES`; rebuilds points in place |
| `procedural-city-data.js` | Geometry: terrain, roads, parcels, buildings, trees. Sizes the island |
| `city.json` | District definition. Districts bind to providers via `source` |
| `collect-usage.py` | Collects Hermes + provider usage → `usage.json`, `history.json` |
| `TARGET.md` | The design spec, including the rules that keep it honest |

The split is deliberate: **the renderer is code, the city is data.** The city can be extended by
editing `city.json` alone.

## Licence

MIT.