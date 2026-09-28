# SOP — Sound system (Data Sorcerers)

Sound di situs ini **100% prosedural (Web Audio API)**: tidak ada file audio yang
diunduh, tidak ada dependency baru, tidak ada isu copyright/atribusi. Semua cue
disintesis saat dipanggil. Dokumen ini acuan kalau nambah/mengubah bunyi.

- Owner fitur: commit `66b284e` (`feat: add procedural arcane sound system`).
- Status: Fase 0 (engine + orb) + Fase 1 (wiring komponen) + Fase 3 (ambient)
  **selesai**. Fase 2 (page-transition) belum, opsional.

---

## 1. File & tanggung jawab

| File                         | Peran                                                                                                                         |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `src/scripts/sound.ts`       | Engine. Singleton `sound` (default export). Semua sintesis + cue + ambient.                                                   |
| `src/components/Sound.astro` | Orb mute melayang + delegated wiring + persistensi. Di-mount **sekali** di `src/layouts/BaseLayout.astro` (semua rute dapat). |
| `src/pages/lab/sound.astro`  | Halaman audisi 7 cue (`noindex`, di-exclude dari sitemap).                                                                    |
| `scripts/verify.mjs`         | Hide `.sound-toggle` via `addInitScript` + masuk `setNavbarHidden`.                                                           |

## 2. Palet cue

| Cue       | Dipakai untuk                        | Karakter                            |
| --------- | ------------------------------------ | ----------------------------------- |
| `hover`   | hover link/kartu/tombol              | tick kaca 1.56 kHz + sparkle tipis  |
| `click`   | tombol/kartu/dot                     | pluck arcane 430 Hz + bell partials |
| `select`  | nav, tab, panah carousel, orb unmute | pluck lebih terang 620/1710 Hz      |
| `open`    | menu buka, kartu role, FAQ buka      | whoosh naik + riser + shimmer       |
| `close`   | menu tutup, FAQ tutup                | whoosh turun + nada turun           |
| `success` | splash selesai, apply                | arpeggio Cmaj7 + sparkle + shimmer  |
| `error`   | tombol `aria-disabled`, invalid      | thud 233→155 Hz (tanpa sparkle)     |

Magic layer: tiap cue ditambah **bell partials inharmonik** (ratio `2.0 / 3.01 /
4.24 / 5.43`, detune ±7 cent, pan kiri/kanan) lewat `sparkle()`, dan `open`/
`success` dapat **shimmer** (noise high band-pass 5.2→9.8 kHz). Reverb prosedural
1.5 s (high-pass 300 Hz, wet 0.24) memberi ekor "katedral".

## 3. Arsitektur engine (`sound.ts`)

- `ensure()` — bikin `AudioContext` + `master` gain (`MASTER_GAIN = 0.75`) +
  `DynamicsCompressor` (limiter: threshold −12, ratio 4) sekali, lazily.
  `ctx.onstatechange` memanggil `syncAmbient()`.
- `unlock()` — resume context dari gesture; juga memicu ambient.
- `play(cue)` — no-op kalau muted / context belum `running`.
- `note(opts)` — satu oscillator + envelope eksponensial. Opsi: `freq`, `type`,
  `attack` (def 0.005), `decay` (def 0.15), `gain` (def 0.1), `sweepTo`, `delay`,
  `detune`, `pan`, `send` (reverb send, def 0.5).
- `sparkle(base, peak, delay)` — 4 partial inharmonik.
- `shimmer(peak, delay)` — burst noise high band-pass.
- `whoosh(dir)` — band-pass noise sweep 420↔2400 Hz, 0.42 s.
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
   HoDSDetail (tab `select`), Splash (`success`).
4. **Jangan** pasang handler `play()` langsung di komponen — biar gate reduced
   motion & mute tetap terpusat di `Sound.astro`.
5. **Audisi:** buka `/lab/sound` (dev: http://localhost:4321/lab/sound/).

### Peta wiring saat ini

Button (semua varian), Navbar (brand, nav-link, hamburger; disabled → `error`),
DomainCard & rail arrow, AvailableRoles, Projects (arrow `select`, dot `click`),
Snippets (arrow `select`, thumb `click`), FAQ (summary + dispatch), tab
HoDSDetail, back link Role/HoDS, Footer (nav + tel/mailto), Splash finish.

## 5. Aturan wajib

- **0 dependency & 0 aset audio.** Jangan tambah Howler/Tone.js atau file .mp3
  tanpa izin.
- **Reduced motion:** `Sound.astro` memanggil `setAmbientAllowed(false)` dan
  tidak memasang wiring apa pun saat `prefers-reduced-motion: reduce`. Jaga ini —
  `verify.mjs`/`responsive-audit.mjs` jalan di reduce dan harus tetap senyap +
  `browserErrors: []`.
- **Autoplay:** cue baru bunyi setelah gesture pertama (unlock). Jangan coba
  bypass.
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

## 8. Gotcha

- **Motion mati di dev (`504 Outdated Optimize Dep`).** Kalau GSAP/Three gagal
  load dan semua animasi hilang, itu cache Vite basi, **bukan** kode. Fix:
  `npx astro dev stop && rm -rf node_modules/.vite && npx astro dev`, lalu hard
  refresh. Preview/`dist` normal.
- **Jangan tambahkan cue per-frame** (mis. pointermove) — bikin berisik & mahal.
- **Jangan animasikan audio via JS loop**; semua lewat Web Audio scheduling.
- Splash `success` hanya terdengar kalau user sudah berinteraksi sebelum splash
  tutup (batasan autoplay browser).
