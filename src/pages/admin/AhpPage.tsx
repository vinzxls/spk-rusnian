import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { PairwiseMatrixForm } from '@/components/ahp/PairwiseMatrixForm'
import { useAuth } from '@/hooks/useAuth'
import { CRITERIA_LIST } from '@/types/ahp.types'

export function AhpPage() {
  const { hasRole } = useAuth()
  const [tersimpan, setTersimpan] = useState<string | null>(null)

  if (!hasRole('admin')) {
    return <p className="ds-text-danger">Akses ditolak</p>
  }

  return (
    <DashboardLayout
      role="admin"
      pageTitle="Pembobotan AHP"
      pageDesc="Input perbandingan berpasangan kriteria C1–C5 untuk menentukan bobot prioritas"
    >
      <div className="ds-alert ds-alert-info ds-mb-4">
        <div>
          <p className="ds-alert-title">Kenapa bobot penting?</p>
          <p className="ds-alert-body">
            Bobot dari halaman ini dipakai seluruh perhitungan VIKOR — halaman Ranking, Hasil
            Identifikasi, Rekap Kuesioner, dan Laporan. Bila belum pernah disimpan, sistem memakai
            bobot setara 0,2 untuk tiap kriteria.
          </p>
        </div>
      </div>

      {tersimpan && (
        <div className="ds-alert ds-alert-success ds-mb-4" role="status">
          <p className="ds-alert-body">{tersimpan}</p>
        </div>
      )}

      <PairwiseMatrixForm
        onSaved={(_w, konsisten) => {
          setTersimpan(
            konsisten
              ? 'Bobot AHP tersimpan dan konsisten (CR < 0,1). Semua halaman perhitungan sudah memakai bobot ini.'
              : 'Bobot AHP tersimpan, tetapi perbandingan belum konsisten (CR ≥ 0,1). Sebaiknya perbaiki input.'
          )
        }}
      />

      <div className="ds-card" style={{ marginTop: 16 }}>
        <div className="ds-card-header">
          <h3 className="ds-card-title">Kriteria yang Dibandingkan</h3>
        </div>
        <div className="ds-card-content">
          <div className="ds-table-wrapper">
            <table className="ds-table">
              <thead>
                <tr>
                  <th>Kode</th>
                  <th>Kriteria</th>
                  <th>Deskripsi</th>
                  <th>Tipe</th>
                </tr>
              </thead>
              <tbody>
                {CRITERIA_LIST.map((c) => (
                  <tr key={c.code}>
                    <td className="font-mono">{c.code}</td>
                    <td>{c.name}</td>
                    <td>{c.description}</td>
                    <td>
                      <span className="ds-badge ds-badge-neutral">Cost</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="ds-caption" style={{ marginTop: 12 }}>
            Semua kriteria bertipe <strong>cost</strong>: nilai semakin kecil berarti tingkat
            kecanduan semakin rendah, sehingga Q terkecil = peringkat 1.
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default AhpPage
