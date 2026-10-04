# Figma prototype flow — peta navigasi antar-halaman

Sumber: file Figma **Web Community DS (Copy)** `fPaqAAY3MUED8y5avi1cQz`
(canvas `🎨Design` `1:3`). Diekstrak dari **REST API** `GET /v1/files/:key`
(field `interactions` per node) karena **MCP `figma_get_figma_data` TIDAK
mengekspos prototype interactions** sama sekali. Total 450 interaksi; yang
berikut sudah disaring ke navigasi user-facing (hover-state komponen diabaikan).

Cara regenerate: script ad-hoc memakai `X-Figma-Token` dari
`~/.gemini/config/mcp_config.json`, walk `document` → kumpulkan `interactions`
(`trigger.type`, `actions[].type/destinationId/navigation`), resolve
`destinationId` ke nama/path, tulis ringkasan. Output mentah: 450 links.

## 1. Navigasi global (Navbar — dipakai semua halaman, node `530:13894`)

| Elemen                         | Tujuan                                                                 |
| ------------------------------ | ---------------------------------------------------------------------- |
| Logo (`Logo_transparan (1) 4`) | Home (`755:15282` / `1430:2040`)                                       |
| `home`                         | Home Page Revisi Font & Spacing `1430:2040`                            |
| `About us`                     | About Us Page (auto layout) `1439:4184`                                |
| `Recruitment`                  | Recruitment Page Revisi Font & Spacing `1436:3505`                     |
| `Hall of Frames`               | Hall of Frames Page `1439:4506`                                        |
| `Partners`                     | Partners Page `1439:4787`                                              |
| `Contact`                      | Contact Page `1445:5065`                                               |
| `Join Us - Button`             | (`ON_HOVER` → primary hover) lalu `ON_CLICK` → Recruitment `1436:3505` |

## 2. Home (`1430:2040`)

| Sumber                                   | Trigger          | Aksi      | Tujuan                                                |
| ---------------------------------------- | ---------------- | --------- | ----------------------------------------------------- |
| Hero — Join the Community (`1430:2049`)  | ON_CLICK         | NAVIGATE  | Recruitment `1436:3505`                               |
| Hero — Explore Our Project (`1430:2050`) | ON_CLICK         | SCROLL_TO | Our Project Section `1430:2146` (→ `#projects`)       |
| House of Data Sorcerers — 6 HoDS cards   | ON_CLICK         | NAVIGATE  | Detail HoDS `864:18857/18904/18959/19013/19024/19035` |
| CTA Recruitment — Join the Community     | (hanya ON_HOVER) | —         | **Figma tidak memberi tujuan** (lihat §8)             |
| Footer ↖ (`1564:3289`)                   | ON_CLICK         | SCROLL_TO | Navbar (scroll ke atas)                               |

## 3. Recruitment (`1436:3505`)

| Sumber                                         | Trigger         | Aksi      | Tujuan                                               |
| ---------------------------------------------- | --------------- | --------- | ---------------------------------------------------- |
| Hero — Apply Now (`1436:4045`)                 | ON_CLICK        | SCROLL_TO | Available Roles `1436:3564` (→ `#available-roles`)   |
| Available Roles — 6 role cards (`Component 6`) | ON_CLICK        | NAVIGATE  | Detail Roles                                         |
| Who Should Join — 6 HoDS cards                 | ON_CLICK        | NAVIGATE  | Detail HoDS `864:18857/…`                            |
| CTA — Join the Community (`1438:4080`)         | ON_CLICK        | SCROLL_TO | Available Roles `1436:3564`                          |
| FAQ 1–6 (`1436:3678…3683`)                     | ON_CLICK        | CHANGE_TO | state `A 1…6` (accordion toggle, **bukan** navigasi) |
| Snippets `galeryy ds` thumbnail                | ON_CLICK / DRAG | CHANGE_TO | state `DS 1…5` (carousel, **bukan** navigasi)        |

Pemetaan 6 role card → Detail Roles (prototype):

| Card | Node        | Tujuan                                                           |
| ---- | ----------- | ---------------------------------------------------------------- |
| 1    | `1436:3576` | Detile Roles - DATA INTELLIGENCE `774:17392`                     |
| 2    | `1436:3587` | Detile Roles - DATA INTELLIGENCE `733:15781` (⚠ dobel, lihat §8) |
| 3    | `1436:3598` | Detile Roles - LANGUANGE & REASONING `760:14975`                 |
| 4    | `1436:3610` | Detile Roles - VISION & MULTIMODEL `760:15276`                   |
| 5    | `1436:3621` | Detile Roles - PRODUCT & SOFTWARE `760:15347`                    |
| 6    | `1436:3632` | Detile Roles - GROWTH & COMMUNITY `760:15439`                    |

