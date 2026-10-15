import { useState } from 'react'
import { LoginForm, type LoginCredentials } from '../../components/auth/LoginForm'

interface LoginPageProps {
  onLogin: (credentials: LoginCredentials) => Promise<boolean> | boolean
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (credentials: LoginCredentials) => {
    setIsLoading(true)
    setError(null)
    try {
      const ok = await onLogin(credentials)
      if (!ok) setError('Username / NIM atau password salah.')
      return ok as boolean
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login gagal. Coba lagi.')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
        background: 'var(--color-paper)',
      }}
    >
      <div className="ds-card" style={{ width: '100%', maxWidth: 440, overflow: 'hidden' }}>
        <div
          style={{
            padding: '28px 28px 16px',
            borderBottom: '1px solid var(--border)',
            background: 'var(--color-accent)',
            color: 'var(--color-accent-ink)',
          }}
        >
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div
              aria-hidden="true"
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: 'var(--color-accent-ink)',
                color: 'var(--color-accent)',
                display: 'grid',
                placeItems: 'center',
                fontWeight: 800,
              }}
            >
              SI
            </div>
            <div>
              <h1 className="ds-h3" style={{ color: 'var(--color-accent-ink)', margin: 0 }}>
                Sistem Identifikasi
              </h1>
              <p style={{ margin: 0, opacity: 0.9, fontSize: 12 }}>Kecanduan Media Sosial</p>
            </div>
          </div>
          <p style={{ margin: '10px 0 0', opacity: 0.85, fontSize: 13 }}>
            Ilmu Komputer — Universitas Pattimura • AHP + VIKOR
          </p>
        </div>
        <div className="ds-card-content">
          <LoginForm onLogin={handleLogin} isLoading={isLoading} error={error} />
          <p className="ds-caption" style={{ marginTop: 14, textAlign: 'center' }}>
            Demo — Admin: admin1 / demo • Mahasiswa: 202106070001 / demo
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
