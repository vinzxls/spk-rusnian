import { useState } from 'react'
import type { FormEvent } from 'react'

export type LoginCredentials = {
  username: string
  password: string
}

interface LoginFormProps {
  onLogin: (credentials: LoginCredentials) => Promise<boolean> | boolean
  isLoading?: boolean
  error?: string | null
}

/** Sama dengan aturan di auth.service: 8–15 digit dianggap NIM. */
const POLA_NIM = /^\d{8,15}$/

export function LoginForm({ onLogin, isLoading = false, error = null }: LoginFormProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [touched, setTouched] = useState(false)

  const identitas = username.trim()
  // Mahasiswa cukup NIM — kolom password disembunyikan agar tidak membingungkan.
  const perluPassword = identitas !== '' && !POLA_NIM.test(identitas)

  const usernameError = !identitas ? 'NIM atau username wajib diisi.' : ''
  const passwordError = perluPassword && !password ? 'Password wajib diisi.' : ''
  const isValid = !usernameError && !passwordError

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setTouched(true)
    if (!isValid || isLoading) return
    // Password hanya dikirim bila memang diperlukan (akun admin).
    await onLogin({ username: identitas, password: perluPassword ? password : '' })
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="ds-flex ds-flex-col ds-gap-4">
      {error && (
        <div role="alert" className="ds-alert ds-alert-danger">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="username" className="ds-label ds-required">
          NIM atau Username
        </label>
        <input
          id="username"
          type="text"
          inputMode="text"
          autoComplete="username"
          placeholder="cth: 202106070001"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isLoading}
          className="ds-input"
          aria-invalid={touched && !!usernameError}
          aria-describedby="username-hint"
        />
        <p id="username-hint" className="ds-caption" style={{ marginTop: 6 }}>
          {perluPassword
            ? 'Akun admin — masukkan password.'
            : 'Mahasiswa cukup memasukkan NIM, tanpa password.'}
        </p>
        {touched && usernameError && <p className="ds-input-error">{usernameError}</p>}
      </div>

      {perluPassword && (
        <div>
          <label htmlFor="password" className="ds-label ds-required">
            Password
          </label>
          <div style={{ position: 'relative' }}>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Password admin"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="ds-input"
              aria-invalid={touched && !!passwordError}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              disabled={isLoading}
              aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              className="ds-btn ds-btn-ghost ds-btn-sm"
              style={{ position: 'absolute', right: 6, top: 4 }}
            >
              {showPassword ? 'Sembunyi' : 'Lihat'}
            </button>
          </div>
          {touched && passwordError && <p className="ds-input-error">{passwordError}</p>}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || (touched && !isValid)}
        className="ds-btn ds-btn-primary ds-btn-block"
      >
        {isLoading ? 'Memproses...' : 'Masuk'}
      </button>

      <p className="ds-caption" style={{ textAlign: 'center' }}>
        Metode: AHP + VIKOR
      </p>
    </form>
  )
}

export default LoginForm
