/** Tipe-tipe domain auth & mahasiswa — konsisten ERD */
export type UserRole = 'admin' | 'mahasiswa';

/** User dari tabel `users` */
export interface User {
  id: string;                // UUID
  username: string;          // unik, untuk admin login
  password_hash: string;     // bcrypt hash
  role: UserRole;
  nama_lengkap?: string;
  created_at: string;        // ISO timestamp
  updated_at: string;
}

/** Mahasiswa dari tabel `mahasiswa` */
export interface Mahasiswa {
  id: string;                // UUID
  nim: string;               // unik, NIM 10-12 digit
  nama: string;
  prodi: string;
  angkatan: number;
  user_id: string;           // FK → users.id
  created_at: string;
  updated_at: string;
}

/** Sesi autentikasi aktif (di memori / localStorage) */
export interface AuthSession {
  user: User;
  mahasiswa?: Mahasiswa;     // hanya terisi bila role === 'mahasiswa'
  access_token?: string;     // optional JWT placeholder
  expires_at?: string;       // ISO timestamp
}

/** Input login dari form */
export interface LoginCredentials {
  username: string;          // username (admin) atau NIM (mahasiswa)
  password: string;          // plaintext dari user
}

/** Hasil login sukses */
export interface LoginResult {
  success: true;
  session: AuthSession;
}

/** Hasil login gagal */
export interface LoginFailure {
  success: false;
  error: {
    code: 'INVALID_CREDENTIALS' | 'USER_NOT_FOUND' | 'SERVER_ERROR';
    message: string;
  };
}

/** Union untuk return type login */
export type LoginResponse = LoginResult | LoginFailure;