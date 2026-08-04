# Spec Board — Production Tracker

Web app React untuk tracking produksi per **Style → Body (Long/Regular/Short) → Size**,
dibandingkan otomatis dengan detail order. Jika hasil produksi masih kurang dari order,
selisihnya ditampilkan sebagai angka **minus berwarna merah**.

Stack: React + Vite + Tailwind, database **Firebase Firestore** (realtime), hosting **Cloudflare Pages**.

---

## 1. Cara kerja perhitungan

Setiap kombinasi **Style + Body + Size** dianggap satu baris:

```
Selisih = Total Produksi − Total Order
```

- `Selisih < 0` → **masih kurang** sebanyak angka tersebut (ditampilkan merah, dilingkari seperti coretan pena QC)
- `Selisih ≥ 0` → order **terpenuhi/lebih** (ditampilkan hijau dengan tanda ✓)

Data order bisa diinput lebih dari satu kali untuk kombinasi yang sama (misalnya ada revisi PO),
begitu juga input produksi bisa dicatat harian — sistem akan menjumlahkannya otomatis.

---

## 2. Setup Firebase (database + login)

1. Buka https://console.firebase.google.com → **Add project** → ikuti wizard (Google Analytics boleh dimatikan).
2. Di sidebar kiri, klik **Build → Firestore Database** → **Create database** → pilih mode **Production** → pilih lokasi server (misal `asia-southeast2` untuk Jakarta).
3. Buka tab **Rules** di Firestore, tempel isi file `firestore.rules` yang ada di project ini, lalu **Publish**.
4. Di sidebar kiri klik ikon gear ⚙️ → **Project settings** → scroll ke **Your apps** → klik ikon **Web (</>)** untuk mendaftarkan app baru.
5. Setelah didaftarkan, Firebase menampilkan objek `firebaseConfig` — salin nilai-nilainya.
6. Di folder project, copy `.env.example` menjadi `.env`, lalu isi semua `VITE_FIREBASE_...` sesuai nilai dari langkah 5.
7. **Aktifkan Login (Authentication)**: di sidebar kiri klik **Build → Authentication** → **Get started** → pilih provider **Email/Password** → aktifkan (toggle **Enable**) → **Save**.

### Membuat user pertama (King)

Karena aplikasi butuh minimal 1 akun dengan level **King** untuk mulai mengatur user lain, buat manual sekali di awal:

1. Di Firebase Console → **Authentication** → tab **Users** → **Add user** → isi email & password → **Add user**.
2. Salin **User UID** yang muncul di baris user tersebut.
3. Buka **Firestore Database** → **Start collection** → nama collection: `users`.
4. **Document ID**: paste UID dari langkah 2 (jangan pakai auto-ID).
5. Tambahkan field:
   - `name` (string) → nama Anda
   - `email` (string) → email yang sama seperti langkah 1
   - `role` (string) → ketik persis `King`
6. **Save**.

Setelah ini, login ke aplikasi pakai email/password tadi — Anda akan masuk sebagai **King** dan bisa membuat user lain lewat halaman **Kelola User** di aplikasi (tidak perlu ulangi langkah manual ini lagi untuk user berikutnya).

---

## 3. Sistem Level User (4 Role)

| Level | Ringkasan | Order | Input Produksi | Kelola User |
|---|:---:|:---:|:---:|:---:|
| **IE** | ✅ | ✅ | ✅ | ❌ |
| **Record** | ✅ | ✅ | ❌ | ❌ |
| **Operator** | ✅ | ❌ | ✅ | ❌ |
| **King** | ✅ | ✅ | ✅ | ✅ |

- Menu di Sidebar otomatis menyesuaikan sesuai level yang sedang login.
- Aturan ini juga ditegakkan di **Firestore Rules** (`firestore.rules`), jadi tidak bisa dilewati walau seseorang mencoba akses lewat cara lain di luar tampilan aplikasi.
- **King** membuat/mengatur user lewat halaman **Kelola User** di aplikasi — tidak perlu masuk ke Firebase Console lagi setelah setup awal.
- "Cabut akses" pada halaman Kelola User menghapus hak akses ke aplikasi, tapi akun login (email/password) tetap ada di Firebase Authentication — untuk menghapus akun login sepenuhnya, buka Firebase Console → Authentication → Users → hapus manual.

---

## 4. Cara jalankan di lokal

```bash
npm install
npm run dev
```

Buka `http://localhost:5173`, login pakai akun King yang sudah dibuat di langkah 2.

---

## 5. Deploy ke Cloudflare Pages

**Opsi A — via GitHub (disarankan, otomatis re-deploy tiap push):**

1. Push folder project ini ke repository GitHub baru.
2. Buka https://dash.cloudflare.com → **Workers & Pages** → **Create application** → tab **Pages** → **Connect to Git**.
3. Pilih repository-nya, lalu isi build settings:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. Di bagian **Environment variables**, tambahkan 6 variable yang sama seperti di `.env`:
   `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`,
   `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`.
5. Klik **Save and Deploy**. Setelah selesai, Cloudflare memberi URL `*.pages.dev` yang siap dipakai.

**Opsi B — via CLI (tanpa GitHub):**

```bash
npm install -g wrangler
npm run build
wrangler pages deploy dist --project-name=production-tracker
```

Saat deploy pertama kali, `wrangler` akan minta login ke akun Cloudflare kamu.
Environment variable tetap perlu diisi lewat dashboard Cloudflare Pages (Settings → Environment variables) agar terbaca saat build.

---

## 5. Setelah live: hubungkan domain Firebase agar bisa diakses

Firestore secara default bisa diakses dari domain manapun (tidak perlu whitelist domain khusus seperti Firebase Hosting). Jadi begitu `.pages.dev` sudah online dan environment variable terisi benar, app langsung tersambung ke database.

Jika nanti menambahkan **Firebase Authentication**, tambahkan domain Cloudflare Pages kamu (`xxxx.pages.dev` dan domain custom jika ada) ke **Authentication → Settings → Authorized domains**.

---

## 6. Struktur data Firestore

**Koleksi `orders`**
```
style: string        // "AW26-JKT-014"
body: string          // "Long" | "Regular" | "Short"
size: string           // "S", "M", "L", atau custom
qty: number
note: string | null
createdAt: timestamp
```

**Koleksi `productions`**
```
style: string
body: string
size: string
qty: number
date: string           // "2026-08-03"
note: string | null
createdAt: timestamp
```

---

## 7. Struktur project

```
src/
  App.jsx                    entry utama + routing tab
  firebase.js                inisialisasi Firestore
  hooks/useCollection.js     realtime listener Firestore
  utils/aggregate.js         logika agregasi & perhitungan selisih
  components/
    Sidebar.jsx
    Dashboard.jsx             ringkasan per style/body/size + badge minus
    DeficitBadge.jsx          indikator visual kurang/terpenuhi
    OrderForm.jsx / OrderList.jsx / OrdersPage.jsx
    ProductionForm.jsx / ProductionList.jsx / ProductionPage.jsx
```

---

## 8. Pengembangan lanjutan yang bisa ditambahkan

- Login (Firebase Auth) supaya tiap user/role (admin, QC, operator line) punya akses berbeda.
- Export ringkasan ke Excel/PDF.
- Riwayat perubahan (audit log) tiap kali order direvisi.
- Notifikasi otomatis (email/WhatsApp) saat mendekati deadline dan masih ada kekurangan qty.
