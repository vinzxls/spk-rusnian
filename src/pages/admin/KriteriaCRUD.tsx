import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuth } from '@/hooks/useAuth'
import {
  loadKriteria,
  loadSubkriteria,
  nextKriteriaCode,
  resetKriteria,
  resetSubkriteria,
  saveKriteria,
  saveSubkriteria,
  validateKriteria,
  validateSubkriteria,
  type KriteriaItem,
  type SubkriteriaItem,
} from '@/services/kriteria-store'

type Tab = 'kriteria' | 'subkriteria'

const SUBKRITERIA_BARU = (items: SubkriteriaItem[]) => ({
  code: `A${items.length + 1}`,
  label: '',
  nilai: 3,
})

export function KriteriaCRUD() {
  const { hasRole } = useAuth()

  /**
   * Tab disimpan di query string (?tab=subkriteria), bukan state lokal.
   * Dengan begitu pilihan tab tidak hilang saat halaman di-refresh atau
   * komponen di-remount — sebelumnya klik terasa "tidak berpengaruh".
   */
  const [searchParams, setSearchParams] = useSearchParams()
  const tab: Tab = searchParams.get('tab') === 'subkriteria' ? 'subkriteria' : 'kriteria'
  const setTab = (next: Tab) => {
    setSearchParams(next === 'subkriteria' ? { tab: 'subkriteria' } : {}, { replace: true })
  }

  const [kriteria, setKriteria] = useState<KriteriaItem[]>([])
  const [subkriteria, setSubkriteria] = useState<SubkriteriaItem[]>([])

  const [pesan, setPesan] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [adaPerubahan, setAdaPerubahan] = useState(false)

  // Muat data tersimpan sekali saat halaman dibuka.
  useEffect(() => {
    setKriteria(loadKriteria())
    setSubkriteria(loadSubkriteria())
  }, [])

  if (!hasRole('admin')) {
    return <p className="ds-text-danger">Akses ditolak</p>
  }

  const ubahKriteria = (index: number, patch: Partial<KriteriaItem>) => {
    setKriteria((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)))
    setAdaPerubahan(true)
    setPesan(null)
    setError(null)
  }

  const ubahSubkriteria = (index: number, patch: Partial<SubkriteriaItem>) => {
    setSubkriteria((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)))
    setAdaPerubahan(true)
    setPesan(null)
    setError(null)
  }

  const tambahKriteria = () => {
    setKriteria((prev) => [
      ...prev,
      { code: nextKriteriaCode(prev), name: '', description: '' },
    ])
    setAdaPerubahan(true)
    setPesan('Baris kriteria baru ditambahkan. Isi nama lalu klik Simpan.')
    setError(null)
  }

  const tambahSubkriteria = () => {
    setSubkriteria((prev) => [...prev, SUBKRITERIA_BARU(prev)])
    setAdaPerubahan(true)
    setPesan('Baris subkriteria baru ditambahkan. Isi label lalu klik Simpan.')
    setError(null)
  }

  const hapusKriteria = (index: number) => {
    const item = kriteria[index]
    if (!window.confirm(`Hapus kriteria ${item.code} (${item.name || 'tanpa nama'})?`)) return
    setKriteria((prev) => prev.filter((_, i) => i !== index))
    setAdaPerubahan(true)
    setPesan(`Kriteria ${item.code} dihapus dari daftar. Klik Simpan untuk menyimpan permanen.`)
    setError(null)
  }

  const hapusSubkriteria = (index: number) => {
    const item = subkriteria[index]
    if (!window.confirm(`Hapus subkriteria ${item.code} (${item.label || 'tanpa label'})?`)) return
    setSubkriteria((prev) => prev.filter((_, i) => i !== index))
    setAdaPerubahan(true)
    setPesan(`Subkriteria ${item.code} dihapus dari daftar. Klik Simpan untuk menyimpan permanen.`)
    setError(null)
  }

  const simpan = (e?: FormEvent) => {
    e?.preventDefault()
    setPesan(null)
    setError(null)

    if (tab === 'kriteria') {
      const hasil = validateKriteria(kriteria)
      if (!hasil.ok) {
        setError(hasil.error ?? 'Data kriteria belum valid.')
        return
      }
      const bersih = kriteria.map((item) => ({
        ...item,
        code: item.code.trim().toUpperCase(),
        name: item.name.trim(),
        description: item.description.trim(),
      }))
      saveKriteria(bersih)
      setKriteria(loadKriteria())
      setPesan(`Perubahan kriteria tersimpan (${bersih.length} kriteria).`)
    } else {
      const hasil = validateSubkriteria(subkriteria)
      if (!hasil.ok) {
        setError(hasil.error ?? 'Data subkriteria belum valid.')
        return
      }
      const bersih = subkriteria.map((item) => ({
        ...item,
        code: item.code.trim().toUpperCase(),
        label: item.label.trim(),
        nilai: Math.min(5, Math.max(1, Math.round(item.nilai))),
      }))
      saveSubkriteria(bersih)
      setSubkriteria(loadSubkriteria())
      setPesan(`Perubahan subkriteria tersimpan (${bersih.length} subkriteria).`)
    }

    setAdaPerubahan(false)
  }

  const reset = () => {
    const label = tab === 'kriteria' ? 'kriteria' : 'subkriteria'
    if (!window.confirm(`Kembalikan daftar ${label} ke pengaturan awal?`)) return

    if (tab === 'kriteria') {
      setKriteria(resetKriteria())
    } else {
      setSubkriteria(resetSubkriteria())
    }
    setAdaPerubahan(false)
    setError(null)
    setPesan(`Daftar ${label} dikembalikan ke pengaturan awal.`)
  }

  return (
    <DashboardLayout
      role="admin"
      pageTitle="Kriteria & Subkriteria"
      pageDesc="Pengelolaan kriteria penelitian AHP + VIKOR"
    >
      <div className="ds-flex ds-gap-2 ds-mb-4" style={{ flexWrap: 'wrap' }}>
        <button
          type="button"
          className={`ds-btn ds-btn-sm ${tab === 'kriteria' ? 'ds-btn-primary' : 'ds-btn-secondary'}`}
          aria-pressed={tab === 'kriteria'}
          onClick={() => {
            setTab('kriteria')
            setPesan(null)
            setError(null)
          }}
        >
          Kelola Kriteria
        </button>
        <button
          type="button"
          className={`ds-btn ds-btn-sm ${tab === 'subkriteria' ? 'ds-btn-primary' : 'ds-btn-secondary'}`}
          aria-pressed={tab === 'subkriteria'}
          onClick={() => {
            setTab('subkriteria')
            setPesan(null)
            setError(null)
          }}
        >
          Kelola Subkriteria
        </button>
      </div>

      <form onSubmit={simpan}>
        <div className="ds-card">
          <div className="ds-card-header" style={{ flexWrap: 'wrap' }}>
            <div>
              <h3 className="ds-card-title">
                {tab === 'kriteria' ? 'Kriteria (C1–C5)' : 'Subkriteria (A1–A5)'}
              </h3>
              <p className="ds-card-description">
                {tab === 'kriteria'
                  ? 'Ubah nama/deskripsi langsung di tabel, lalu klik Simpan Perubahan.'
                  : 'Atur label dan nilai skala 1–5 untuk setiap subkriteria, lalu klik Simpan Perubahan.'}
              </p>
            </div>
            <div className="ds-flex ds-gap-2" style={{ flexWrap: 'wrap' }}>
              <button
                type="button"
                className="ds-btn ds-btn-secondary ds-btn-sm"
                onClick={tab === 'kriteria' ? tambahKriteria : tambahSubkriteria}
              >
                {tab === 'kriteria' ? '+ Tambah Kriteria' : '+ Tambah Subkriteria'}
              </button>
              <button type="button" className="ds-btn ds-btn-ghost ds-btn-sm" onClick={reset}>
                Reset Default
              </button>
              <button type="submit" className="ds-btn ds-btn-primary ds-btn-sm" disabled={!adaPerubahan}>
                Simpan Perubahan
              </button>
            </div>
          </div>

          <div className="ds-card-content">
            {pesan && (
              <div className="ds-alert ds-alert-success ds-mb-4" role="status">
                <p className="ds-alert-body">{pesan}</p>
              </div>
            )}
            {error && (
              <div className="ds-alert ds-alert-danger ds-mb-4" role="alert">
                <p className="ds-alert-body">{error}</p>
              </div>
            )}

            {tab === 'kriteria' ? (
              <div className="ds-table-wrapper">
                <table className="ds-table">
                  <thead>
                    <tr>
                      <th style={{ width: 90 }}>Kode</th>
                      <th style={{ width: 200 }}>Nama Kriteria</th>
                      <th>Deskripsi</th>
                      <th style={{ width: 90, textAlign: 'right' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kriteria.length === 0 && (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center' }}>
                          Belum ada kriteria. Klik &quot;+ Tambah Kriteria&quot;.
                        </td>
                      </tr>
                    )}
                    {kriteria.map((item, index) => (
                      <tr key={`${item.code}-${index}`}>
                        <td>
                          <input
                            className="ds-input ds-mono"
                            aria-label={`Kode kriteria baris ${index + 1}`}
                            value={item.code}
                            onChange={(e) => ubahKriteria(index, { code: e.target.value })}
                          />
                        </td>
                        <td>
                          <input
                            className="ds-input"
                            aria-label={`Nama kriteria ${item.code}`}
                            value={item.name}
                            placeholder="Nama kriteria"
                            onChange={(e) => ubahKriteria(index, { name: e.target.value })}
                          />
                        </td>
                        <td>
                          <input
                            className="ds-input"
                            aria-label={`Deskripsi kriteria ${item.code}`}
                            value={item.description}
                            placeholder="Deskripsi singkat"
                            onChange={(e) => ubahKriteria(index, { description: e.target.value })}
                          />
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            className="ds-btn ds-btn-danger ds-btn-sm"
                            onClick={() => hapusKriteria(index)}
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="ds-table-wrapper">
                <table className="ds-table">
                  <thead>
                    <tr>
                      <th style={{ width: 90 }}>Kode</th>
                      <th style={{ width: 220 }}>Label</th>
                      <th style={{ width: 130 }}>Nilai Skala</th>
                      <th>Berlaku Untuk</th>
                      <th style={{ width: 90, textAlign: 'right' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subkriteria.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center' }}>
                          Belum ada subkriteria. Klik &quot;+ Tambah Subkriteria&quot;.
                        </td>
                      </tr>
                    )}
                    {subkriteria.map((item, index) => (
                      <tr key={`${item.code}-${index}`}>
                        <td>
                          <input
                            className="ds-input ds-mono"
                            aria-label={`Kode subkriteria baris ${index + 1}`}
                            value={item.code}
                            onChange={(e) => ubahSubkriteria(index, { code: e.target.value })}
                          />
                        </td>
                        <td>
                          <input
                            className="ds-input"
                            aria-label={`Label subkriteria ${item.code}`}
                            value={item.label}
                            placeholder="Label subkriteria"
                            onChange={(e) => ubahSubkriteria(index, { label: e.target.value })}
                          />
                        </td>
                        <td>
                          <select
                            className="ds-select"
                            aria-label={`Nilai skala subkriteria ${item.code}`}
                            value={item.nilai}
                            onChange={(e) =>
                              ubahSubkriteria(index, { nilai: Number(e.target.value) })
                            }
                          >
                            {[1, 2, 3, 4, 5].map((n) => (
                              <option key={n} value={n}>
                                {n}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="ds-text-muted">
                          {kriteria.map((k) => k.code).join(', ') || 'C1, C2, C3, C4, C5'}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            className="ds-btn ds-btn-danger ds-btn-sm"
                            onClick={() => hapusSubkriteria(index)}
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <p className="ds-caption" style={{ marginTop: 12 }}>
              {adaPerubahan
                ? 'Ada perubahan yang belum disimpan.'
                : 'Semua perubahan tersimpan di perangkat ini (localStorage).'}
            </p>
          </div>
        </div>
      </form>

      <div className="ds-card" style={{ marginTop: 16 }}>
        <div className="ds-card-header">
          <h3 className="ds-card-title">Penjelasan</h3>
        </div>
        <div className="ds-card-content">
          <p className="ds-body-sm">
            Kriteria C1 (Durasi), C2 (Frekuensi), C3 (Ketergantungan), C4 (Gangguan Akademik), C5
            (Fear of Missing Out). Setiap kriteria memiliki 5 subkriteria A1 (Sangat Rendah) hingga A5
            (Sangat Tinggi) berdasarkan skala penelitian.
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default KriteriaCRUD
