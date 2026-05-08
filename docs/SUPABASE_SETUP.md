# Supabase Setup Guide (Aura Music)

Dokumen ini menjelaskan setup Supabase sebagai backend untuk metadata lagu dan file audio/cover.

## 1) Cara Membuat Project Supabase
1. Buka https://supabase.com dan login.
2. Klik **New project**.
3. Isi nama project, password database, dan region.
4. Tunggu sampai status project **healthy**.

## 2) Cara Membuat Tabel `songs`
Gunakan SQL schema dari file ini:
- `docs/SUPABASE_SCHEMA.sql`

Schema tersebut akan membuat tabel `songs` dengan field metadata lagu dan constraint `lyrics_type` + `source`.

## 3) Cara Menjalankan SQL Schema
1. Masuk ke dashboard project Supabase.
2. Buka menu **SQL Editor**.
3. Copy isi `docs/SUPABASE_SCHEMA.sql`.
4. Jalankan query.
5. Verifikasi tabel `songs` sudah muncul di **Table Editor**.

## 4) Cara Membuat Bucket Storage
Buat 2 bucket berikut di menu **Storage**:
1. `song-audio`
2. `song-covers`

## 5) Cara Mengatur Public Read Access untuk Demo
Untuk demo sederhana:
1. Buka bucket `song-audio` dan `song-covers`.
2. Aktifkan read policy publik (atau set bucket public sesuai kebutuhan demo).

Catatan: mode publik ini tidak aman untuk production tanpa kontrol auth/role.

## 6) Cara Mengambil Supabase URL dan Publishable Key
1. Buka **Project Settings** > **API**.
2. Ambil:
   - `Project URL`
   - `anon/publishable key`

## 7) Cara Mengisi `.env.local`
Copy dari `.env.local.example`, lalu isi:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
# fallback (opsional)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_publishable_key
```

## 8) Cara Mengisi Environment Variables di Vercel
1. Buka project Vercel.
2. Masuk ke **Settings** > **Environment Variables**.
3. Tambahkan key yang sama:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - (opsional) `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Simpan.

## 9) Cara Deploy ke Vercel
1. Push source code ke branch deploy.
2. Trigger deployment di Vercel.
3. Setelah deploy sukses, cek halaman app dan fitur upload/fetch Supabase.

## 10) Catatan Keamanan
- Jangan pernah expose **service role key** ke frontend.
- Upload publik tanpa auth tidak aman untuk production.
- Untuk production disarankan:
  1. Supabase Auth
  2. Role-based access (admin/uploader)
  3. Storage policy ketat (write terbatas)
  4. Audit log upload/update/delete
