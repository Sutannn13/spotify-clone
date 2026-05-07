# Audit Aset - Spotify Clone (Aura Player)

Tanggal audit: 8 Mei 2026

---

## 1. File Audio yang Ditemukan (`public/songs/`)

| No | Nama File | Status |
|----|-----------|--------|
| 1 | `Ariana Grande Bye (Hipdut Edit) prod.0landrys!.mp3` | **BARU** - ditambahkan |
| 2 | `Heidi Montag - I'll Do It (Slowed Down Version).mp3` | Sudah ada di static-songs.ts |
| 3 | `Lauv & LANY - Mean It [Official Video].mp3` | Sudah ada di static-songs.ts |
| 4 | `MEDUZA, Becky Hill, Goodboys - Lose Control (Official Video).mp3` | Sudah ditambahkan |
| 5 | `Moth To A Flame.mp3` | Sudah ditambahkan |
| 6 | `Rex Orange County - Happiness (Official Audio).mp3` | **BARU** - ditambahkan |
| 7 | `Sickick - Mind Games (SPED UP).mp3` | Sudah ada di static-songs.ts |
| 8 | `Tante Culik Aku Dong (Remix).mp3` | Sudah ditambahkan |
| 9 | `We Don't Talk Anymore  TikTok Version.mp3` | Sudah ada di static-songs.ts |
| 10 | `YAD (Яд) ENGLISH VERSION (lyric video).mp3` | **BARU** - ditambahkan |
| 11 | `message in a bottle X we cant be friends (tiktok mashup) (sped up  reverb).mp3` | Sudah ada di static-songs.ts |

**Total: 11 file audio, 6 baru ditambahkan (3 dari sesi sebelumnya, 3 baru saja).**

---

## 2. File Cover yang Ditemukan (`public/covers/`)

| No | Nama File | Dipakai Oleh |
|----|-----------|-------------|
| 1 | `410292lNYEL.webp` | Tante Culik Aku Dong (Remix) |
| 2 | `Ariana Grande Bye (Hipdut Edit) prod.0landrys!.webp` | Bye (Hipdut Edit) (Ariana Grande) |
| 3 | `Moth To A Flame song cover.webp` | Moth To A Flame |
| 4 | `Rex Orange County - Happiness.webp` | Happiness (Rex Orange County) |
| 5 | `YAD (Яд).webp` | YAD (Яд) English Version |
| 6 | `artworks-UYLAiSyo1VxOT09s-RM6GTg-t1080x1080.webp` | Lose Control (MEDUZA) |
| 7 | `i'll do it album cover.webp` | I'll Do It (Heidi Montag) |
| 8 | `mean it album cover.webp` | Mean It (Lauv & LANY) |
| 9 | `mind games album cover.webp` | Mind Games (Sickick) |
| 10 | `we can't be friends album cover.webp` | Message in a Bottle X We Can't Be Friends |
| 11 | `we don't talk anymore album cover.webp` | We Don't Talk Anymore |

**Total: 11 cover terpakai.**

---

## 3. File Cover Tidak Terpakai

| No | Nama File | Alasan |
|----|-----------|--------|
| 1 | `localhost_3001_(iPhone SE).png` | Ini screenshot, bukan cover album. Bisa dihapus dari folder covers. |

---

## 4. Lagu yang Ditambahkan ke `static-songs.ts`

| No | ID | Judul | Artist | Cover |
|----|-----|-------|--------|-------|
| 1 | `static-ariana-grande-bye` | Bye (Hipdut Edit) | Ariana Grande | Ariana Grande Bye (Hipdut Edit) prod.0landrys!.webp |
| 2 | `static-rex-orange-county-happiness` | Happiness | Rex Orange County | Rex Orange County - Happiness.webp |
| 3 | `static-yad-english` | YAD (Яд) English Version | Erika Lundmoen | YAD (Яд).webp |
| 4 | `static-meduza-lose-control` | Lose Control | MEDUZA, Becky Hill, Goodboys | artworks-UYLAiSyo1VxOT09s-RM6GTg-t1080x1080.webp |
| 5 | `static-moth-to-a-flame` | Moth To A Flame | Swedish House Mafia, The Weeknd | Moth To A Flame song cover.webp |
| 6 | `static-tante-culik-aku-dong` | Tante Culik Aku Dong (Remix) | Unknown Artist | 410292lNYEL.webp |

