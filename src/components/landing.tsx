import { Link } from 'react-router-dom'

export function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-paper)' }}>
      <header
        style={{
          padding: '20px var(--space-lg)',
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--color-rule)',
        }}
      >
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'var(--color-accent)',
              color: 'var(--color-accent-ink)',
              display: 'grid',
              placeItems: 'center',
              fontWeight: 700,
              letterSpacing: '-0.02em',
            }}
          >
            SI
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--color-ink)', letterSpacing: '-0.02em' }}>
              Sistem Identifikasi
            </p>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-ink-2)' }}>
              Kecanduan Media Sosial Unpatti
            </p>
          </div>
        </div>
        <nav style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <a href="#panduan" style={{ fontSize: '0.875rem', color: 'var(--color-ink-2)', padding: '6px 12px', textDecoration: 'none' }}>
            Panduan
          </a>
          <Link to="/login" className="ds-btn ds-btn-primary">Masuk</Link>
        </nav>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: 'var(--space-xl) var(--space-lg)' }}>
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 0.8fr)',
            gap: 'var(--space-lg)',
            alignItems: 'end',
            padding: 'var(--space-2xl) 0 var(--space-2xl)',
          }}
        >
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                margin: '0 0 12px',
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--color-accent)',
              }}
            >
              AHP + VIKOR
            </p>
            <h1
              style={{
                margin: 0,
                fontSize: 'clamp(2rem, 5vw + 0.5rem, 3.5rem)',
                lineHeight: 1.05,
                fontWeight: 700,
                letterSpacing: '-0.035em',
                color: 'var(--color-ink)',
                overflowWrap: 'anywhere',
                minWidth: 0,
              }}
            >
              Identifikasi Tingkat Kecanduan Media Sosial
            </h1>
          </div>
          <div style={{ minWidth: 0, borderLeft: '1px solid var(--color-rule)', paddingLeft: 'var(--space-lg)' }}>
            <p style={{ margin: 0, fontSize: '1rem', lineHeight: 1.6, color: 'var(--color-ink-2)' }}>
              Sistem pendukung keputusan berbasis <strong style={{ color: 'var(--color-ink)' }}>AHP</strong> untuk
              pembobotan kriteria dan <strong style={{ color: 'var(--color-ink)' }}>VIKOR</strong> untuk perangkingan
              tingkat kecanduan media sosial pada mahasiswa Ilmu Komputer Universitas Pattimura.
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
              <Link to="/login" className="ds-btn ds-btn-primary ds-btn-lg">Masuk ke Sistem</Link>
              <Link to="#panduan" className="ds-btn ds-btn-secondary ds-btn-lg">Panduan Pengisian</Link>
            </div>
          </div>
        </section>

        <section style={{ marginTop: 'var(--space-xl)' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)',
              gap: '1px',
              background: 'var(--color-rule)',
              border: '1px solid var(--color-rule)',
              borderRadius: 'var(--radius-card)',
              overflow: 'hidden',
            }}
          >
            <div style={{ background: 'var(--color-paper)', padding: 'var(--space-md)' }}>
              <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-accent)' }}>
                5 Kriteria
              </p>
              <ul style={{ margin: '8px 0 0', paddingLeft: 0, listStyle: 'none', lineHeight: 1.8, fontSize: '0.875rem', color: 'var(--color-ink)' }}>
                <li>Durasi Penggunaan</li>
                <li>Frekuensi Penggunaan</li>
                <li>Ketergantungan Psikologis</li>
                <li>Gangguan Akademik</li>
                <li>Fear of Missing Out</li>
              </ul>
            </div>
            <div style={{ background: 'var(--color-paper)', padding: 'var(--space-md)' }}>
              <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-accent)' }}>
                Metode
              </p>
              <p style={{ margin: '8px 0 0', fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--color-ink-2)' }}>
                Bobot prioritas dari perbandingan berpasangan → perangkingan Q → kategori kecanduan
              </p>
            </div>
            <div style={{ background: 'var(--color-paper)', padding: 'var(--space-md)' }}>
              <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-accent)' }}>
                Dua Role
              </p>
              <ul style={{ margin: '8px 0 0', paddingLeft: 0, listStyle: 'none', lineHeight: 1.8, fontSize: '0.875rem', color: 'var(--color-ink)' }}>
                <li>Admin: kelola data & hitung</li>
                <li>Mahasiswa: isi kuesioner</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="panduan" style={{ marginTop: 'var(--space-2xl)', paddingTop: 'var(--space-xl)', borderTop: '1px solid var(--color-rule)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 0.4fr) minmax(0, 0.6fr)', gap: 'var(--space-lg)' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--color-ink)' }}>
                Panduan Cepat
              </h2>
              <p style={{ margin: '8px 0 0', fontSize: '0.875rem', color: 'var(--color-ink-2)' }}>
                Enam langkah dari login sampai laporan.
              </p>
            </div>
            <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                ['Login', 'dengan akun Admin atau NIM Mahasiswa'],
                ['Admin', 'kelola Kriteria & Subkriteria (C1–C5, A1–A5)'],
                ['Admin', 'input perbandingan berpasangan, hitung bobot AHP (CR < 0.1)'],
                ['Mahasiswa', 'isi kuesioner 5 kriteria × 5 subkriteria (skala 1–5)'],
                ['Admin', 'jalankan VIKOR untuk ranking & kategori kecanduan'],
                ['Admin', 'cetak laporan (PDF/HTML) untuk rekap hasil'],
              ].map(([who, desc], i) => (
                <li
                  key={i}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 0.15fr) minmax(0, 0.25fr) minmax(0, 0.6fr)',
                    gap: 'var(--space-sm)',
                    padding: '12px 0',
                    borderBottom: i < 5 ? '1px solid var(--color-rule)' : 'none',
                    fontSize: '0.875rem',
                    alignItems: 'baseline',
                  }}
                >
                  <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>{String(i + 1).padStart(2, '0')}</span>
                  <span style={{ color: 'var(--color-ink)', fontWeight: 600 }}>{who}</span>
                  <span style={{ color: 'var(--color-ink-2)' }}>{desc}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>

      <footer
        style={{
          padding: 'var(--space-md) var(--space-lg)',
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          gap: 'var(--space-sm)',
          flexWrap: 'wrap',
          borderTop: '1px solid var(--color-rule)',
          fontSize: '0.75rem',
          color: 'var(--color-ink-2)',
        }}
      >
        <span>Sistem Identifikasi Tingkat Kecanduan Media Sosial © 2026</span>
        <span>Ilmu Komputer Universitas Pattimura · AHP + VIKOR</span>
      </footer>
    </div>
  )
}