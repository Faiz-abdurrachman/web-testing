# Master Work Plan — Hall of Frames "Featured Sorcerers" card & detail modal

Status: **RENCANA (belum dieksekusi)** · dibuat 6 Oct 2026 ·
Patuhi `docs/pixel-precision-sop.md` + `AGENTS.md`. **Satu langkah per pass + 7
gate.** Jangan rusak benchmark (grid `hofFeatured` MAE, responsive 468, geometri
modal di `verify.mjs`).

- Halaman: `/hall-of-frames` (Figma page `1439:4506`, file `JYUzJK1hFqaEwL6DpdDvjp`).
- Section: **Featured Sorcerers `1439:4512`** (1440×1241).
- Modal: **`1554:2824`** (panel `1554:2897` 997×576, padding 88/80, gap 64).
- Komponen: **`src/components/HallOfFramesFeatured.astro`** (tunggal, termasuk
  modal + JS-nya).

## 0. Permintaan user

1. **Mobile**: modal detail **tidak rapi / kartu kepotong** ("kayak kepotong gitu
   detail cardnya"); mobile harus lebih rapi & terstruktur.
2. **Desktop**: portrait di modal **beda dari kartu di grid** — terasa "memadat";
   harus seperti yang di-display (portrait **melebar ke atas / bleed**).

## 1. Diagnosis (terukur 6 Oct 2026)

### Bug A — varian kartu hilang di modal (desktop "memadat")

- Grid: kandidat leader (Marchel) = kartu `.featured-card.is-lead` dengan
  `.card-photo` **302×532, `top: -132px`** (`.is-lead` = `top:-43.71cqw`,
  `height:176.16cqw`). Kartu non-lead = **302×442, `top: -42px`**
  (`top:-13.91cqw`, `height:146.36cqw`) — `HallOfFramesFeatured.astro:266-279`.
- JS `open()` (`:756-784`) meng-clone **hanya `clone.childNodes`** ke
  `.fd-card` (`:762-764`):
  ```js
  const clone = article.cloneNode(true);
  clone.querySelectorAll('.card-open').forEach((el) => el.remove());
  cardSlot.replaceChildren(...clone.childNodes); // ← class is-lead ikut hilang
  ```
- **Terukur:** `.fd-card` className = `"featured-card fd-card"` (tanpa `is-lead`)
  vs grid `"featured-card is-lead"`; photo modal **302×442 top −42** vs grid
  **302×532 top −132**. Jadi leader tampil "memadat" di modal. Menambah
  `is-lead` mengembalikan ke 302×532 top −132 (terbukti).

### Bug B — bleed terpotong di mobile

- `@media (max-width:1080px)` `.fd-panel { max-height: calc(100dvh - 48px);
overflow: auto; padding: 48px 40px }` (`:694-710`) → panel **meng-clip** bleed.
- `@media (max-width:560px)` `.fd-card { width:100%; max-width:302px;
height:auto; aspect-ratio: 302/400 }` (`:711-727`), padding panel `40px 24px`.
- Bleed leader = `43.71cqw`. Di card 264px (viewport ~360) → ~**115px** di atas
  kartu, sedangkan padding-top panel cuma **40px** → **kepotong ~75px** (kepala
  hilang) begitu `is-lead` dipertahankan. **Prototype** `.fd-panel{overflow:visible}`
  - dialog yang scroll (`place-items:start center; overflow-y:auto; padding`)
    membuat bleed tampil penuh & rapi (sudah diuji di 320 & 390).
- Tidak ada overflow horizontal (`panel.clientWidth == scrollWidth`) — masalahnya
  murni clip vertikal bleed, bukan teks meluber.

## 2. Keputusan desain (perlu konfirmasi user sebelum eksekusi)

1. **Modal menampilkan kartu sama persis dengan yang diklik** → lead tetap lead
   (fix Bug A). Ini yang user minta ("seperti display yang melebar ke atas").
2. **Desktop — bleed leader** (`−132px`, card duduk di panel padding-top 88):
   - **(A) Biarkan bleed** seperti display: panel `overflow: visible` (memang
     default), portrait menonjol ~44px di atas panel. [paling sesuai permintaan]
   - **(B) Tampung di dalam panel**: tambah `padding-top` panel untuk lead / turunkan
     kartu → mengubah geometri 997×576 & assertion `verify.mjs`. Lebih invasif.
3. **Mobile** = panel `overflow: visible` + **dialog yang scroll** (bukan panel
   scroll), supaya bleed tidak terpotong dan konten tetap bisa di-scroll.

### 2b. Keputusan baseline (default) — AI baru boleh LANGSUNG eksekusi

Disetujui 6 Oct 2026; pakai ini kalau user tidak menimpa:

- **Bug A**: pertahankan varian kartu di modal → leader tetap **bleed** seperti
  grid (`is-lead` dipindah ke `.fd-card`). (default #1)
- **Desktop bleed**: **(A) biarkan menonjol keluar panel** — panel tetap
  `overflow: visible`. Jangan ubah geometri 997×576 / card 302×400 / body 471
  (assertion `verify.mjs` `:3148-3184` tetap valid). (default #2A)
- **Mobile**: **panel centered yang scroll** — `overflow: visible` pada panel +
  `.featured-detail[open] { place-items:start center; overflow-y:auto; padding }`.
  Bukan bottom-sheet. (default #3)
- **Non-lead**: **tetap framing seragam** seperti Figma `HoD-DetailCard-1x.png`.

> Kalau salah satu default di atas tidak cocok, user akan bilang; kalau tidak,
> eksekusi ketiganya.

## 3. Master Work Plan (satu langkah per pass + 7 gate)

**Step 1 — Pertahankan varian kartu di modal.**

- JS: sebelum `replaceChildren`, set class pada slot:
  ```js
  cardSlot.classList.toggle('is-lead', article.classList.contains('is-lead'));
  ```
  (Alternatif lebih tahan banting: ganti `cardSlot` = clone `<article>` utuh lalu
  hapus `.card-open`.)
- Test: `.fd-card` punya `is-lead` untuk member lead; photo rect modal == grid
  (1440: 302×532 top −132). Geometri modal `verify.mjs` tetap (panel 997×576,
  card 302×400, body 471, 3 bar).

**Step 2 — Mobile rapi (bug B).**

- `@media (max-width:1080px)`:
  ```css
  .fd-panel {
    max-height: none;
    overflow: visible;
    margin-block: 24px;
  }
  .featured-detail[open] {
    place-items: start center;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    padding: 24px 0 max(24px, env(safe-area-inset-bottom));
  }
  ```
- `@media (max-width:560px)`: pertahankan `.fd-card` aspect 302/400; pastikan
  padding-top panel ≥ bleed (atau andalkan bleed overflow visible + dialog
  padding). Ukur foto leader tidak terpotong (photo top ≥ 0 relatif viewport).
- Pastikan tombol close X tetap terlihat saat scroll.
- Test: 320 & 390 → tidak ada overflow horizontal, portrait utuh, konten
  ter-scroll sampai bawah, X bisa diklik.

**Step 3 — Desktop bleed (pilih A/B dari §2).**

- A: cukup `overflow: visible` (default) — cek bleed tidak menutup tombol X.
- B: jika ditampung, hitung ulang `padding-top` panel & update assertion
  `verify.mjs` + reference modal di commit yang sama.

**Step 4 — Verifikasi + docs.**

- Regenerasi/ukur reference modal bila ada perubahan visual disengaja
  (`assets/hall of frames/detail-card/HoD-DetailCard-1x.png` = non-lead Figma;
  perubahan lead tidak ada di reference → tak di-assert, tapi catat).
- Update `docs/assets.md` + `docs/ai-handoff.md` + `AGENTS.md`.

## 4. Kriteria uji (acceptance)

| Cek                 | Target                                                                                                                                   |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 1440 modal lead     | photo **302×532 top −132** (sama grid); panel 997×576; card 302×400; body 471; 3 achievement; Esc close                                  |
| 1440 modal non-lead | photo 302×442 top −42 (sama grid)                                                                                                        |
| 390 / 320           | tidak ada horizontal overflow; bleed leader **utuh**; konten bisa scroll ke bawah; X terlihat                                            |
| reduce              | render pixel-exact (semua audit reduce)                                                                                                  |
| Gates               | build 19, `verify.mjs`, `navbar-audit`, `verify-vt`, `responsive-audit` 468/468, `audit:spacing`, `format:check`, `seo:audit` — ALL PASS |
| Regresi             | `hofFeatured` grid MAE tidak berubah; klon kartu di modal tidak mengubah grid                                                            |

## 5. Jebakan

- Class `is-lead` **hilang** karena clone hanya `childNodes` — perbaiki di JS,
  bukan di CSS.
- Persona `cqw` bergantung pada `container-type: inline-size` dari
  `.featured-card`; slot `.fd-card` harus tetap `.featured-card` (class
  dipertahankan) agar `cqw` resolve ke lebar kartu.
- `overflow: auto` pada panel meng-clip bleed → jangan pakai panel-scroll untuk
  mobile.
- `verify.mjs` meng-assert geometri modal (`:3148-3184`); jangan ubah panel/card/
  body saat menambah scroll mobile.
- Prettier: komentar CSS **satu baris** (idempotency).
- ClientRouter: JS modal sudah re-init `astro:page-load` + abort `astro:before-swap`
  — pertahankan saat mengedit.

## 6. Pertanyaan untuk user

1. Desktop bleed: **(A)** biarkan menonjol keluar panel, atau **(B)** ditampung
   (ubah geometri)? Usul: **A**.
2. Mobile: modal panel centered yang **scroll** (usul) atau bottom-sheet
   full-screen?
3. Member non-lead: pakai framing grid (uniform) seperti sekarang — setuju?
