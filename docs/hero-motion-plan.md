# Plan — Hero sections "hidup" (parallax / GSAP)

Status: **SELESAI SEMUA (6 Oct 2026)** — efek **A + B + C** (entrance copy +
scroll parallax bg + pointer parallax desktop) terpasang di keenam hero; Contact
tanpa scroll parallax (bukan full-bleed). ·
Patuhi `docs/pixel-precision-sop.md` + `AGENTS.md`.

## 1. Tujuan

User: _"semua di bagian hero section itu kek hidup gitu, terserah mau
ditambahin parallax scroll atau GSAP, nanti dicoba brainstorming."_

Setelah migrasi #9, hero jadi **gambar statis** (video + partikel Three.js +
pin-timeline dibuang). Plan ini mengembalikan rasa "hidup" secara ringan, tanpa
mengorbankan presisi/benchmark.

## 2. Kondisi hero sekarang

| Halaman     | File                     | Bentuk                                   | Section                     |
| ----------- | ------------------------ | ---------------------------------------- | --------------------------- |
| Home        | `Hero.astro`             | `.art-bg` full-bleed `object-fit: cover` | `100svh`                    |
| About       | `AboutHero.astro`        | `.art-bg` full-bleed                     | `100svh`                    |
| Recruitment | `RecruitmentHero.astro`  | `.art-bg` full-bleed                     | `100svh`                    |
| Partners    | `PartnersHero.astro`     | `.art-bg` full-bleed                     | `100svh`                    |
| HoF         | `HallOfFramesHero.astro` | `.art-bg` full-bleed                     | `100svh`                    |
| Contact     | `ContactHero.astro`      | `.hero-art` fixed 801×600 di −131/−92    | **954** (bukan full-screen) |

- `src/scripts/motion.ts` + `Motion.astro` **masih aktif** (scroll reveal, tilt,
  magnetic, parallax pointer ringan, idle starfield) — hero sendiri sudah tanpa
  animasi.
- Semua hero di-render ulang secara fresh tiap `astro:page-load` (ClientRouter).

## 3. Opsi efek (brainstorm)

| Opsi | Efek                                                | Bobot         | Risiko | Catatan                                         |
| ---- | --------------------------------------------------- | ------------- | ------ | ----------------------------------------------- |
| A    | **Entrance reveal** copy (fade + rise + stagger)    | ringan        | rendah | aman, paling terasa "hidup" saat masuk          |
| B    | **Scroll parallax bg** (`translateY`/`scale` scrub) | ringan        | sedang | perlu **overscan** supaya tepi img tidak muncul |
| C    | **Pointer parallax** bg (desktop `pointer: fine`)   | ringan        | rendah | ±8px, gate min-width; tak di HP                 |
| D    | **Ken Burns idle** (zoom 1.0→1.03, alternate 18s)   | ringan        | sedang | bisa terasa "berat"/dizzy; rapi di mata         |
| E    | **Light sweep / glow drift** (pseudo overlay)       | sangat ringan | rendah | cocok tema "sorcery"; murni CSS animasi         |
| F    | **Copy parallax** saat scroll (copy naik > bg)      | ringan        | rendah | memperkuat kedalaman                            |

## 4. Rekomendasi

**Baseline (murah & aman):** **A + B + C** untuk 5 hero full-bleed:

- A: copy `.hero-content` fade/rise saat load (tunggu `ds:splash-done`, skip
  `nav-warm`) — pola ini sudah dipakai Recruitment/About dulu.
- B: `.art-bg` diberi **overscan** (mis. `inset: -6% 0; height: 112%`) lalu
  di-`yPercent`/`scale` scrub scroll. Overscan memastikan tepi tidak bocor.
- C: pointer parallax bg ±8px (desktop, `pointer: fine`, `no-preference`).

**Contact (bukan full-bleed):** jangan parallax scroll bg (art fixed di pojok,
mudah bocor). Cukup **A** (entrance copy) + **C** kecil (drift pointer ~4px pada
`.hero-art`) + opsional **E**.

**Opsional:** D (Ken Burns) atau E (sweep) sebagai satu lapis tambahan — pilih
satu, jangan semua, supaya tidak ramai.

> Butuh keputusan user pada §8.

## 5. Batasan teknis (WAJIB)

1. **Reduce = inert & pixel-exact.** `verify.mjs` + semua audit berjalan dengan
   `reducedMotion: 'reduce'`. Semua animasi di-gate
   `(prefers-reduced-motion: no-preference)`; under reduce tidak ada transform.
2. `verify.mjs` mengukur `getBoundingClientRect` → **transform tidak mengubah
   layout**, tapi pastikan elemen yang di-assert (mis. `.art-bg` Contact
   `-131/-92/801×600`) **tidak** punya transform saat reduce. Overscan B hanya
   boleh aktif di `no-preference`.
3. **Jangan `zoom`/`transform: scale` untuk membuat full-screen** (dilarang
   user). Transform hanya untuk efek.
