# Data Sorcerers — Hero Production Pack

This ZIP contains the **real individual files** generated/derived during this chat. AI-generated catalog/mockup posters are intentionally excluded.

## Recommended layer order
1. `background/background_clean.png`
2. `fx/starfield_overlay.png`
3. `fx/cosmic_arc_overlay.png`
4. `fx/horizon_lightburst.png`
5. `runes/rune_arcane_tech.png`
6. `character/sorcerer_primary.png`
7. `crystal/crystal_primary.png`
8. `staff/staff_primary.png` (optional independent layer)
9. `fx/fog_foreground.png`
10. `fx/particle_swirl.png`

Use screen/additive-like blending for glow, nebula, rune, particle, and light overlays. Keep the primary character on normal blending.

## Suggested motion depth
- Background: 0.5–1.5%
- Starfield: 1–2%
- Cosmic arc: 2–4%
- Rune: slow independent rotation
- Sorcerer: 4–7%
- Crystal: small float/orbit loop
- Foreground fog: 6–10%
- Particles: independent drift

## GSAP entrance concept
- 0.0–0.5s: dark/low-opacity environment
- 0.5–1.0s: horizon + stars wake
- 0.9–1.5s: rune scale/rotate in
- 1.2–2.2s: sorcerer reveal via mask/glow
- 1.7–2.5s: crystal/staff energy
- 2.2–2.8s: impact burst + subtle camera shake
- 2.6–3.4s: title reveal
- 3.4s+: idle/parallax

## Masks/maps
`character_alpha_mask.png`, `staff_alpha_mask.png`, and `crystal_alpha_mask.png` are derived directly from actual PNG alpha channels.

`environment_depth_concept.png` is a visual depth concept, not a physically calibrated depth map. Use it only for subtle displacement unless you replace it with a proper depth pass later.

## Responsive exports
Optimized WebP variants are under `responsive/` for desktop, tablet, and mobile.

## Quality note
Files named `*_upscaled_8k.png` are Lanczos upscales of the available source artwork. They are useful as large editing masters, but they do **not** contain genuinely reconstructed native 8K detail.

## Suggested stack
React/Next.js + GSAP/ScrollTrigger for motion and 2.5D parallax. Add Three.js/R3F only for selective particles, displacement, or shaders. Respect `prefers-reduced-motion`.
