# SOP — Sound system (Data Sorcerers)

Sound di situs ini **100% prosedural (Web Audio API)**: tidak ada file audio yang
diunduh, tidak ada dependency baru, tidak ada isu copyright/atribusi. Semua cue
disintesis saat dipanggil. Dokumen ini acuan kalau nambah/mengubah bunyi.

- Owner fitur: commit `66b284e` (`feat: add procedural arcane sound system`).
- Status: Fase 0 (engine + orb) + Fase 1 (wiring komponen) + Fase 2
  (page-transition cue) + Fase 3 (ambient) **selesai**.

---

## 1. File & tanggung jawab

| File                         | Peran                                                                                                                         |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `src/scripts/sound.ts`       | Engine. Singleton `sound` (default export). Semua sintesis + cue + ambient.                                                   |
| `src/components/Sound.astro` | Orb mute melayang + delegated wiring + persistensi. Di-mount **sekali** di `src/layouts/BaseLayout.astro` (semua rute dapat). |
| `src/pages/lab/sound.astro`  | Halaman audisi 7 cue (`noindex`, di-exclude dari sitemap).                                                                    |
| `scripts/verify.mjs`         | Hide `.sound-toggle` via `addInitScript` + masuk `setNavbarHidden`.                                                           |

## 2. Palet cue

| Cue          | Dipakai untuk                                                  | Karakter                                   |
| ------------ | -------------------------------------------------------------- | ------------------------------------------ |
| `hover`      | hover link/kartu/tombol                                        | tick kaca 1.56 kHz + sparkle tipis         |
| `click`      | tombol/kartu/dot                                               | pluck arcane 430 Hz + bell partials        |
| `select`     | nav, tab, panah carousel (termasuk panah keyboard), orb unmute | pluck lebih terang 620/1710 Hz             |
| `transition` | navigasi internal (klik link)                                  | seal whoosh naik 0.28 s + pluck 392→660 Hz |
| `open`       | menu buka, kartu role, FAQ buka                                | whoosh naik + riser + shimmer              |
| `close`      | menu tutup, FAQ tutup                                          | whoosh turun + nada turun                  |
| `success`    | splash selesai, apply                                          | arpeggio Cmaj7 + sparkle + shimmer         |
| `error`      | tombol `aria-disabled`, invalid                                | thud 233→155 Hz (tanpa sparkle)            |

Magic layer: tiap cue ditambah **bell partials inharmonik** (ratio `2.0 / 3.01 /
4.24 / 5.43`, detune ±7 cent, pan kiri/kanan) lewat `sparkle()`, dan `open`/
`success` dapat **shimmer** (noise high band-pass 5.2→9.8 kHz). Reverb prosedural
1.5 s (high-pass 300 Hz, wet 0.24) memberi ekor "katedral".

## 3. Arsitektur engine (`sound.ts`)

- `ensure()` — bikin `AudioContext` + `master` gain (`MASTER_GAIN = 0.75`) +
  `DynamicsCompressor` (limiter: threshold −12, ratio 4) sekali, lazily.
  `ctx.onstatechange` memanggil `syncAmbient()`.
- `unlock()` — resume context dari gesture; juga memicu ambient.
- `play(cue)` — no-op kalau muted / context belum `running`. `case 'transition'`
  = whoosh 0.28 s + pluck 392→660 Hz + sub 196→240 Hz + sparkle. Karena situs
  pakai View Transitions (dokumen tidak unload), cue ini main **penuh** tanpa
  menunda navigasi.
- `isReady` (getter) — `!muted && ctx && ctx.state === 'running'`. Tidak lagi
  dipakai untuk menunda navigasi; disisakan sebagai utilitas cek state.
- `note(opts)` — satu oscillator + envelope eksponensial. Opsi: `freq`, `type`,
  `attack` (def 0.005), `decay` (def 0.15), `gain` (def 0.1), `sweepTo`, `delay`,
  `detune`, `pan`, `send` (reverb send, def 0.5).
- `sparkle(base, peak, delay)` — 4 partial inharmonik.
- `shimmer(peak, delay)` — burst noise high band-pass.
- `whoosh(dir, duration = 0.42)` — band-pass noise sweep 420↔2400 Hz.
- `buildReverb()` — impulse response digenerate runtime (gaun), high-pass → wet →
  master.
- Ambient: `buildAmbient()` (4 sine detuned A2/E3/A3/E4 + noise low-pass, LFO
  napas 0.05 Hz & sweep cutoff 0.03 Hz, reverb send 0.5) + `syncAmbient()`
  (fade `setTargetAtTime` 1.2 s), target `AMBIENT_GAIN = 0.28`. `setAmbientAllowed
(bool)` buat mematikan ambient tanpa mematikan cue.

