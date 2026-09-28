---
name: data-sorcerers-sound
description: Use when adding, changing, or debugging UI sound/audio on the Data Sorcerers Astro site — the procedural Web Audio SFX engine, the floating mute orb, per-component cues (data-sfx / data-sfx-hover / ds:sfx), the ambient drone, or the /lab/sound audition page. Triggers on sound, SFX, audio, backsound, ambient, cue, mute orb, click/hover sound.
---

# Data Sorcerers — sound system

Fully procedural **Web Audio API** audio: no audio assets, no new dependencies,
no licensing. One engine synthesises every cue and an ambient drone.

**Read `docs/sound-sop.md` first** — it is the full SOP (architecture, palette,
wiring, tuning knobs, gotchas). This skill is the quick operating summary.

## Files

- `src/scripts/sound.ts` — engine singleton `sound` (cues + ambient).
- `src/components/Sound.astro` — floating mute orb + delegated wiring; mounted
  once in `src/layouts/BaseLayout.astro`.
- `src/pages/lab/sound.astro` — `noindex` audition page (excluded from sitemap).
- `scripts/verify.mjs` — hides `.sound-toggle` so reference diffs stay clean.

## Cues

`hover`, `click`, `select`, `transition`, `open`, `close`, `success`, `error`.
Each is an oscillator/envelope recipe plus inharmonic bell partials (`sparkle()`)
and, for `open`/`success`, a high-band noise `shimmer()`. Long procedural reverb
tail. `transition` is the short (0.28 s) seal whoosh played on internal links.

The site uses Astro **`<ClientRouter />` (View Transitions)**, so the
`AudioContext` persists across pages (no cut) and bundled scripts do **not**
re-run on a swap. `Sound.astro` therefore re-binds the orb on `astro:page-load`
and registers its delegated wiring once (guard `window.__dsSoundWired`). See
`docs/sound-sop.md` §9.

## How to wire a component

1. Simple click → add `data-sfx="click|select|open|success|error"` to the element.
2. Hover → add `data-sfx-hover="hover"` (only fires on `(hover: hover)` devices).
3. Stateful (open/close etc.) → dispatch from the component script:
   `window.dispatchEvent(new CustomEvent('ds:sfx', { detail: { cue: 'open' } }))`.
4. Do **not** call `sound.play()` directly from components — keep mute/reduced-
   motion gating centralised in `Sound.astro`.

## Hard rules

- **No new dependencies and no audio files** (no Howler/Tone/`.mp3`).
- Reduced motion: `Sound.astro` sets `setAmbientAllowed(false)` and attaches no
  wiring. Keep it that way or `verify.mjs` / `responsive-audit.mjs` (reduce mode)
  break.
- Audio only plays after a user gesture (autoplay policy) — never bypass.
- Mute preference lives in `localStorage['ds:sound']` (`'off'`/`'on'`), default on.
- If you rename/replace `.sound-toggle`, update both the `addInitScript` hide and
  the `setNavbarHidden` list in `scripts/verify.mjs`.
- Keep the `sitemap({ filter })` excluding `/lab/` so `seo:audit` still sees 14 URLs.

## Verify

```sh
npm run format:check && npm run build
PREVIEW_URL=http://localhost:4333 node scripts/verify.mjs
PREVIEW_URL=http://localhost:4333 node scripts/responsive-audit.mjs
```

Tuning knobs (`MASTER_GAIN`, `AMBIENT_GAIN`, per-cue gains, reverb, `sparkle`)
and the Vite-dev-cache gotcha are documented in `docs/sound-sop.md` §6–8.
