# Master Work Plan — CMS pass 4: Domains → Supabase

Status: **LIVE — checklist A–E selesai; commit kode `6b36519`.**
Baseline sebelum pass: `53f92f8`; planning lokal `7189fcc`. Faiz mengizinkan
push `6b36519`, satu push origin terkirim ke kedua repo.

Kedua Vercel READY/SUCCESS actual pada 7 Oct 2026: testing 12:02:26.550 UTC
(19:02:26.550 WIB), production 12:04:06.630 UTC (19:04:06.630 WIB).
Home + Recruitment × 390/1440 × dua situs PASS: enam cards/copy/order/nested
blank slots exact, keyboard/arrows/native touch 390, semua enam HoDS links dan
back links sesuai origin. Admin anonymous 401, recruitment closed, no mutations.
Empat Supabase + dua GAS env keys Production kedua project verified;
SUPABASE_ACCESS_TOKEN yang missing di keduanya dilengkapi encrypted sebelum push.

SQL applied, anon HTTP/role read exact, RLS/deny/catalog dan 13 actual permission
denials PASS. Same-input pre/post hybrid identik, Team drift tetap.
QA lokal Node 22.23.0: CMS 56 PASS/10 live Team SKIP, Recruitment 24 PASS,
PostgreSQL ephemeral, tiga admin mock empat width, 7 gate + SEO, responsive
468/468, 23 pages SEO, 39 komponen spacing, snapshot/19 HTML byte-identik.
Proof ignored `artifacts/cms-pass4/`; ringkasan di checkpoint/handoff.
Dokumen kontrak/proposal historis berikut mempertahankan keputusan sebelum pass.

## 1. Keputusan scope dan urutan

Satu collection: `domains`. Enam record fixed, public read-only. Baca konten dari
Supabase saat build, simpan kontrak snapshot existing, Astro tetap static.

| Collection | Sumber sebelum pass 4 | Sumber setelah pass 4 |
| ---------- | --------------------- | --------------------- |
| Projects   | Supabase              | Supabase              |
| Team       | Supabase              | Supabase              |
| Roles      | Supabase              | Supabase              |
| Domains    | GAS                   | Supabase              |
| Hods       | GAS                   | GAS                   |
| Partners   | GAS                   | GAS                   |

Recruitment pass 1–3 sudah di Supabase dan intake tetap tertutup.
Sesudah Domains: pass 5 Hods → pass 6 Partners → keputusan/implementasi auth
CMS terakhir. Login recruitment memakai Supabase Auth email/password, sedangkan
login CMS memakai OAuth custom. Jangan menyamakan dua flow itu.

Pass ini tidak membuat editor Domains, mutation RPC, state/revision table,
Storage baru, webhook baru, dependency baru, atau perubahan handler admin.
Write existing Projects/Team tetap Management API; Domains hanya RPC baca.
Jangan hapus GAS/Sheet/Drive/backup atau membuat ulang setup existing.

## 2. Fakta baseline sebelum implementasi

- `src/data/cms-schema.mjs`: `domains = orderedDomains(domain)`, tepat enam
  ID berurutan; `id`, `title`, `description`, `labels` saja (strict object).
- `title`/`description`: string 1–20000 karakter sesuai kontrak Zod sekarang.
  Jangan trim, mengganti copy, atau menerapkan limit baru diam-diam.
- `labels`: tepat tiga row; tiap slot string max 256, beberapa wajib `''`.
  Slot nonblank mengikuti aturan Boolean(string) existing. Jangan mengubah
  whitespace menjadi blank atau menghapus string kosong dengan `.filter(Boolean)`.
- `src/data/domains.ts` menggabungkan snapshot berdasarkan **index** dengan
  `domainDesign` lokal. Salah urutan bisa memasangkan copy dengan tint/koordinat
  kartu lain walau jumlah record benar. DB harus menentukan urutan eksplisit.
