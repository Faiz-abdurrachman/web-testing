# Plan — Hover interactions untuk SEMUA elemen interaktif

Status: **RENCANA (belum dieksekusi)** · dibuat 6 Oct 2026 ·
Patuhi `docs/pixel-precision-sop.md` + `AGENTS.md`.

## 1. Tujuan

User: _"supaya semua tombol pas di-hover ada interaksinya, ga cuma pas
dipencet doang."_

Setiap elemen yang bisa diklik/di-tap (tombol, link, kartu yang clickable,
arrow carousel, tab, chip, dot, accordion) WAJIB punya respons **hover** yang
terlihat. Saat ini beberapa komponen hanya memberi efek di `:active`/klik atau
sama sekali tidak ada.

## 2. Guardrail (hukum)

1. **State istirahat (rest) tidak berubah** — geometri, warna, dan MAE Figma
   tetap pixel-exact. Hover = **tambahan** (`transform`, `box-shadow`,
   `background`, `color`, `opacity`). Nilai yang di-`assert.deepEqual` di
   `verify.mjs` **tidak boleh** bergeser.
2. Semua `transition`/`transform` di-gate `@media (prefers-reduced-motion:
no-preference)`; render `reduce` (yang dipakai semua audit) harus identik.
3. **Jangan `zoom`/`transform: scale`** untuk layout; transform hanya untuk
   micro-interaction.
4. Hover murni CSS → tidak perlu re-init ClientRouter. Kalau ada JS (mis. ikut
   kursor), init `astro:page-load` + cleanup `astro:before-swap`.
5. Hover **tidak boleh** memicu overflow/geser layout (pakai `transform`, bukan
   `margin`/`top`).
6. Cue suara hover sudah otomatis lewat `data-sfx-hover="hover"` (sound engine) —
   pastikan atribut terpasang pada elemen baru.
7. Satu komponen per pass + **7 gate** (build, verify, navbar, verify-vt,
   responsive, audit:spacing, format:check) + `seo:audit`.

## 3. Bahasa desain hover (usulan, konsisten)

| Tipe elemen                                           | Rest (Figma)            | Hover usulan                                                                                               |
| ----------------------------------------------------- | ----------------------- | ---------------------------------------------------------------------------------------------------------- |
| Tombol/pill                                           | sesuai variant          | `translateY(-1px)` + glow violet `0 6px 18px -6px rgb(108 59 255 / 55%)` + swap warna Figma yang sudah ada |
| Kartu clickable                                       | sesuai Figma            | `translateY(-2px)` + rim/glow violet + arrow panah bergeser ~2px                                           |
| Link teks (footer/nav)                                | putih                   | gradient underline juga ada di hover (nav sudah) / underline footer                                        |
| Arrow disc (carousel)                                 | `rgb(255 255 255/15%)`  | bg violet + panah bergeser diagonal halus                                                                  |
| Accordion (`summary`)                                 | `rgba(255,255,255,.15)` | bg naik sedikit + chevron bergeser/rotate                                                                  |
| Tab / chip / dot                                      | aktif=gradient          | hover = tint violet + text putih (sebagian sudah)                                                          |
| Kartu non-clickable dekoratif (partner/why/milestone) | sesuai Figma            | **opsional** — butuh keputusan user (lihat §5)                                                             |

Semua durasi `0.2–0.3s ease`; reduced-motion → `transition: none`.

## 4. Audit — status hover per komponen (6 Oct 2026)

Legenda: ✅ sudah ada · ⚠️ sebagian/kurang · ❌ belum ada.

