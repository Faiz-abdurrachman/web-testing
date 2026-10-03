# Hero Video Plan — semua halaman (3 Oct 2026)

Dokumen ini adalah **Master Work Plan** untuk mengubah semua hero section jadi
**background video looping** (dengan fallback gambar statis). Dibuat supaya AI
baru bisa langsung mengerjakan **satu hero per pass** tanpa menebak.

Baca bareng: `AGENTS.md`, `docs/pixel-precision-sop.md` (§Video hero),
`docs/ai-handoff.md`, `docs/assets.md`.

---

## 0. Prinsip (HUKUM)

1. **Presisi piksel statis TIDAK BOLEH berubah.** Video hanya lapisan
   `position:absolute` di dalam `.artwork`; ia **tidak menambah/mengurangi tinggi,
   padding, gap, atau posisi** apa pun. Geometri `verify.mjs` dan reference PNG
   (di-capture dalam `reduce`) harus tetap **MAE sama persis**.
2. **Kualitas video tidak boleh burik.** Encode AV1 (webm) + H.264 (mp4) dengan
   budget & setting di §3; cek frame 1:1 (frame 0, tengah, seam) sebelum lanjut.
3. **Fallback statis adalah sumber kebenaran visual.** Under
   `prefers-reduced-motion: reduce` dan **≤600px**, video TIDAK di-load/play —
   gambar statis yang tampil (persis seperti sekarang).
4. **Satu hero = satu pass + 7 gate.** Jangan gabung 2 hero dalam satu commit.
5. **Master Work Plan per section sebelum sentuh kode** (8pt, font, warna, geometri).

---

## 1. Status aset per halaman

| #   | Halaman        | Hero node   | Komponen                 | Background sekarang | Video                                                                                                           | Status aset |
| --- | -------------- | ----------- | ------------------------ | ------------------- | --------------------------------------------------------------------------------------------------------------- | ----------- |
| 1   | Home           | `1430:2041` | `Hero.astro`             | plate webp + video  | `assets/assets home page/hero section/hero.mp4` (1280×720,10s)                                                  | **DONE**    |
| 2   | Recruitment    | `1436:3506` | `RecruitmentHero.astro`  | image + video       | `assets/assets recruitment page/hero section/recruitment-hero1.mp4` (1920×1080,10s)                             | **DONE**    |
| 3   | About Us       | `1439:4185` | `AboutHero.astro`        | webp + video        | `assets/assets about us/hero/Animating_sorcerer_image_ambient…_1080p_20261003164943.mp4` (1920×1080,8s,4.8Mbps) | **DONE**    |
| 4   | Hall of Frames | `1439:4507` | `HallOfFramesHero.astro` | webp + video        | `assets/hall of frames/hero/Sealed_arcane_door_ambient_anima…_20261003171201.mp4` (1920×1080,8s,2.3Mbps)        | **DONE**    |
| 5   | Partners       | `1439:4788` | `PartnersHero.astro`     | webp saja           | `assets/partners/hero/Arcane_hands_establishing_magica…_1080p_20261003172522.mp4` (1920×1080,8s,2.6Mbps)        | **SIAP**    |
| 6   | Contact        | `1445:5066` | `ContactHero.astro`      | webp + artwork      | —                                                                                                               | **PENDING** |

Catatan: `assets/assets recruitment page/hero section/Animating_static_planetary_space…_1080p_20261003170119.mp4`
(1920×1080, 10s) = kandidat alternatif untuk Recruitment (belum dipakai).

Nama file sumber memakai karakter unicode `…` — **selalu quote** path-nya di
shell/ffmpeg.

---

## 2. Arsitektur (hindari duplikasi 6×)

Saat ini logika video diduplikasi di `Hero.astro` + `RecruitmentHero.astro`.
Untuk 4 hero baru, **ekstrak satu implementasi bersama**:

- `src/components/HeroVideo.astro` — render:
  ```html
  <video
    class="art-video"
    muted
    loop
    playsinline
    preload="none"
    aria-hidden="true"
  >
    <source src="{webm}" type="video/webm" />
    <source src="{mp4}" type="video/mp4" />
  </video>
  ```
  Props: `{ webm, mp4, poster, class? }`. `poster` **tidak** di-set di markup
  (di-attach JS saat benar-benar akan load) supaya HP/reduce tidak ikut fetch.