## 4. Cara pakai — wire komponen baru

1. **Cue klik sederhana:** tambah `data-sfx="click|select|open|success|error"`
   ke elemen. Delegated listener di `Sound.astro` yang main.
2. **Cue hover:** tambah `data-sfx-hover="hover"` (atau cue lain). Hanya jalan di
   perangkat `(hover: hover)`.
3. **Cue stateful (buka/tutup, dsb.):** kirim event dari script komponen:
   ```ts
   window.dispatchEvent(new CustomEvent('ds:sfx', { detail: { cue: 'open' } }));
   ```
   Dipakai di: Navbar (menu mobile `open`/`close`), Faq (`open`/`close`),
   HoDSDetail (tab `select`), Splash (`success`), DomainRail/Projects/Snippets
   (panah keyboard → `select`, karena input keyboard tidak lewat wiring
   hover/click).
4. **Jangan** pasang handler `play()` langsung di komponen — biar gate reduced
   motion & mute tetap terpusat di `Sound.astro`.
5. **Audisi:** buka `/lab/sound` (dev: http://localhost:4321/lab/sound/).

### Peta wiring saat ini

Button (semua varian), Navbar (brand, nav-link, hamburger; disabled → `error`),
DomainCard & rail arrow, AvailableRoles, Projects (arrow `select`, dot `click`),
Snippets (arrow `select`, thumb `click`), FAQ (summary + dispatch), tab
HoDSDetail, back link Role/HoDS, Footer (nav + tel/mailto), Splash finish.

**Page-transition (Fase 2) otomatis**: delegated `click` di `Sound.astro` mencocokkan
`<a href>` **same-origin** lalu main `transition`. Situs kini memakai Astro
**ClientRouter / View Transitions** (`<ClientRouter />` di `BaseLayout`), jadi
dokumen & `AudioContext` **tetap hidup** antar halaman: cue selesai penuh dan
ambient tidak putus, tanpa menunda navigasi. Supaya tidak dobel, jalur ini
**menggantikan** cue `data-sfx` link tersebut (bukan menambah). Kualifikasi:
klik kiri tanpa modifier, `event.detail > 0` (pointer-only), bukan
`target`/`download`, bukan `tel:`/`mailto:`, bukan hash same-page, dan bukan link
ke URL saat ini. Jangan cek `event.defaultPrevented` — ClientRouter sendiri
mem-preventDefault klik untuk navigasi klien. Saat reduce, wiring tidak dipasang
sama sekali.

Konsekuensi ClientRouter: script komponen **tidak** dijalankan ulang saat swap,
jadi tiap komponen yang menyentuh DOM harus re-init lewat `astro:page-load` dan
membersihkan listener global/observer/GSAP (lihat §9).

## 5. Aturan wajib

- **0 dependency & 0 aset audio.** Jangan tambah Howler/Tone.js atau file .mp3
  tanpa izin.
- **Reduced motion:** `Sound.astro` memanggil `setAmbientAllowed(false)` dan
  tidak memasang wiring apa pun saat `prefers-reduced-motion: reduce`. Jaga ini —
  `verify.mjs`/`responsive-audit.mjs` jalan di reduce dan harus tetap senyap +
  `browserErrors: []`.
- **Autoplay:** cue baru bunyi setelah gesture pertama (unlock). Jangan coba
  bypass.
- **Page-transition:** hanya pointer (`event.detail > 0`) — keyboard/modifier/
  `target`/`download`/`tel:`/`mailto:`/hash same-page/link URL saat ini harus
  lolos tanpa intercept. Jangan pernah menunda navigasi (ClientRouter sudah
  menanganinya) dan jangan cek `defaultPrevented`. Cue `transition` menggantikan
  cue `data-sfx` link itu (jangan sampai dobel).
- **Persistensi:** pref mute di `localStorage['ds:sound']` (`'off'`/`'on'`),
  default **on**.
- **Overlay orb bukan bagian PNG referensi** → sudah di-hide di `verify.mjs`
  (`addInitScript` `.sound-toggle{visibility:hidden!important}` + daftar
  `setNavbarHidden`). Kalau ganti selektor orb, update keduanya.
- **`/lab/` di-exclude dari sitemap** (`astro.config.mjs`:
  `sitemap({ filter: (page) => !page.includes('/lab/') })`) supaya `seo:audit`
  tetap melihat **14 URL**. Jangan hapus filter itu.

## 6. Tuning cepat

| Mau apa                 | Ubah di `sound.ts`                                                  |
| ----------------------- | ------------------------------------------------------------------- |
| Semua lebih keras/pelan | `MASTER_GAIN`                                                       |
| Ambient terlalu rame    | `AMBIENT_GAIN` (dan gain noise 0.08 / voice amps di `buildAmbient`) |
| Hover terlalu berisik   | gain `hover` di `play()`                                            |
| Sparkle terlalu manis   | peak di `this.sparkle(...)` per cue                                 |
| Reverb terlalu panjang  | durasi & `wet.gain` di `buildReverb()`                              |
| Chord ambient           | array `voices` di `buildAmbient()`                                  |

## 7. Verifikasi

Sebelum commit, semua harus exit 0:

```sh
npm run format:check && npm run build
PREVIEW_URL=http://localhost:4333 node scripts/verify.mjs
PREVIEW_URL=http://localhost:4333 node scripts/responsive-audit.mjs
```

Sound tidak mengubah piksel, jadi diff tetap bersih selama orb ter-hide.
Kalau ragu, smoke test headless: klik tiap `[data-cue]` di `/lab/sound` dan
pastikan `pageerror` kosong.

Untuk page-transition + View Transitions, jalankan **`npm run verify:vt`**
(`scripts/verify-vt.mjs`, sudah di-commit; butuh preview jalan). Skrip ini menekan
klik link asli (navigasi klien) dan mengecek:

- konteks JS & `AudioContext` persist (tanpa reload), `splash-done`/`nav-warm`
  tetap ada setelah swap;
- komponen re-init (FAQ, Snippets, DomainRail, Navbar) dan deep-link `#domains`
  mendarat di `top ≈ 110`;
- browser Back/Forward lewat client router (konteks tetap), dan **reload** pada
  deep-link `/#domains` tetap mendarat di `top ≈ 110`;
- saat reduce: tidak ada `hero-ready` maupun `.pin-spacer` (motion benar-benar
  inert) di home maupun recruitment;
- tepat **satu** cue `transition` per link internal (kartu role `data-sfx="open"`
  tidak dobel), modifier tidak di-intercept (tetap `select`), reduce tetap jalan.

Instrumentasi memakai binding Node `exposeFunction` (`window.__dsRecordCue`),
karena global hilang saat dokumen penuh berganti.

## 8. Gotcha

- **Motion mati di dev (`504 Outdated Optimize Dep`).** Kalau GSAP/Three gagal
  load dan semua animasi hilang, itu cache Vite basi, **bukan** kode. Fix:
  `npx astro dev stop && rm -rf node_modules/.vite && npx astro dev`, lalu hard
  refresh. Preview/`dist` normal.
- **Jangan tambahkan cue per-frame** (mis. pointermove) — bikin berisik & mahal.
- **Jangan animasikan audio via JS loop**; semua lewat Web Audio scheduling.
- Splash `success` hanya terdengar kalau user sudah berinteraksi sebelum splash
  tutup (batasan autoplay browser).
- **Page-transition cue bisa tak terdengar pada interaksi pertama.** AudioContext
  belum `running` sampai gesture pertama (autoplay). Setelah itu context tetap
  hidup (View Transitions), jadi cue `transition` main penuh.
- **Smoke test: baca state setelah navigasi klien dengan hati-hati** — dengan
  `page.goto` penuh, dokumen baru menghapus global itu. Kirim cue ke Node via
  `page.exposeFunction` dan pakai token di `window` untuk membuktikan konteks JS
  tidak reload — lihat `scripts/verify-vt.mjs`.

## 9. View Transitions (ClientRouter) — aturan migrasi

Situs memakai `import { ClientRouter } from 'astro:transitions'` di
`BaseLayout.astro`. Astro **tidak** menjalankan ulang script bundled saat swap
(lihat `deselectScripts` di runtime-nya), jadi:

- **Init komponen per halaman** lewat `document.addEventListener('astro:page-load', init)`.
  `astro:page-load` jalan di load pertama **dan** tiap navigasi klien.
- **Listener `window`/`document`/`matchMedia`/observer/GSAP** harus dibersihkan
  tiap navigasi: pakai `AbortController` (`{ signal }`) untuk listener, dan
  simpan cleanup observer/timer. `motion.ts` menyediakan `destroyMotion()` yang
  dipanggil di `astro:before-swap`; `astro:page-load` membangun ulang.
- **Particle Three.js**: `mountHeroParticles()` mengembalikan `dispose()`;
  `Hero`/`RecruitmentHero` memanggilnya di `astro:before-swap` (biar WebGL context
  & listener tidak bocor). Init dijaga identity element (`hero !== currentHero`).
- **Class runtime di `<html>`** (`splash-done`, `nav-warm`) **hilang** saat swap
  karena router menimpa atribut root — `BaseLayout` me-re-apply-nya di
  `astro:after-swap`.
- **Hash/deep-link**: `BaseLayout` juga re-apply `location.hash` di
  `astro:page-load` (pin spacer hero dipasang setelah swap).
- **Sound** justru memanfaatkan ini: `AudioContext` persist → ambient & cue tidak
  putus. Orb di-rebind per `astro:page-load`; wiring delegated cukup sekali
  (guard `window.__dsSoundWired`).

Editor `verify.mjs`/`responsive-audit.mjs` memakai `page.goto` (full load) jadi
tidak menghukum, tapi uji navigasi klien perlu **`npm run verify:vt`**
(`scripts/verify-vt.mjs`).

## 10. Porting ke project lain (reuse)

Sistem bunyi ini **dirancang untuk dipakai ulang**: Web Audio prosedural, **0
dependency, 0 file audio**, semua disintesis saat runtime.

**File yang dipakai:**

| File                         | Wajib?   | Isi                                                                |
| ---------------------------- | -------- | ------------------------------------------------------------------ |
| `src/scripts/sound.ts`       | ya       | Engine (singleton `sound`). **Tanpa `import` apa pun** → portable. |
| `src/components/Sound.astro` | ya       | Orb mute + wiring delegated + persistensi.                         |
| `src/pages/lab/sound.astro`  | opsional | Halaman audisi semua cue (`noindex`).                              |

`sound.ts` benar-benar standalone, jadi bisa dicopy ke project
vanilla/React/Vue/Svelte tanpa perubahan. `Sound.astro` cuma wrapper (markup orb

- `<style>` + `<script>`); padanannya bisa dipindah ke HTML/JS biasa.

**Langkah minimal (Astro):**

1. Copy `src/scripts/sound.ts` + `src/components/Sound.astro`.
2. Mount `<Sound />` **sekali** di layout root (mis. setelah `<slot />`).
3. (Opsional) copy `src/pages/lab/sound.astro` untuk audisi cue.
4. Wire elemen: `data-sfx="select"` (klik), `data-sfx-hover="hover"` (hover), atau
   dispatch event stateful:
   `window.dispatchEvent(new CustomEvent('ds:sfx', { detail: { cue: 'open' } }))`.
5. Selesai — orb muncul kanan-bawah, pref mute disimpan di
   `localStorage['ds:sound']` (default **on**).

**Non-Astro:** tempel markup orb dari `Sound.astro` ke HTML, bundle `sound.ts`,
lalu pasang wiring sederhana (§4). Gate reduced-motion + autoplay tetap sama.

**Yang disesuaikan per project:**

- `MASTER_GAIN` (0.75) & `AMBIENT_GAIN` (0.28) — level keseluruhan.
- Resep cue di `play()` kalau mau warna bunyi berbeda.
- `KEY = 'ds:sound'` kalau storage bentrok.
- Cue `transition` + helper `internalLink` di `Sound.astro` khusus navigasi
  internal; **buang** kalau project bukan multi-halaman / tak pakai ClientRouter.
- Selector orb `.sound-toggle` → update hide-list di `verify` kalau perlu.

**Kontrak wajib saat reuse:**

- **0 dependency & 0 aset audio** — jangan tambah Howler/Tone/.mp3.
- Reduced motion → `setAmbientAllowed(false)` + **jangan** pasang wiring apa pun.
- Autoplay: bunyi baru keluar setelah gesture pertama (`unlock()`).
- **Jangan** panggil `sound.play()` langsung dari komponen — lewat wiring terpusat.

## 11. Menambah / mengubah cue

1. Tambah id ke union `Cue` di `src/scripts/sound.ts`.
2. Tambah `case` di `play()` — resep = kombinasi `note()` / `sparkle()` /
   `shimmer()` / `whoosh()`. Contoh karakter tiap cue ada di §2.
3. (Opsional) daftarkan di array `cues` `/lab/sound.astro` supaya bisa diaudisi.
4. Cek: klik tiap `[data-cue]` di `/lab/sound` — `pageerror` harus kosong.

**Cheatsheet knob:** `MASTER_GAIN`, `AMBIENT_GAIN`, gain per-cue di `play()`,
peak `sparkle()`, durasi & `wet.gain` di `buildReverb()`, array `voices` di
`buildAmbient()`. Semua di `src/scripts/sound.ts`.
