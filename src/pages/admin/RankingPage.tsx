import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { RankingTable } from '@/components/admin/RankingTable'
import { useAuth } from '@/hooks/useAuth'
import { useHasilRanking } from '@/hooks/useHasilRanking'
import { CRITERIA_LIST } from '@/types/ahp.types'

const KRITERIA_KEYS = ['C1', 'C2', 'C3', 'C4', 'C5'] as const

export function RankingPage() {
  const { hasRole } = useAuth()
  const { hasil, loading, error, jumlahResponden, bobotDariAHP } = useHasilRanking()

  if (!hasRole('admin')) {
    return <p className="ds-text-danger">Akses ditolak</p>
  }

  return (
    <DashboardLayout
      role="admin"
      pageTitle="Ranking Mahasiswa"
      pageDesc="Perangkingan berdasarkan indeks Q VIKOR dengan bobot AHP"
    >
      {error && (
        <div className="ds-alert ds-alert-danger ds-mb-4" role="alert">
          <p className="ds-alert-body">{error}</p>
        </div>
      )}

      {!loading && (
        <div className={`ds-alert ${bobotDariAHP ? 'ds-alert-success' : 'ds-alert-warning'} ds-mb-4`}>
          <div>
            <p className="ds-alert-title">
              {bobotDariAHP ? 'Bobot AHP aktif' : 'Bobot masih setara (0,2)'}
            </p>
            <p className="ds-alert-body">
              {bobotDariAHP
                ? 'Perangkingan memakai bobot hasil perbandingan berpasangan yang Anda simpan.'
                : 'Isi perbandingan berpasangan di halaman Pembobotan AHP agar perangkingan memakai bobot sungguhan.'}
              {` Responden: ${jumlahResponden}.`}
            </p>
          </div>
        </div>
      )}

      <RankingTable
        ranking={hasil?.ranking ?? []}
        loading={loading}
        title="Tabel Ranking (Q terkecil = peringkat 1)"
      />

      <div className="ds-card" style={{ marginTop: 16 }}>
        <div className="ds-card-header">
          <h3 className="ds-card-title">Bobot yang Digunakan</h3>
        </div>
        <div className="ds-card-content">
          <div className="ds-table-wrapper">
            <table className="ds-table">
              <thead>
                <tr>
                  <th>Kode</th>
                  <th>Kriteria</th>
                  <th style={{ textAlign: 'right' }}>Bobot</th>
                  <th style={{ textAlign: 'right' }}>Persentase</th>
                </tr>
              </thead>
              <tbody>
                {CRITERIA_LIST.map((c) => {
                  const nilai = hasil?.bobotAHP[c.code as keyof typeof hasil.bobotAHP] ?? 0
                  return (
                    <tr key={c.code}>
                      <td className="font-mono">{c.code}</td>
                      <td>{c.name}</td>
                      <td style={{ textAlign: 'right' }} className="font-mono">
                        {typeof nilai === 'number' ? nilai.toFixed(4) : '-'}
                      </td>
                      <td style={{ textAlign: 'right' }} className="font-mono">
                        {typeof nilai === 'number' ? `${(nilai * 100).toFixed(2)}%` : '-'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p className="ds-caption" style={{ marginTop: 12 }}>
            {hasil
              ? `Dihitung pada ${new Date(hasil.computedAt).toLocaleString('id-ID')}.`
              : 'Belum ada perhitungan.'}{' '}
            Nilai kriteria adalah rata-rata 5 subkriteria (skala 1–5) per kriteria:{' '}
            {KRITERIA_KEYS.join(', ')}.
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default RankingPage