## 4. About Us (`1439:4184`)

- Navbar global (§1).
- Our Team `see more button` (`1260:16901`): ON_HOVER `CHANGE_TO` state, ON_CLICK
  `CHANGE_TO` `1260:16902` (expand group, bukan navigasi).
- Footer ↖ → SCROLL_TO Hero/Navbar (scroll atas).

## 5. Partners (`1439:4787`) & Hall of Frames (`1439:4506`)

- Navbar global (§1); Footer ↖ → scroll atas.
- **Hall of Frames — Sorcerers Spotlight** `card orang` (`1439:4535/4552/4569`):
  ON_CLICK → **Detail Card modal** `1554:2824`.

## 6. Detail HoDS (`864:18857` dkk — 6 rute `/hods/[id]`)

- `Frame 2391` (back button): ON_CLICK → **BACK** (kembali).
- CTA di dalam kartu: `CHANGE_TO` antar-varian sub-kategori (`Property 1=…`),
  bukan pindah halaman.
- ⚠ `Vision & Multimodal CARD` di komponen `HoDS Card` malah mengarah ke
  _Core AI & Engineering_ (`864:18904`), bukan `864:19013` — bug Figma (§8).

## 7. Detail Roles (`774:17392`, `733:15781`, `760:…` — `/recruitment/roles/[id]`)

- `Frame 2391` (back): ON_CLICK → **BACK**.
- `Apply Noww Button`: hanya ON_HOVER (`1436:3501` → hover `1436:3499`);
  **tidak ada navigasi** di prototype.

## 8. Contact (`1445:5065`)

- Navbar global (§1).
- `submit button` (`1445:5116`): hanya ON_HOVER → `1445:5057`; tidak ada navigasi.
- Footer ↖ → SCROLL_TO Navbar (scroll atas).

## 9. Gap vs kode saat ini

Elemen yang **masih `aria-disabled`** di kode tapi punya tujuan di prototype /
yang disepakati:

| #   | Komponen                   | Elemen                                                        | Sekarang | Tujuan                                                               |
| --- | -------------------------- | ------------------------------------------------------------- | -------- | -------------------------------------------------------------------- |
| 1   | `Hero.astro:42`            | Join the Community                                            | disabled | `/recruitment`                                                       |
| 2   | `Hero.astro:43`            | Explore Our Project                                           | disabled | `#projects` (smooth scroll)                                          |
| 3   | `RecruitmentHero.astro:33` | Apply Now                                                     | disabled | `#available-roles` (smooth scroll)                                   |
| 4   | `Recruitment.astro:22`     | Join the Community                                            | disabled | `#available-roles` (smooth scroll)                                   |
| 5   | `Footer.astro:70`          | Nav: About Us, Recruitment, Hall of Frames, Partners, Contact | disabled | `/about`, `/recruitment`, `/hall-of-frames`, `/partners`, `/contact` |
| 6   | `Cta.astro:15`             | Join the Community (home CTA)                                 | disabled | `/recruitment` (keputusan: Figma tidak specify)                      |

Yang **sengaja tetap disabled** (tidak ada tujuan / di luar scope):

- `Footer.astro` legal links (`Terms`, `Privacy`, `Cookies`) — `legal` array.
- `Footer.astro` social (Instagram/LinkedIn) — belum ada URL.
- `OurTeam.astro` ikon sosial per member (`href="#"` disabled).
- Detail Roles `Apply Now` (Figma hanya hover).

## 10. Bug prototype Figma (jangan ditiru)

1. `HoDS Card` → `Vision & Multimodal CARD` mengarah ke _Core AI & Engineering_
   `864:18904` (harusnya `864:19013`).
2. Recruitment role card 2 mengarah ke _DATA INTELLIGENCE_ `733:15781` (dobel;
   implementasi situs memakai 6 role distinct dari `src/data/roles.ts`).
3. Arsip punya link usang (`akar-icons:arrow-right` → `Recruitment 911:2937`)
   yang tidak relevan.

## 11. Catatan teknis

- Section anchor yang dipakai: `#projects` (`Projects.astro`), `#available-roles`
  (`AvailableRoles.astro`), `#domains` (`Domains.astro`), `#who-should-join`
  (`WhoShouldJoin.astro`), `#our-philosophy` (`Philosophy.astro`).
- Navigasi internal situs memakai `<ClientRouter />` (View Transitions). Anchor
  in-page sudah di-handle (`BaseLayout` re-apply hash setelah `ds:splash-done` /
  `load` / `fonts.ready`; `section[id]` punya `scroll-margin-top: 110px`).
- Smooth scroll perlu dihormati `prefers-reduced-motion`.
