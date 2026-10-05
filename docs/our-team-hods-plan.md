# Master Work Plan — Our Team (HoDS carousel) revision

Sumber: Figma `JYUzJK1hFqaEwL6DpdDvjp`, section **`1688:2933`** ("Our Team
Section") + component set **`1594:5145`** ("Component per HoDS").
Reference export: `assets/about-us/team/OurTeam-New-1x.png` (1440×1562) &
`HoDS-Team-2745-1x.png` (1280×543). Diverifikasi 5 Oct 2026.

## 1. Perubahan vs implementasi lama

| Aspek          | Lama                           | Baru                                                    |
| -------------- | ------------------------------ | ------------------------------------------------------- |
| Tinggi section | 1536                           | **1562** (konten > viewport, tidak di-pad)              |
| Grup           | "Leader" + "Data Intelligence" | "Leader Team" + "Hause of Data Sorcerers"               |
| Label grup     | Nasalization 400 32/48 + dot   | **Bluu Next Bold 700 56 gradient 181° center**          |
| Anggota        | Leader 2 + Data 5 + "See More" | Leader 2 + **carousel 6 HoDS × 4 kartu** (tab per HoDS) |
| Kartu HoDS     | fade violet tetap              | **fade tint per-HoDS**, kartu Growth#4 = "Join Now!"    |
| Info kartu     | `left:40 w222` role `#fff`     | `left:42 w217` role `#D8D1D1`                           |

## 2. Data model (`src/data/team.ts`)

- `leaderTeam`: `[{Marchel Shevchenko, Founder, marchel}, {Zidan Amikul, Community Lead, zidan-rose}]`
- `hodsTeams`: 6 entri, urut HoDS (`data, core, language, vision, product, growth`)
  - `{ id, title, fade, chip, members: TeamMember[4] }` (`members` placeholder — reuse foto).
  - `growth` punya `cta: { label: 'Join Now!' }` → kartu ke-4 CTA (3 member + 1 CTA).

## 3. Geometri (relatif section 1440, terukur)

- Section: `padding:80px`, `gap:80px`, fill `#050507`. Konten 1280.
- Eyebrow `Our Team`: y **80**, h26 (`padding 4 8`, radius 32, bg `rgb(255 255 255 / 15%)`).
- Heading utama: y **114**, Bluu Next 700 56/67, gradient 181° center.
- Title block → grup: **48**.
- Groups container: **width 1287**, centered (x **76.5**), `gap:80`.
  - Grup1 title "Leader Team": y **229** (h67), center.
  - Leader cards: y **344** (h400); 2 kartu gap 24, **center** → x **406, 732**.
  - Grup2 title "Hause of Data Sorcerers": y **824** (h67).
  - Instance carousel: y **939**, `gap:72`.
    - Chips row (h49): **center**, arrow37 + gap16 + chip300 + gap16 + chip300 +
      gap16 + chip300 + gap16 + arrow37 = **1038** → arrow x **201/1202**,
      chip x **254/570/886**.
    - Dots: y **1004** (h6): 2×6px gap8, center (x 710/724).
    - Cards row: y **1082** (h400); 4 kartu gap 24, **left-aligned** → x **76,402,728,1054** (container 1287).
- Section bottom **1562**.

## 4. Komponen carousel (varian & warna)

Chip window = 3 per halaman; **2 halaman**. Arrow menggeser **key HoDS aktif**
(wrap 0↔5), window & dot mengikuti. Klik chip = pilih HoDS. Default = **Data Intelligence** (index 0).

| #   | HoDS                  | chip aktif (gradient -12°)                            | card fade (180°)                 |
| --- | --------------------- | ----------------------------------------------------- | -------------------------------- |
| 0   | Data Intelligence     | `#ffb9bc 0%, #c50a13 100%, #260002 100%`              | `rgb(140 0 7 / 0) → #0f0001`     |
| 1   | Core AI & Engineering | `#ede8ff 0%, #9b7bff 91%, #6c3bff 100%`               | `rgb(108 59 255 / 0) → #0e0626`  |
| 2   | Language & Reasoning  | `#daf0ff 0%, #1193e6 100%, rgb(0 136 153 / 31%) 100%` | `rgb(10 148 236 / 0) → #000e17`  |
| 3   | Vision & Multimodal   | `#fcfcfc 0%, #0e9882 100%, #065246 100%`              | `rgb(6 82 70 / 0) → #022620`     |
| 4   | Product & Software    | `#ffffff 0%, #e9a560 100%, #d0ac88 100%`              | `rgb(208 172 136 / 0) → #150f09` |
| 5   | Growth & Community    | `#ffffff 0%, #34effe 100%, #51ecf9 100%`              | `rgb(81 236 249 / 0) → #071719`  |

- Chip default: bg `rgb(255 255 255 / 15%)`; chip aktif: bg `rgb(0 0 0 / 20%)` +
  gradient di atasnya.
- Chip: 300×49, radius 20, `padding 8px 24px`, teks Manrope 700 22/33 #fff, center.
- Arrow: 37×37, radius 20, bg `rgb(255 255 255 / 15%)`, ikon 11.31 stroke #fff 1.5.
- Dot: 6×6; aktif `#6C3BFF`, non-aktif `rgb(255 255 255 / 35%)`.
- Fade kartu di-fit dari PNG (seperti Core lama yang punya mid-stop); base warna
  `#050507` di ujung transparan.

## 5. Kartu (302×400, radius 10, bg `rgb(255 255 255 / 10%)`)

- `card-frame.webp` (Mask group, 295×277 @ (3,13), gradient `#d9d9d9 → transparent`).
- Foto 302×442 @ (0,-42) (placeholder marchel/zidan-rose).
- Fade tint per-HoDS @ (0,247) 302×153.
- Info @ (42,284) w217 gap7 center: name Manrope 700 22/33 #fff; divider 217×1
  `rgb(255 255 255 / 30%)`; role Manrope 400 16/24 `#D8D1D1`; socials 2×16px gap10.
- **Join Now card** (Growth #4): frame + "?" (Manrope 700 120/102,
  gradient `#fff → #6c3bff`) @ (117,132); divider @ (38,323); "Join Now!" @
  (38,336) Manrope 400 16/24 `#D8D1D1`. Link `/recruitment`.

## 6. Interaksi

- JS di `OurTeam.astro` (pola `Projects.astro`: `AbortController` +
  `astro:page-load`/`astro:before-swap`).
- Klik chip → `setActive(i)`: pindah `is-active` chip, panel, dot; update page.
- Arrow ←/→ → `active = (active±1+6)%6`.
- Transisi di-gate `prefers-reduced-motion: no-preference`; reduce = instan &
  render default (Data) pixel-exact.

## 7. Kriteria uji / gate

- `verify.mjs`: update `.our-team` geometry (height **1562**, header/title/groups/
  cards/instance/chips/dots positions), ganti query `.team-more` → carousel.
  Reference `OurTeam-New-1x.png` (tanpa pad; konten > viewport).
- 7 gate + seo: build 0 error, verify 0, navbar, vt, responsive 468/468,
  audit:spacing (8pt), format:check.
- Kartu & chip tetap 8pt-friendly (`padding 8 24`, `gap 16/24`, dll).

## 8. Keputusan / catatan

1. Teks Figma adalah **"Hause of Data Sorcerers"** (ejaan Figma; bukan "House").
   Demi pixel-exact vs reference, dipakai apa adanya. **Konfirmasi user** jika
   ingin dibetulkan ke "House".
2. Kartu "Join Now!" (placeholder `?`) diimplementasikan sesuai Figma dan
   di-link ke `/recruitment`.
3. Groups container **1287** dipertahankan agar offset 4px kartu (x=76) persis.
4. Foto/nama tetap placeholder (reuse `marchel`/`zidan-rose`) — jangan mengarang
   URL/data asli.