---

## 5. Pencocokan Cover

Pencocokan dilakukan berdasarkan kesamaan nama file:

- `Ariana Grande Bye (Hipdut Edit) prod.0landrys!.mp3` -> `Ariana Grande Bye (Hipdut Edit) prod.0landrys!.webp` (kesamaan nama persis)
- `Rex Orange County - Happiness (Official Audio).mp3` -> `Rex Orange County - Happiness.webp` (kesamaan nama artist dan judul)
- `YAD (Яд) ENGLISH VERSION (lyric video).mp3` -> `YAD (Яд).webp` (kesamaan nama judul)
- `Moth To A Flame.mp3` -> `Moth To A Flame song cover.webp` (kesamaan nama)
- `MEDUZA, Becky Hill, Goodboys - Lose Control (Official Video).mp3` -> `artworks-...webp` (cover yang tersedia tanpa nama yang cocok, digunakan sebagai cover Lose Control karena merupakan satu-satunya cover yang belum dipakai saat itu)
- `Tante Culik Aku Dong (Remix).mp3` -> `410292lNYEL.webp` (cover yang tersedia, digunakan sebagai cover Tante Culik karena merupakan satu-satunya cover yang belum dipakai saat itu)

---

## 6. Referensi Rusak yang Diperbaiki

| No | Masalah | Perbaikan |
|----|---------|-----------|
| 1 | Album "Official Video" pada Mean It | Diganti menjadi "Single" |
| 2 | Artist "Unknown Artist" pada We Don't Talk Anymore | Diganti menjadi "Charlie Puth, Selena Gomez" |
| 3 | Artist "Unknown Artist" pada Message in a Bottle mashup | Diganti menjadi "The Police, Ariana Grande" |
| 4 | Album "SPED UP" pada Mind Games | Diganti menjadi "Sped Up Version" |

---

## 7. Duplikat yang Dihapus

Tidak ada duplikat ditemukan. Semua 11 file audio unik.

---

## 8. Cara Menambahkan Lagu Baru

### Langkah-langkah:

1. **Taruh file audio** ke folder `public/songs/`
   - Format yang didukung: MP3, M4A, OGG, WAV
   - Penamaan: `Artist - Title (Version).mp3`

2. **Taruh file cover** ke folder `public/covers/`
   - Format: WebP (direkomendasikan), PNG, JPG
   - Penamaan: `nama lagu album cover.webp`
   - Ukuran: 500x500px minimum, 1080x1080px optimal

3. **Tambahkan entry** di `src/data/static-songs.ts`:
   ```typescript
   {
     id: "static-artist-judul-lagu",
     title: "Judul Lagu",
     artist: "Nama Artist",
     album: "Single",
     audioUrl: "/songs/NamaFile.mp3",
     coverUrl: "/covers/nama-cover.webp",
     lyrics: "",
     lyricsType: "none",
     source: "static",
     audioFileName: "NamaFile.mp3",
     coverFileName: "nama-cover.webp",
     duration: 0,
     createdAt: new Date().toISOString(),
     mood: "Chill",    // opsional
     genre: "Pop",     // opsional
   }
   ```

4. **Update halaman utama** (opsional):
   - Tambahkan ID lagu ke array `NEWLY_ADDED_IDS` di `src/app/page.tsx` agar muncul di bagian "Newly Added"

5. **Jalankan build** untuk memastikan tidak ada error:
   ```bash
   npm run build
   ```

### Aturan Penamaan ID:
- Format: `static-nama-artist-judul-lagu`
- Huruf kecil semua
- Spasi diganti dengan tanda hubung `-`
- Contoh: `static-lauv-lany-mean-it`

### Tips:
- Jika tidak ada cover yang cocok, biarkan `coverUrl` kosong (`""`) dan UI akan menampilkan placeholder otomatis
- Pastikan `audioUrl` dimulai dengan `/songs/` dan `coverUrl` dimulai dengan `/covers/`
- File cover `.webp` lebih ringan daripada `.png` atau `.jpg`
