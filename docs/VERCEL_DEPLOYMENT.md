# Vercel Deployment (Next.js + Supabase)

## Ringkasan Arsitektur
- Frontend: Next.js App Router di **Vercel**
- Backend hosted: **Supabase**
  - PostgreSQL untuk metadata lagu
  - Storage bucket untuk audio dan cover

Tidak perlu menambah custom server (Express/Nest/VPS) untuk setup ini.

## Environment Variables Wajib di Vercel
Tambahkan di Vercel Project Settings:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (opsional fallback)

## Deployment Flow
1. Push code ke repository.
2. Trigger build/deploy di Vercel.
3. Vercel build Next.js secara otomatis.
4. Runtime frontend akan membaca env Supabase dari Vercel.

## Setelah Update Environment Variables
Setiap kali env Supabase diubah:
1. Simpan env variable baru di Vercel.
2. **Redeploy** project (manual redeploy atau push commit baru).
3. Verifikasi fitur cloud songs (fetch/upload/edit/delete).

## Fallback Behavior
Jika env Supabase belum diisi:
- App tetap jalan dengan static songs + IndexedDB local songs.
- Cloud fetch/upload akan skip secara graceful.