| #   | Komponen                                                                  | Elemen interaktif                | Hover sekarang           | Aksi                                     |
| --- | ------------------------------------------------------------------------- | -------------------------------- | ------------------------ | ---------------------------------------- |
| 1   | `Button.astro`                                                            | `.button` semua variant          | ✅ swap warna            | + lift/glow halus? (opsional; benchmark) |
| 2   | `Navbar.astro`                                                            | link desktop + mobile + CTA      | ✅ underline/glow        | ✅ tidak perlu                           |
| 3   | `Footer.astro`                                                            | `.footer-nav a`                  | ❌                       | **+ underline/putih**                    |
| 4   | `Footer.astro`                                                            | `.footer-contact a`              | ✅ underline             | ✅                                       |
| 5   | `Footer.astro`                                                            | `.scroll-up`                     | ✅ violet                | ✅                                       |
| 6   | `Footer.astro`                                                            | social + legal (`aria-disabled`) | — tak dituju             | skip                                     |
| 7   | `Faq.astro`                                                               | `summary.faq-item`               | ❌                       | **+ bg naik + chevron**                  |
| 8   | `ContactHero.astro`                                                       | `.form-submit`                   | ❌                       | **+ glow/lift**                          |
| 9   | `ContactHero.astro`                                                       | `.info-card` (non-link)          | ❌                       | skip (tidak dituju)                      |
| 10  | `DomainRail.astro`                                                        | `.domain-arrow`                  | ❌ (hanya focus-visible) | **+ violet + panah geser**               |
| 11  | `OurTeam.astro`                                                           | `a.team-card--join` (Join Now!)  | ❌                       | **+ lift/glow**                          |
| 12  | `OurTeam.astro`                                                           | chip / dot / arrow               | ✅                       | ✅                                       |
| 13  | `Projects.astro` / `Snippets.astro` / `HallOfFramesProjects.astro`        | arrow carousel                   | ✅                       | ✅ (cek konsistensi)                     |
| 14  | `HallOfFramesFeatured.astro`                                              | kartu + tombol close             | ✅                       | ✅                                       |
| 15  | `AvailableRoles.astro`                                                    | kartu role (pointer pool)        | ✅ kaya                  | ✅                                       |
| 16  | `RoleDetail.astro` / `HoDSDetail.astro`                                   | tabs, back link, kartu contact   | ⚠️ back belum            | **+ hover back link**                    |
| 17  | `WhyPartners.astro` / `OurPartners.astro` / `HallOfFramesMilestone.astro` | kartu dekoratif non-clickable    | ❌                       | **opsional** (§5)                        |
| 18  | `SelectionTimeline.astro` / `WhatYouWillDo.astro` / `VisiMisi.astro`      | tidak ada elemen klik            | —                        | skip                                     |

## 5. Pertanyaan terbuka (perlu keputusan user)

1. **Kartu dekoratif non-clickable** (partner logo, why-DS, milestone): mau dikasih
   hover halus (lift/glow) juga, atau biarkan statis (mereka bukan tombol)?
2. **Tombol `Button.astro`**: swap warna sudah sesuai Figma. Mau ditambah lift/glow
   seragam, atau cukup swap warna saja (paling aman untuk benchmark)?
3. **Intensitas**: halus (profesional) vs jelas (playful). Usul: halus.

## 6. Urutan eksekusi (satu komponen per pass + 7 gate)

1. `Footer.astro` — nav link hover. (paling terlihat, low-risk)
2. `Faq.astro` — summary hover.
3. `ContactHero.astro` — form-submit hover.
4. `DomainRail.astro` — arrow hover.
5. `OurTeam.astro` — Join Now card hover.
6. `RoleDetail.astro` + `HoDSDetail.astro` — back link (+ cek tabs).
7. Audit konsistensi arrow carousel (Projects/Snippets/HoF) + `Button` lift (jika disetujui).
8. (Opsional) kartu dekoratif sesuai §5.

## 7. Verifikasi

- **7 gate** tiap pass + `seo:audit`.
- Tambah `scripts/hover-audit.mjs` (usulan): untuk setiap elemen interaktif di
  semua rute, `hover()` → assert minimal satu properti computed berubah
  (background/box-shadow/transform/color/text-decoration) dan **tidak ada**
  overflow baru; jalankan di 1440 + reduce. Bila dibuat, daftarkan di
  `AGENTS.md` commands.
- Cek reduced-motion: screenshot tetap pixel-exact (tidak ada transition).
- Update `docs/assets.md` + `docs/ai-handoff.md` + `AGENTS.md` di commit yang sama.