4. **ClientRouter:** init di `astro:page-load`, cleanup
   `astro:before-swap` (`ScrollTrigger.kill`, `gsap.killTweensOf`, lepas
   listener pointer, `destroyMotion`). Perhatikan `document.fonts.ready` sebelum
   mengukur.
5. **Bundle:** `gsap` + `three` sudah ada — **jangan tambah library baru**.
6. **Mobile perf:** parallax pointer/Ken Burns hanya `≥768px` + `pointer:fine`;
   mobile cukup entrance ringan. Jalankan `npm run perf:audit` (set
   `PERF_MAX_TASK` bila perlu gagal).
7. Hero Contact: drift tidak boleh membuka celah `#050507` selain yang memang di
   Figma (art memang pojok, sisanya gelap → aman tapi tetap kecil).

## 6. Fase eksekusi (satu hero per pass + 7 gate)

Urutan: **Home → About → Recruitment → Partners → HoF → Contact**.

Per hero:

1. Master Work Plan mini (efek apa, durasi, gate).
2. Implementasi A (+B/C sesuai keputusan).
3. `verify.mjs` reduce screenshot harus **tidak berubah** (MAE 0 vs sebelumnya).
4. **7 gate** + `seo:audit`.
5. Catat di `docs/assets.md` + `docs/ai-handoff.md` + `AGENTS.md`.

## 7. Verifikasi

- **7 gate** tiap hero + `seo:audit`.
- **Reduce regression:** screenshot hero sebelum/sesudah harus identik (MAE 0).
- `npm run perf:audit` per hero (report scroll-jank); target tidak ada long task
  baru > 50ms.
- Uji 1440 + 1920 + salah satu mobile (390) + `prefers-reduced-motion`.
- Cek layar lebar: overscan tidak memunculkan tepi gambar.

## 8. Pertanyaan terbuka (brainstorm dengan user)

1. Efek mana yang mau? Usulan: **A + B (scroll parallax) + C (pointer)**, lalu
   pilih **satu** dari D/E untuk sentuhan "sorcery".
2. Intensitas: halus (sinematik) atau mencolok? Usulan: halus (±8px, zoom ≤1.03).
3. Contact diikutkan? (bukan full-bleed → efek dibatasi).
4. Ken Burns idle (D) perlu, atau cukup parallax scroll (B) saja?
5. Apakah hero harus "hidup" walau tanpa scroll (idle), atau hanya bereaksi ke
   scroll/kursor?

## 9. Progress

| Hero        | A entrance | B scroll parallax      | C pointer | Status            |
| ----------- | ---------- | ---------------------- | --------- | ----------------- |
| Home        | ✅         | ✅                     | ✅        | **SELESAI 6 Oct** |
| About       | ✅         | ✅                     | ✅        | **SELESAI 6 Oct** |
| Recruitment | ✅         | ✅                     | ✅        | **SELESAI 6 Oct** |
| Partners    | ✅         | ✅                     | ✅        | **SELESAI 6 Oct** |
| HoF         | ✅         | ✅                     | ✅        | **SELESAI 6 Oct** |
| Contact     | ✅         | n/a (bukan full-bleed) | ✅        | **SELESAI 6 Oct** |

### Catatan implementasi (6 Oct 2026)

Helper generik di `src/scripts/motion.ts`:

- `heroEntrance(content, warm, selector)` — A: fade+rise saat `splash-done`;
  di-skip saat `nav-warm` (client nav). Selector per hero: Home
  `h1 span, p, .button`, About/HoF `h1 span, p`, Recruitment (default), Partners
  `.pill, h1 span`, Contact `.hero-intro, .hero-cards, .contact-form`.
- `heroArtworkParallax(hero, art, pointer, cleanups, opts)` — B + C:
  - Transform dipasang di **`img` artwork** (bukan `.artwork`) supaya
    `transform: translateX(-50%)` milik `.artwork` di `@media (min-width:1921px)`
    tidak tertimpa.
  - B memakai **`y` (px, −18 → +18, scrub)**; C memakai **`xPercent`/`yPercent`**
    — komponen transform berbeda, jadi GSAP mengomposisi tanpa saling berebut.
  - `scale: 1.08` (Contact `1.05`) = overscan agar travel tidak membuka tepi.
  - Opsi `{ scroll, scale, travel, pointerX, pointerY }`; Contact pakai
    `{ scroll: false, scale: 1.05, pointerX: 1.6, pointerY: 1 }` (artwork memang
    pojok di Figma, jadi tidak boleh parallax scroll).
  - Gated `if (reduce) return;` → render reduce tanpa transform → semua
    assertion geometri + MAE `verify.mjs` **tidak berubah**.
- Verifikasi cakupan: keenam hero diuji di 1440 (top + mid-scroll) — `.art-bg`
  full-bleed selalu menutupi hero (mis. hero 0..903 vs art −58..1498 / −54..921);
  Contact tidak full-bleed (memang desainnya). **7 gate + seo ALL PASS.**