- `src/scripts/hero-video.ts` — `mountHeroVideo(video, opts)`:
  - gate: `matchMedia('(prefers-reduced-motion: no-preference)')` **dan**
    `matchMedia('(min-width: 601px)')`;
  - attach `poster`, `preload='auto'`, `video.load()`, `play()`;
  - `IntersectionObserver` → pause saat off-screen; `visibilitychange` → pause hidden;
  - `preload` promise opsional (tunggu `ds:splash-done` / `document.fonts.ready`);
  - return `dispose()` untuk cleanup `astro:before-swap`.
- CSS pola (sudah terbukti di Home/Recruitment):
  ```css
  .artwork :is(img, video) {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .art-video {
    opacity: 0;
  }
  @media (prefers-reduced-motion: no-preference) and (min-width: 601px) {
    .art-video {
      opacity: 1;
    }
  }
  ```

**Refactor Home + Recruitment** ke komponen/helper yang sama dalam pass-nya
masing-masing, dan buktikan `verify.mjs` reduce MAE **tidak berubah** (0 regresi).

---

## 3. Aturan encoding (anti-burik + budget)

Script generator: **satu config-driven** `scripts/generate-hero-videos.mjs`
(entri per halaman) — atau lanjutkan pola `generate-*-hero-video.mjs` yang ada.
Entri minimal: `{ page, src, outDir, w, h, loop, crfAv1, crfX264 }`.

- **Format & codec**
  - `hero-bg.webm` = `libsvtav1` crf **43**, preset 8, `yuv420p` (Chrome/Edge, listed first).
  - `hero-bg.mp4` = `libx264` crf **28–30**, preset slow, `yuv420p`, `-movflags +faststart` (Safari).
  - `hero-poster.webp` = frame 0, `libwebp -quality 82`.
  - **Tanpa audio** (`-an`).
- **Resolusi**: encode ≥ **1920×1080**. Untuk hero yang di-pin/zoom di `motion.ts`
  (Home & Recruitment) pakai **2560×1440** supaya tetap tajam saat `scale` 1.35 di
  retina. Hero statis (About/HoF/Partners/Contact) minimal 1920×1080; naikkan ke
  2560×1440 hanya bila terlihat soft.
- **Loop**: sumber 8–10s umumnya belum seamless. Deteksi delta frame 0 vs terakhir:
  - motion terarah (build-up) → **circular crossfade** (tail XFADE 1s dissolve ke
    body), output = `LOOP_LEN - XFADE`.
  - motion ambigu → **ping-pong** (reverse+concat).
  - Uji: tidak boleh ada lompatan terlihat setelah 1 loop.
- **Ketajaman**: `unsharp=5:5:0.5:5:5:0.0` (counter softening encoder).
- **Budget** (Perf — mobile load-bearing):
  - webm ≤ **~0.9 MB**, mp4 ≤ **~1.1 MB** per hero (naikkan hanya jika terbukti
    perlu; ukur SSIM vs near-lossless ≥ ~0.99).
  - halaman pertama kali load hanya fetch **satu** video (webm ATAU mp4).

---

## 4. Geometri & presisi (wajib tetap exact)

Video = `aria-hidden`, `z-index:-1`, `object-fit:cover`, di dalam `.artwork`.
**Tidak mengubah** nilai berikut:

- **About Us** `1439:4185`: `min-height:903`, `padding:80`, content gap `16`,
  h1 Bluu Next 700 **80/95.2** `ls -0.88`, subtitle Manrope 500 18/27 max 680.
- **Hall of Frames** `1439:4507`: `min-height:903`, `padding:0 var(--page-gutter)`,
  content gap `24`, h1 **80/102**, subtitle 758.
- **Partners** `1439:4788`: `min-height:659`, `padding:242px 80px 160px`, gap `8`,
  pill 228×26, h1 **80/102** (satu gradient blok).
