# TARGET — what the finished city is

**This file is for the AI working on the project. It is deliberately not surfaced in the
interface, and nothing here should ever be rendered as UI copy, a roadmap, or an explanation
to the user.** The point of the thing is that it is discovered, not described.

---

## The finished state

An island city drawn entirely as pencil stipple on paper, sitting on a fixed plot, that is a
literal readout of one person's AI stack:

- **Every district is a provider.** Not a metaphor for one — the district *is* Hermes, Z.ai,
  OpenRouter, OpenCode, Antigravity. Its name is the provider's name.
- **Every district's completeness is measured.** Density, parcel count, building height and
  road density all derive from that provider's real reported usage against a declared
  reference scale. Nothing is decorative; if a district is dense, that provider is genuinely
  heavy.
- **Every district grows without being touched.** A daily job re-reads the provider accounts.
  Lifetime totals only ever rise, so the city fills in on its own, a little each day, with no
  interaction. Opening it after a week away should show a visibly further-built city.
- **Blind spots stay visible as blind spots.** A provider with no key, or with no usage API at
  all, renders as sparse scaffold and says why. A gap in knowledge must never be papered over
  into a confident-looking structure. This is the single most important rule in the project.
- **The ground is permanent.** Terrain, island edge, boulevards and tree cover are drawn
  whatever the filter state, so the island always reads as a place.

## Growth model

**Two axes. Both are live.**

- **Sideways** — `fitConfig()` sizes the island from the actual extents of every district, so
  placing a district beyond the current edge *expands the city* instead of leaving it floating
  off the plot. Terrain stipple density scales with the island, so a bigger city is not a
  thinner one. (Verified: 34 → 44 units by adding one district at z=15.5.)
- **Up** — a district may carry `"tier": 1` (or higher). It is lifted onto a deck at
  `LEVEL_HEIGHT` per tier, with a stippled rim, a sparse deck grid and support columns that run
  all the way down to the terrain. The columns matter: without them the district reads as
  buildings floating in mid-air. (Verified: mean height 0.67 → 2.23, max 2.79 → 5.19, with
  minimum y still on the ground at -0.17.)

**Who builds what.** Provider districts fill in on their own from measurement. Structural
additions — new districts, promotion to a higher tier — are the AI's job: they require a real
thing to map to, stated in the district's `evidence` field. No evidence, no district.

## The two jobs

| Job | Schedule | Mode | What it does |
|---|---|---|---|
| City usage snapshot | daily, 05:00 | script, no LLM | Re-reads Hermes + each provider account. Writes `usage.json` and today's `history.json` entry. |
| City expansion | Mondays, 06:00 | agent | Decides whether the city has earned ONE new district. Adds it, with evidence, or does nothing. |

Both deliver `local` — they deliberately do not notify. The city simply is further along next
time it is looked at. One measurement per calendar day; the collector replaces today's entry
rather than appending, so a day it ran five times still counts as one day. Growth is normally
cumulative and monotonic, but a provider that resets — a new billing cycle, a topped-up balance
— will legitimately *reduce*, and that must show honestly rather than be clamped away.

## The mystery clause

The user asked for this in plain words: *"not letting the user know anything, the building is
a mystery."* Concretely, that forbids:

- UI copy describing what the city will become, or how far along it is toward some goal.
- Roadmaps, "coming soon", milestone banners, progress percentages toward a finish line.
- Explanations of what any structure *means* beyond the plain legend the user explicitly asked
  for (district name, completeness band, the measured number behind it).
- Spoilers in chat. Describing the plan is fine; narrating the wonder is not.

What the user sees: a city, a legend, a toggle. What the AI knows: everything above.

## Non-negotiables (do not relitigate these)

- Single self-contained page. Plain JS. **No npm, no bundler, no build step, no framework.**
- Three.js r186 as ES modules, vendored locally, resolved through an import map. Never the UMD
  `OrbitControls` `<script>` pattern.
- Rendering is instanced screen-facing quads plus a custom `ShaderMaterial` — CSS-pixel dot
  sizing, circular via `discard`, one draw call. **Never `THREE.Points` / `PointsMaterial`.**
- The pass/fail test is whether it reads as pencil-stippled architecture, **not** frame rate.
  Uniform random scatter inside a shape is the named failure mode. Bias density toward
  silhouettes and corners, jitter every point off any grid, vary density with height.
- Served on the LAN IP explicitly — `192.168.1.79`, never `0.0.0.0` — so the phone can reach it.
- "Earned, never guessed": no invented significance, no fabricated totals, no bar drawn for a
  provider that reported nothing.

## Where things live

| Path | Role |
|---|---|
| `procedural-city-demo.html` | The page. Legend, theme, filter, usage wiring. |
| `procedural-city-renderer.js` | Renderer. Owns `THEMES`; rebuilds points in place. |
| `procedural-city-data.js` | Geometry generator: terrain, roads, parcels, buildings, trees. |
| `city.json` | District definition. Districts bind to providers via `source`. |
| `collect-usage.py` | Collects Hermes + provider usage. Writes `usage.json`, `history.json`. |
| `history.json` | One entry per day. The growth record. |
| `../.local/bin/city-kit-open.sh` | Launcher — ensures the server, opens the page. |

The split is deliberate: **the renderer is code, the city is data.** A model extends the place
by writing `city.json`, never by editing the renderer.

Working on this project? Load the `ai-growth-visualizer` skill first — it carries the proven
baseline, the known pitfalls and the reporting format.