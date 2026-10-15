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

export function LoginForm({ onLogin, isLoading = false, error = null }: LoginFormProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [touched, setTouched] = useState(false)

  const usernameError =
    !username.trim() ? 'Username / NIM wajib diisi.' : username.trim().length < 3 ? 'Minimal 3 karakter.' : ''
  const passwordError = !password ? 'Password wajib diisi.' : password.length < 4 ? 'Password minimal 4 karakter.' : ''
  const isValid = !usernameError && !passwordError

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setTouched(true)
    if (!isValid || isLoading) return
    await onLogin({ username: username.trim(), password })
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
          Username / NIM
        </label>
        <input
          id="username"
          type="text"
          autoComplete="username"
          placeholder="cth: admin / 202106070001"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isLoading}
          className="ds-input"
          aria-invalid={touched && !!usernameError}
        />
        {touched && usernameError && <p className="ds-input-error">{usernameError}</p>}
      </div>

      <div>
        <label htmlFor="password" className="ds-label ds-required">
          Password
        </label>
        <div style={{ position: 'relative' }}>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="Minimal 6 karakter"
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

      <button type="submit" disabled={isLoading || (touched && !isValid)} className="ds-btn ds-btn-primary ds-btn-block">
        {isLoading ? 'Memproses...' : 'Masuk'}
      </button>

      <p className="ds-caption" style={{ textAlign: 'center' }}>
        Metode: AHP + VIKOR &bull; Gunakan NIM untuk mahasiswa, username untuk admin
      </p>
    </form>
  )
}

export default LoginForm