- `domainDesign`: tint, row x/y/gap tidak menjadi field DB. Artwork, font,
  reference PNG dan assertions tidak boleh berubah.
- `scripts/cms-client.mjs` saat ini fetch **full snapshot GAS yang sudah
  divalidasi**, lalu override Projects, Team, Roles dengan Supabase dan validasi
  final. Ini bukan fetch per-collection murni. Handler `gas()` bukan jalur admin
  Roles/Domains/Hods/Partners; route admin yang tersedia hanya Projects/Team/media.
- Artinya, GAS tetap dependency Hods/Partners dan validitas full export-nya
  masih bisa menggagalkan build meskipun konten suatu collection sudah dipindah.
  Jangan menghapus/merusak tab Domains GAS selama pass ini. Memisahkan validasi
  source GAS adalah keputusan scope lain, bukan perubahan terselubung pass 4.

## 3. Kontrak slot yang wajib dipertahankan

Notasi `B = string kosong persis ''`, `T = slot teks nonempty sesuai Zod`.
Nomor posisi DB harus terikat ke ID, bukan dapat dipindahkan bebas.

| Position | ID       | Row 1   | Row 2   | Row 3   |
| -------- | -------- | ------- | ------- | ------- |
| 1        | data     | B,T,B,B | T,T     | B,T,B   |
| 2        | core     | B,T,B,B | T,T     | B,T,B   |
| 3        | language | B,T,B,B | T,T,B   | B,T,T   |
| 4        | vision   | B,T,B,B | T,T,B   | B,T,B   |
| 5        | product  | B,T,B,B | B,T,T,B | B,T,T,B |
| 6        | growth   | B,T,B,B | B,T,B   | B,T,B   |

Table di atas dibaca dari snapshot + Zod repo, bukan asumsi Figma.
Jangan meratakan nested array, menukar row/slot, mengisi blank dengan NULL,
atau mengirim metadata DB (`position`, timestamps) ke snapshot.

Checksum orientasi pada baseline `53f92f8`:

- `src/data/cms-snapshot.json` byte SHA256:
  `4345f1abe445aa2a400c31413ccc058707a77105a7e388dc8d1074e78da94857`
- SHA256 `JSON.stringify(snapshot.domains)`:
  `04c0e1c80924f50d57d8966aa9bc3449c25bd519aed69c90a9b713cddf16e3ce`

Hitung ulang sebelum implementasi. Hash berbeda bukan alasan reset data:
periksa perubahan user/remote dan rekonsiliasi. JSONB dapat mengubah urutan key;
bandingkan value kanonik terlebih dahulu, kemudian format snapshot standar.

## 4. Baseline visual yang terkunci

Tidak ada section UI baru atau perubahan UI di pass ini. Referensi existing:

| Surface                   | Node / URL                                                                                  | Reference frame | Kontrak existing                                                           |
| ------------------------- | ------------------------------------------------------------------------------------------- | --------------- | -------------------------------------------------------------------------- |
| Home Domains              | `1430:2138`, [Figma](https://www.figma.com/design/JYUzJK1hFqaEwL6DpdDvjp?node-id=1430-2138) | 1440×819 (PNG)  | padding 80; eyebrow→heading 8; heading→copy 24; kartu 405×436; rail gap 32 |
| Recruitment WhoShouldJoin | `1436:3512`, [Figma](https://www.figma.com/design/JYUzJK1hFqaEwL6DpdDvjp?node-id=1436-3512) | 1440×789 (PNG)  | padding 80; header→rail 74 exception Figma existing; rail gap 32           |

Frame PNG di atas adalah frame desain, bukan klaim tinggi runtime saat ini:
full-screen existing memakai min-height 100svh dan padded reference. Jangan
mengembalikan section ke tinggi PNG. Bluu Next Bold 700 heading, Manrope body,
spacing serta pengecualian Figma existing tetap. Detail terukur lengkap:
[assets](assets.md) dan [SOP presisi](pixel-precision-sop.md).

Kartu Home menuju `/hods/{id}`, Recruitment menuju
`/hods/{id}?from=recruitment`; return link/anchor mengikuti origin existing.
Migrasi Domains bukan migrasi isi halaman detail HoDS (`snapshot.hods`).

## 5. Desain SQL yang harus diimplementasikan

Migration baru berikutnya, usulan:
`supabase/migrations/20261011010000_cms_domains_pass4.sql`.
Nomor ini melanjutkan file Roles `20261010010000`; jangan rename migration lama.
Periksa collision dan urutan migration actual sebelum membuat file.

### 5.1 Tabel dan validasi

`private.cms_domains`:

| Field                   | Tipe                     | Constraint                                               |
| ----------------------- | ------------------------ | -------------------------------------------------------- |
| id                      | text PK                  | whitelist tepat data/core/language/vision/product/growth |
| title                   | text NOT NULL            | length 1–20000, parity Zod                               |
| description             | text NOT NULL            | length 1–20000, parity Zod                               |
| labels                  | jsonb NOT NULL           | nested array + mask pada §3, string-only, max 256        |
| position                | smallint NOT NULL UNIQUE | CASE id → position 1–6                                   |
| created_at / updated_at | timestamptz NOT NULL     | now(), metadata DB saja                                  |

**Boundary Unicode:** Zod string length memakai UTF-16 units (JavaScript),
Postgres length(text) menghitung karakter Unicode. Untuk astral characters,
length PG biasa tidak identik dengan batas Zod. Helper SQL harus menghitung
panjang sesuai UTF-16 jika menjamin parity constraint; tambahkan fixture
128/129 emoji untuk label 256-unit, dan batas title/description. Jangan
mengklaim parity jika hanya menguji ASCII. Zod final tetap defense-in-depth.

Validasi labels memerlukan lebih dari `jsonb_typeof(labels)='array'` atau row
count tiga. Buat helper private immutable untuk validasi nested type, row length,
slot type/length, blank/nonblank per ID. Gunakan pemeriksaan type bertahap sebelum
`jsonb_array_length`/ekstraksi; jangan bergantung pada short-circuit SQL AND untuk
menghindari error scalar. NULL/unknown ID/helper false harus ditolak oleh CHECK
(non-NULL input dan hasil boolean eksplisit). Jangan mengubah helper setelah data
terpasang tanpa revalidasi CHECK. Revoke EXECUTE default PUBLIC pada helper juga.

Enam row total diverifikasi saat seed + RPC/Zod. CHECK per-row dan ID whitelist
sendiri **tidak** menjamin tabel berisi semua enam ID. Tidak perlu trigger
cardinality atau CRUD baru dalam pass read-only ini; hasil lima row harus fail
build, bukan lolos atau diisi dari GAS.

### 5.2 Keamanan

- RLS enabled pada tabel, revoke table privileges dari PUBLIC/anon/authenticated.
- Explicit deny policy untuk ALL (`USING false`, `WITH CHECK false`).
- `private.cms_load_domains()` + `public.cms_load_domains()` wrapper,
  SECURITY DEFINER, schema-qualified references, search_path tetap `pg_catalog`.
- Revoke EXECUTE default PUBLIC/anon/authenticated pada private helper/read;
  revoke PUBLIC/anon/authenticated public wrapper, lalu grant public wrapper
  EXECUTE hanya anon + service_role. Tidak memberikan authenticated grant baru.
- Jangan mengubah privilege global schema `private`, default privileges,
  tabel collection lain, atau auth.users saat mengunci tabel baru.
- Jangan memakai RLS deny policy sebagai satu-satunya proteksi: default EXECUTE
  PUBLIC pada function dan kepemilikan SECURITY DEFINER juga harus diuji.
- Service key/token Management hanya di server; anon untuk baca build. Tidak
  menambahkan secret ke PUBLIC_ env, client bundle, SQL literal, repo atau log.

### 5.3 RPC dan seed

Response hanya `{ "domains": [ { id, title, description, labels }, ... ] }`,
`jsonb_agg ... ORDER BY position` deterministik. Tidak mengandalkan order PK,
INSERT, JSONB object atau `SELECT *`. Tidak memakai `jsonb_strip_nulls` untuk
menyembunyikan data labels invalid; table constraint harus menolak NULL slot.

Migration transaksi `BEGIN/COMMIT`; seed persis snapshot Domains yang sudah
cocok GAS. `ON CONFLICT (id) DO NOTHING`, **bukan overwrite**. Ini menjaga edit
existing saat rerun, tetapi tidak membuktikan data lama cocok. Jika tabel/RPC
sudah ada, lakukan read-only reconciliation dulu; jangan blind reseed/drop.
Jangan memalsukan migration ledger; verifikasi applied state lewat schema/RPC
bila menggunakan Management API sesuai pola pass sebelumnya.

## 6. Integrasi snapshot dan error handling

Pada `syncCmsSnapshot` remote tambahkan `cms_load_domains` setelah RPC existing;
assign `snapshot.domains = response.domains`; validasi snapshot final existing
lalu cache media existing dan atomic write seperti sekarang.

- Tidak ada fallback GAS Domains atau snapshot stale bila RPC fails.
- Missing env, HTTP failure, timeout, invalid JSON/shape, wrong order/slots harus
  menghentikan sync tanpa mengganti snapshot sebelumnya.
- Mock fetch semua suite sync harus mengenali RPC baru; jangan mengembalikan
  full snapshot untuk Team (Team membutuhkan members/groups).
- RPC memakai anon. Dilarang mengatasi privilege failure dengan mengganti
  SUPABASE_ANON_KEY menjadi service_role key.
- Sanitasi error: nama operasi/status/path validasi, tanpa raw body/URL/token
  atau stack berisi secret. Jangan mencetak env atau key response Management.
- Tidak refactor RPC helper, GAS fetch/redirect guards atau media/auth untuk
  sekadar merapikan pass ini. Jika bug terkait Domains terbukti perlu fix,
  dokumentasikan alasan dan tambah tes pada jalur kegagalan itu.

## 7. Tahapan eksekusi dan TODO rinci

Checklist status di [migration TODO](cms-migration-todo.md); status actual A–E sudah selesai. Lock satu tahap sebelum masuk tahap dependen.

### A. Orientasi dan baseline

- [x] `git status --short`, SHA/branch/remotes; jangan ubah/reset perubahan asing.
- [x] Baca kickoff → AGENTS → ai-handoff → plan ini → master plan → CMS SOP.
- [x] Pastikan runtime Node 22 (`node --version`), dependency existing tersedia.
      Jangan mengandalkan path `/tmp` atau server/artifacts dari AI sebelumnya.
- [x] Simpan snapshot baseline, checksum, 19 HTML publik build baseline dan
      current remote hybrid ke artifacts/cms-pass4/. Jangan cetak data privat.
- [x] Rekonsiliasi Domains GAS dengan snapshot (enam ID/order/semua field/slot).
      Jika berbeda, laporkan paths/counts; minta keputusan sumber, jangan overwrite.
- [x] Read-only cek apakah private.cms_domains / RPC sudah ada; cocokkan field,
      constraints, grants dan data. Jika berbeda, hentikan seed, siapkan resolusi.
- [x] Catat Team remote vs snapshot sebagai drift **preexisting**. Bandingkan
      client sebelum/sesudah pass dengan remote input yang sama untuk isolasi.

### B. Kode dan PostgreSQL lokal

- [x] Buat SQL sesuai §5 + seed, tanpa write API/state/Storage.
- [x] Tambah `tests/cms-domains-supabase.test.mjs` mengikuti Roles: fixture lokal
      hybrid dan PostgreSQL ephemeral, tidak mutation Supabase live.
- [x] Uji type/length/mask per semua enam ID, string quotes/Unicode, rerun seed
      menjaga edit, order deterministik dan deny grants.
- [x] Tambah RPC Domains ke remote snapshot; local mode tetap tanpa network.
- [x] Update mock pada `tests/cms.test.mjs` dan `tests/cms-media.test.mjs` serta
      fixture lain yang benar-benar melewati sync. Hindari scope admin non-Domains.
- [x] Seluruh contract tests + PostgreSQL lokal PASS sebelum SQL remote.

### C. Apply SQL dan proof database live

- [x] Pastikan project ref existing web-community `yejrdckcmlxrkklgtrwy`.
      Jangan hardcode project baru atau menerapkan SQL ke target lain.
- [x] Periksa presence env tanpa nilai. `.env.local` sesi Roles tidak punya anon
      key; kedua Vercel berhasil build Roles. Jika lokal masih missing, ambil key
      lewat akses Management existing secara privat/in-memory, atau minta owner
      isi env privat. Jangan meminta key lewat chat, jangan ganti dengan service key.
- [x] Ulangi read-only reconciliation segera sebelum seed. Freeze hanya edit
      manual tab Domains selama jendela cutover bila owner memang sedang mengedit;
      read-only API tidak berarti Sheet mustahil diubah manual.
- [x] Apply additive migration setelah data & SQL lokal PASS. Tidak memicu
      deploy hook/manual rebuild sebelum commit/code siap dan push disetujui.
- [x] Baca RPC anon nyata; exact value equality seluruh Domains + Zod.
- [x] Query catalog untuk RLS/policy/table/function grants; buktikan direct access
      denied dengan role anon/authenticated dalam transaction read-only/rollback.
      Pisahkan bukti privileges catalog, role execution dan HTTP RPC, jangan
      mengklaim catalog saja sebagai seluruh RLS acceptance.
- [x] Hybrid live + comparison pre-pass: hanya sumber Domains berubah;
      Projects/Team/Roles/Hods/Partners tidak diubah/reseed.
- [x] Simpan proof sanitised; failure setelah SQL apply tidak otomatis berarti
      SQL belum terpasang. Cek applied state sebelum mencoba lagi.

### D. QA situs dan dokumentasi

- [x] Build baseline snapshot, bukan menimpa committed snapshot dengan Team
      remote yang drift agar tes baseline tampak cocok.
- [x] `npm run test:cms`: catat pass/fail/skip, **tanpa env file untuk suite penuh**.
      `cms-team-supabase.test.mjs` berisi mutation nyata jika env server dimuat;
      jangan menjalankannya ke production sekadar mengejar zero skips.
- [x] `npm run test:recruitment` + browser admin native/legacy/Team empat width.
- [x] Build + verify + navbar + VT + responsive + spacing + format + SEO (§9).
- [x] Snapshot baseline byte-identik; HTML publik identik baseline lokal pada
      input sama; format JSONB field-order jangan dikira content drift.
- [x] Update plan/TODO/AGENTS/ai-handoff/kickoff/SOP/master plan/provenance,
      label setiap proof local vs live, SQL applied vs deployment.
- [x] Commit satu fitur + docs; working tree tidak membawa perubahan asing.

### E. Push dan acceptance dua situs

- [x] Periksa empat env wajib pada kedua Vercel; jangan menghapus env GAS saat
      Hods/Partners masih membutuhkan full export.
- [x] Minta konfirmasi push **baru** untuk commit pass 4 yang konkret/reviewable.
- [x] Push `git push origin main` sekali (dua push URLs), fetch kedua remotes,
      pastikan SHA local/origin/production sama; verifikasi tiap repo benar terkirim.
- [x] Dua Vercel status SUCCESS untuk **SHA baru**, bukan deployment lama.
- [x] Browser Home + Recruitment 390/1440: enam domain, content/blank chips/order,
      rail navigation/touch/keyboard, tidak overflow/pageerror, correct links/back.
- [x] Smoke HoDS detail dari kedua origin untuk memastikan routing, bukan
      mengklaim Hods sudah ikut migrasi.
- [x] API admin anonymous 401; recruitment `{ok:true, accepting:false}`; tidak
      melakukan recruitment POST atau mutation Projects/Team.
- [x] Catat timestamp UTC/WIB benar; checkpoint lokal plan → live dengan bukti.
      Jangan menyebut pass 4 LIVE hanya karena SQL/RPC telah tersedia.

## 8. Test matrix minimum

| Lapisan         | Kasus wajib                                                        | Hasil                                      |
| --------------- | ------------------------------------------------------------------ | ------------------------------------------ |
| DB seed         | six IDs, all text/labels incl. blanks                              | value exact baseline                       |
| DB order        | insert berbeda urutan; ID/position mismatch                        | output fixed order; mismatch denied        |
| DB types        | labels scalar/object/null; scalar/null row; number/null slot       | denied                                     |
| DB slots        | wrong row count/length; fill blank; empty text slot; text >256     | denied                                     |
| DB security     | anon wrapper; service_role wrapper; authenticated wrapper          | allowed; allowed; denied                   |
| DB private      | anon/authenticated table SELECT/DML/private helper/read            | denied                                     |
| DB rerun        | owner fixture edit lalu rerun migration (lokal)                    | edit preserved, no duplicate               |
| Hybrid source   | GAS Domains differs; valid Supabase Domains                        | Supabase only, other collections preserved |
| Hybrid failures | HTTP/timeout/network/invalid JSON/missing domains/order/count/slot | no stale fallback; old bytes preserved     |
| Local mode      | env absent / partial config                                        | local no fetch / fail closed               |
| Visual          | Home + Recruitment, exact baseline                                 | assertions unchanged, HTML parity          |
| Live            | anon RPC + latest two deployments + browser links                  | SQL and deployment evidence separate       |

Tidak perlu menguji CRUD Domains yang tidak dibuat. Jangan menaikkan test count
melalui test yang hanya mencari string di SQL; eksekusi PostgreSQL nyata penting
untuk CHECK/privilege/order behavior.

## 9. Commands dan bukti

Gunakan Node 22. Prebuild remote tidak otomatis memuat `.env.local`.
Baseline QA gunakan env remote yang tidak aktif; jangan mematikan env Vercel.
Local/remote experiments menggunakan temporary snapshot + finally cleanup,
bukan restore/reset data user.

```sh
npm run test:cms
npm run test:recruitment
npm run verify:cms-admin
npm run verify:cms-native-admin
npm run verify:cms-team-admin
npm run build
```

Jalankan static preview di session terpisah agar networkidle tidak tertahan HMR:

```sh
python3 -m http.server 4331 --directory dist
```

Gate setelah build, input snapshot sama dan tidak bersamaan runner growth yang
mengubah dist/snapshot:

```sh
PREVIEW_URL=http://localhost:4331 node scripts/verify.mjs
PREVIEW_URL=http://localhost:4331 npm run audit:navbar
PREVIEW_URL=http://localhost:4331 npm run verify:vt
PREVIEW_URL=http://localhost:4331 node scripts/responsive-audit.mjs
npm run audit:spacing
npm run format:check
npm run seo:audit
```

Expected baseline pass 3: CMS 42 pass/10 skipped, recruitment 24 pass,
responsive 468/468, SEO 23 pages, spacing 39 components. Tambahan tes Domains
mengubah count CMS; jangan hardcode count lama sebagai target baru.
Bukti di ignored `artifacts/cms-pass4/`: baseline checksums, reconciliation,
DB local/live results, snapshot source parity, gate logs, deployment statuses,
browser screenshots/report. Artifacts sesi lama mungkin hilang; hasil historis
tersimpan di docs, proof live baru harus dibuat ulang.

## 10. Review kritis, stop conditions, dan rollback

| Risiko/temuan                           | Mengapa berbahaya                                  | Tindakan                                                           |
| --------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------ |
| Order salah tetapi 6 row benar          | desain domains.ts dipasangkan via index            | CASE ID/position + ORDER BY + deep equality                        |
| Blank dekoratif dibersihkan             | menggeser slot/kartu dan bentuk Figma              | validasi mask §3, jangan filter/trim/reconstruct                   |
| GAS full export tetap divalidasi        | tab migrated yang rusak masih blokir build         | preserve tabs, catat coupling; jangan klaim GAS dependency hilang  |
| Team remote drift preexisting           | remote full snapshot != local baseline             | isolate pre/post source comparison; jangan reseed Team             |
| ON CONFLICT silently preserves mismatch | migration berhasil tetapi data salah               | read existing table + compare sebelum/selesai seed                 |
| Scalar JSON menyebabkan SQL exception   | checker gagal secara tidak terkontrol              | typed helper bertahap + negative DB fixtures                       |
| SECURITY DEFINER default PUBLIC EXECUTE | bypass pembatasan wrapper                          | explicit revoke helper/read/wrapper, actual role tests             |
| Missing local anon                      | tergoda memakai privileged key atau stale snapshot | key privat/in-memory, explicit fail closed                         |
| Suite live Team mutation                | test dapat mengubah data/IDs/publication state     | no server env on full suite; new pass tests ephemeral              |
| Push hanya satu repo / old build green  | klaim live salah                                   | two repo SHA + latest deployment per repo + live acceptance        |
| Migration retry sesudah error HTTP      | SQL mungkin sudah commit                           | read applied state; idempotent seed, no blind cleanup              |
| Manual Sheet change sesudah seed        | data import tertinggal                             | bounded reconciliation/cutover window; GAS backup bukan dual-write |

Stop dependent work jika data Domains berbeda tanpa keputusan sumber, privilege
bocor, SQL constraints tidak sesuai Zod, local baseline berubah, atau gate gagal.
Boleh lanjut pekerjaan independen read-only/fixtures sambil meminta info yang
benar-benar diperlukan. Jangan meminta ulang onboarding/account/deployment lama.

Jika SQL sudah terpasang tetapi code belum deploy: current GAS Domains tetap
aktif pada situs; biarkan tabel baru sambil forward-fix. Tidak perlu drop tabel.
Jika code cutover sudah deploy dan RPC bermasalah: utamakan forward-fix. Rollback
sumber ke GAS hanya dengan persetujuan user setelah membandingkan kedua sumber
serta memastikan tidak ada edit Supabase baru/manual; tidak boleh fallback
otomatis. Backup GAS disimpan dan tidak dianggap sinkron.

## 11. Definition of Done dan file scope

Pass 4 selesai hanya jika semua A–E selesai, tepat enam Domains cocok sumber
rekonsiliasi, anon RPC aman, final Zod valid, negative tests membuktikan atomic
failure, seluruh gates PASS, kedua deployments SHA baru SUCCESS, dan acceptance
Home/Recruitment/routing lulus. Auth/geometri/konten non-Domains tetap.

File implementasi yang diharapkan:

- CREATE migration `20261011010000_cms_domains_pass4.sql` dan
  `tests/cms-domains-supabase.test.mjs`.
- MODIFY `scripts/cms-client.mjs`, mock sync tests yang relevan, dokumen aktif.
- UNCHANGED `src/data/cms-schema.mjs`, `src/data/domains.ts`, public components,
  `scripts/verify.mjs`, reference PNGs, server admin/auth/media, route/API existing.
  Perubahan di luar scope wajib dibuktikan perlu dan disetujui sesuai konteks.

Sisa Hods/Partners/auth tidak dikerjakan dalam pass 4 ini.
