# Master Work Plan — Pass 3: Roles → Supabase

Status: SQL live di web-community; kode lokal + QA selesai, belum push/deploy.

## Lingkup dan baseline

Satu collection: Roles. Enam ID dan urutan tetap: data, core, language,
vision, product, growth. Projects/Team tetap Supabase; Domains/Hods/Partners
masih GAS. Auth custom dan handler admin existing tetap. Roles belum memiliki
editor/write API; pass ini hanya menyediakan read RPC, tanpa mutation atau
Management API write baru. Storage tidak diperlukan.

Tidak ada perubahan section UI. Node/frame Figma, ukuran, spacing 8pt,
Bluu Next Bold 700/Manrope, artwork dan assertion mengikuti baseline existing
(docs/assets.md + scripts/verify.mjs); tidak ada node atau ukuran baru.

## Urutan kerja

1. Simpan checksum snapshot dan HTML baseline; rekonsiliasi Roles GAS terhadap
   snapshot sebelum seed remote. Jangan cetak secret atau isi env.
2. Tambah migration private.cms_roles dengan enam ID fixed, position fixed,
   semua field snapshot, JSON array chips/requirements sesuai jumlah slot,
   whatsapp nullable dan tidak disertakan dalam output bila NULL.
   Seed persis snapshot, ON CONFLICT DO NOTHING; tidak overwrite data existing.
3. Aktifkan RLS, revoke tabel dan private function dari PUBLIC/anon/authenticated.
   Explicit deny policies. SECURITY DEFINER search_path tetap dan public
   cms_load_roles hanya EXECUTE anon/service_role; authenticated tidak diberi.
4. Snapshot remote wajib membaca cms_load_roles menggunakan anon key. GAS
   Roles tidak menjadi fallback. Validasi Zod dan atomic write tetap.
5. Test hybrid source precedence, RPC gagal/malformed mempertahankan snapshot,
   optional whatsapp, serta PostgreSQL nyata: seed roundtrip, idempotency,
   anon read, private/table/write denied, fixed ID/order/slots.
6. Jalankan test:cms, regresi recruitment/admin, build, verify, responsive,
   navbar, VT, spacing, format dan SEO. Bandingkan snapshot/HTML baseline.
7. Update AGENTS.md, ai-handoff, SOP dan plan induk dengan bukti lokal vs live.
   Apply additive migration setelah QA SQL dan rekonsiliasi. Konfirmasi sebelum
   push origin (dua situs); verifikasi deployment setelah push berizin.

## Kriteria penerimaan

Enam Roles identik snapshot; tidak ada field position/null whatsapp bocor ke
Zod. Remote tidak memakai fallback stale. SQL privileges diuji pada Postgres
nyata, mock tidak diklaim sebagai bukti Supabase live. Ketujuh gate + SEO lulus,
snapshot dan HTML publik identik baseline. Auth/UI dan tiga collection tersisa
tidak berubah. Deploy tetap pending sampai push disetujui.

## Hasil eksekusi

- Rekonsiliasi GAS Roles vs snapshot: enam record identik.
- SQL terpasang, anon RPC identik baseline dan privilege catalog PASS.
- PostgreSQL ephemeral: seed roundtrip, rerun preserve edits, optional whatsapp,
  privilege deny dan fixed ID/order/slot constraints PASS.
- CMS 42 PASS, 10 tes Team live SKIP; Recruitment 24 PASS; browser mock
  native/legacy/Team empat width PASS. Node 22.23.0.
- Build, visual verify (browserErrors kosong), responsive 468/468, navbar,
  VT, spacing, format dan SEO 23 halaman PASS.
- Snapshot repo tetap byte-identik dan 19 HTML publik identik build sebelumnya.
- Hybrid nyata: Roles identik; collection lain identik client sebelum pass.
  Team remote berbeda baseline repo sebelum pass, tidak diubah di pass ini.
- Local anon key belum ada; verifikasi memakai key yang dibaca melalui
  Management API di memori tanpa output key atau perubahan .env.local.
- Bukti ignored: artifacts/cms-pass3/; push/deploy dan dua-site acceptance
  masih pending persetujuan push. Jangan klaim pass situs sudah live.