- **Contact** `1445:5066`: `min-height:954`, `padding:240px 80px 120px`, gap `160`.
- **Recruitment** `1436:3506`: `min-height:866`, `padding:0 80px`, content 1280×310
  center, h1 **72/86**.
- **Home** `1430:2041`: `min-height:903`, `padding:80`, h1 Bluu Next 700 **72/86**.

`verify.mjs` meng-capture dengan `reducedMotion:'reduce'` → video tak terlihat →
**reference PNG & MAE harus sama**. Tambah assertion: `.art-video` **tidak** tampil
di reduce (mis. `opacity:0` / `display:none`), dan `<img>` fallback ada.

---

## 5. Spesifikasi per hero (satu pass masing-masing)

Untuk **setiap** hero tulis Master Work Plan lalu eksekusi:

1. Export node Figma (`figma_get_figma_data` + `figma_download_figma_images`),
   pastikan reference PNG tersimpan **tidak stale** (MAE 0 vs node terbaru).
2. Tulis generator video (encode webm+mp4+poster) → cek frame 0/4s 1:1 (tidak burik).
3. Tambah `<HeroVideo>` ke markup hero (di dalam `.artwork`, sebelum/sesudah
   `<picture>`), jangan ubah geometri.
4. `hero-video.ts` mount + cleanup `astro:before-swap`.
5. Cek reduce (statis) & ≤600px (statis) — video tidak load.
6. 7 gate + seo; update `docs/assets.md` (provenance video) + docs lain.
7. Commit per hero (`feat(hero-video): ...`).

### Urutan rollout (1 pass/hero)

1. **About Us** (`1439:4185`) — DONE. Output `public/images/about/hero-bg.{webm,mp4}` + `hero-poster.webp`.
2. **Hall of Frames** (`1439:4507`) — DONE. Output `public/images/hof/hero-bg.{webm,mp4}` + poster.
3. **Partners** (`1439:4788`) — aset siap (video gelap: pastikan heading tetap
   terbaca; scrim hanya bila perlu & **jangan ubah MAE statis**). Output
   `public/images/partners/hero-bg.{webm,mp4}` + poster.
4. **Contact** (`1445:5066`) — **tunggu aset** dari user.
5. **Recruitment** (`1436:3506`) — sudah ada video; opsional evaluasi
   `Animating_static_planetary…` sebagai pengganti `recruitment-hero1.mp4`. Jangan
   ganti kalau tidak lebih baik.
6. **Home** (`1430:2041`) — sudah ada video; **tidak diubah**.

---

## 6. Verifikasi (gates) — sama seperti section biasa

1. `npm run build` → 0 error, 19 halaman.
2. `PREVIEW_URL=http://localhost:4331 node scripts/verify.mjs` → exit 0, `browserErrors []`.
3. `node scripts/navbar-audit.mjs` → ALL PASS.
4. `node scripts/verify-vt.mjs` → ALL PASS.
5. `node scripts/responsive-audit.mjs` → 468/468.
6. `npm run audit:spacing` → PASS.
7. `npm run format:check` → PASS.
   - `npm run seo:audit` → PASS. (+ `npm run perf:audit` untuk jaga jank.)

Manual: loop mulus (tanpa seam), tidak ada flash saat video mulai (poster = frame 0),
off-screen pause jalan, HP/reduce tetap gambar statis.

---

## 7. Larangan / gotchas

- **Jangan** flatten video jadi screenshot; video = `<video>`, teks tetap HTML.
- **Jangan** set `poster`/`autoplay` di markup (bikin HP/reduce fetch). Attach via JS.
- **Jangan** `preload="auto"` di markup; mulai `none`, ubah saat akan load.
- **Jangan** ubah padding/gap/font/warna hero saat menambah video.
- **Jangan** commit aset video mentah yang tidak dipakai; simpan yang dipakai saja.
- **Jangan** lupa cleanup (`AbortController`/`dispose`) untuk View Transitions.
- Encoding: jangan pakai crf < 28 (x264) / < 43 (AV1) tanpa cek budget — bisa naikkan
  ukuran tanpa manfaat terlihat.
