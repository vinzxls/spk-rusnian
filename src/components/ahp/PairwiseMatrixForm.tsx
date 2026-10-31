/**
 * PairwiseMatrixForm — input perbandingan berpasangan AHP (C1–C5).
 *
 * 10 pasangan diisi dengan skala Saaty 1/9 … 9. Setelah dihitung, komponen
 * menampilkan matriks lengkap, bobot prioritas, dan uji konsistensi, lalu
 * menyimpan hasilnya lewat `ahp-store` agar dipakai halaman Ranking, Laporan,
 * dan Rekap Kuesioner.
 */
import { useEffect, useMemo, useState } from 'react'
import type { CriteriaWeight, PairwiseComparison, ScaleSaaty } from '../../types/ahp.types'
import { CRITERIA_LIST } from '../../types/ahp.types'
import { computeAHP } from '../../utils/ahp-calculator'
import { DEFAULT_COMPARISONS, loadAhp, saveAhp, resetAhp } from '../../services/ahp-store'

type PairKey = keyof PairwiseComparison

const PAIRS: { key: PairKey; a: string; b: string }[] = [
  { key: 'C1_C2', a: 'C1', b: 'C2' },
  { key: 'C1_C3', a: 'C1', b: 'C3' },
  { key: 'C1_C4', a: 'C1', b: 'C4' },
  { key: 'C1_C5', a: 'C1', b: 'C5' },
  { key: 'C2_C3', a: 'C2', b: 'C3' },
  { key: 'C2_C4', a: 'C2', b: 'C4' },
  { key: 'C2_C5', a: 'C2', b: 'C5' },
  { key: 'C3_C4', a: 'C3', b: 'C4' },
  { key: 'C3_C5', a: 'C3', b: 'C5' },
  { key: 'C4_C5', a: 'C4', b: 'C5' },
]

/** Skala Saaty lengkap (1/9 … 9) dengan label makna. */
const OPSI_SAATY: { value: number; label: string }[] = [
  { value: 1 / 9, label: '1/9 — mutlak kurang penting' },
  { value: 1 / 8, label: '1/8 — antara mutlak dan sangat kurang' },
  { value: 1 / 7, label: '1/7 — sangat kurang penting' },
  { value: 1 / 6, label: '1/6 — antara sangat dan lebih kurang' },
  { value: 1 / 5, label: '1/5 — lebih kurang penting' },
  { value: 1 / 4, label: '1/4 — antara lebih dan sedikit kurang' },
  { value: 1 / 3, label: '1/3 — sedikit kurang penting' },
  { value: 1 / 2, label: '1/2 — antara sedikit kurang dan sama' },
  { value: 1, label: '1 — sama penting' },
  { value: 2, label: '2 — antara sama dan sedikit lebih' },
  { value: 3, label: '3 — sedikit lebih penting' },
  { value: 4, label: '4 — antara sedikit dan lebih penting' },
  { value: 5, label: '5 — lebih penting' },
  { value: 6, label: '6 — antara lebih dan sangat lebih' },
  { value: 7, label: '7 — sangat lebih penting' },
  { value: 8, label: '8 — antara sangat dan mutlak' },
  { value: 9, label: '9 — mutlak lebih penting' },
]

const namaKriteria = (kode: string) =>
  CRITERIA_LIST.find((c) => c.code === kode)?.name ?? kode

interface Props {
  /** Dipanggil setelah bobot disimpan, mis. untuk memuat ulang halaman induk. */
  onSaved?: (weights: CriteriaWeight, konsisten: boolean) => void
}

export function PairwiseMatrixForm({ onSaved }: Props) {
  const [comp, setComp] = useState<PairwiseComparison>(DEFAULT_COMPARISONS)
  const [tersimpan, setTersimpan] = useState<string | null>(null)

  // Muat input yang pernah disimpan admin.
  useEffect(() => {
    const state = loadAhp()
    if (state) {
      setComp(state.comparisons)
      setTersimpan(state.savedAt)
    }
  }, [])

  const hasil = useMemo(() => computeAHP(comp), [comp])
  const { weights, consistency, pairwiseMatrix, normalizedMatrix } = hasil
  const totalBobot = weights.C1 + weights.C2 + weights.C3 + weights.C4 + weights.C5

  const ubah = (key: PairKey, value: number) => {
    setComp((prev) => ({ ...prev, [key]: value as ScaleSaaty }))
  }

  const simpan = () => {
    const state = saveAhp(comp)
    setTersimpan(state.savedAt)
    onSaved?.(state.weights, state.consistency.isConsistent)
  }

  const reset = () => {
    if (!window.confirm('Kembalikan semua perbandingan ke nilai 1 (sama penting)?')) return
    setComp(DEFAULT_COMPARISONS)
    resetAhp()
    setTersimpan(null)
  }

  return (
    <div className="ds-flex ds-flex-col ds-gap-4">
      <div className="ds-card">
        <div className="ds-card-header" style={{ flexWrap: 'wrap' }}>
          <div>
            <h3 className="ds-card-title">Perbandingan Berpasangan</h3>
            <p className="ds-card-description">
              Bandingkan tiap pasangan kriteria. Nilai kiri menunjukkan kriteria A lebih penting
              daripada kriteria B.
            </p>
          </div>
          <span
            className={`ds-badge ${consistency.isConsistent ? 'ds-badge-success' : 'ds-badge-danger'}`}
            role="status"
          >
            {consistency.isConsistent ? 'Konsisten' : 'Tidak konsisten'} · CR{' '}
            {consistency.CR.toFixed(4)}
          </span>
        </div>

        <div className="ds-card-content">
          <div className="ds-grid ds-grid-2 ds-gap-4">
            {PAIRS.map(({ key, a, b }) => (
              <div key={key}>
                <label className="ds-label" htmlFor={`pair-${key}`}>
                  {a} {namaKriteria(a)} vs {b} {namaKriteria(b)}
                </label>
                <select
                  id={`pair-${key}`}
                  className="ds-select"
                  value={String(comp[key])}
                  onChange={(e) => ubah(key, Number(e.target.value))}
                >
                  {OPSI_SAATY.map((o) => (
                    <option key={o.value} value={String(o.value)}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div className="ds-flex ds-gap-2 ds-mt-6" style={{ flexWrap: 'wrap' }}>
            <button type="button" className="ds-btn ds-btn-primary" onClick={simpan}>
              Hitung &amp; Simpan Bobot
            </button>
            <button type="button" className="ds-btn ds-btn-secondary" onClick={reset}>
              Reset ke Sama Penting
            </button>
            {tersimpan && (
              <span className="ds-caption" style={{ alignSelf: 'center' }}>
                Tersimpan: {new Date(tersimpan).toLocaleString('id-ID')}
              </span>
            )}
          </div>

          {!consistency.isConsistent && (
            <div className="ds-alert ds-alert-warning ds-mt-4" role="alert">
              <div>
                <p className="ds-alert-title">CR {consistency.CR.toFixed(4)} ≥ 0,1</p>
                <p className="ds-alert-body">
                  Perbandingan belum konsisten. Perbaiki nilai pada pasangan yang paling berbeda
                  agar CR di bawah 0,1. Bobot tetap bisa disimpan, tetapi hasilnya kurang dapat
                  dipertanggungjawabkan.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="ds-grid ds-grid-2 ds-gap-4">
        <div className="ds-card">
          <div className="ds-card-header">
            <h3 className="ds-card-title">Bobot Prioritas</h3>
          </div>
          <div className="ds-card-content">
            <div className="ds-table-wrapper">
              <table className="ds-table">
                <thead>
                  <tr>
                    <th>Kode</th>
                    <th>Kriteria</th>
                    <th style={{ textAlign: 'right' }}>Bobot</th>
                    <th style={{ textAlign: 'right' }}>%</th>
                  </tr>
                </thead>
                <tbody>
                  {CRITERIA_LIST.map((c) => {
                    const nilai = weights[c.code as 'C1' | 'C2' | 'C3' | 'C4' | 'C5']
                    return (
                      <tr key={c.code}>
                        <td className="font-mono">{c.code}</td>
                        <td>{c.name}</td>
                        <td style={{ textAlign: 'right' }} className="font-mono">
                          {nilai.toFixed(4)}
                        </td>
                        <td style={{ textAlign: 'right' }} className="font-mono">
                          {(nilai * 100).toFixed(2)}%
                        </td>
                      </tr>
                    )
                  })}
                  <tr>
                    <td colSpan={2}>
                      <strong>Total</strong>
                    </td>
                    <td style={{ textAlign: 'right' }} className="font-mono">
                      <strong>{totalBobot.toFixed(4)}</strong>
                    </td>
                    <td style={{ textAlign: 'right' }} className="font-mono">
                      <strong>100%</strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="ds-card">
          <div className="ds-card-header">
            <h3 className="ds-card-title">Uji Konsistensi</h3>
          </div>
          <div className="ds-card-content">
            <table className="ds-table">
              <tbody>
                <tr>
                  <td>λ max</td>
                  <td style={{ textAlign: 'right' }} className="font-mono">
                    {consistency.lambdaMax.toFixed(4)}
                  </td>
                </tr>
                <tr>
                  <td>CI = (λmax − n) / (n − 1)</td>
                  <td style={{ textAlign: 'right' }} className="font-mono">
                    {consistency.CI.toFixed(6)}
                  </td>
                </tr>
                <tr>
                  <td>RI (n = 5)</td>
                  <td style={{ textAlign: 'right' }} className="font-mono">
                    {consistency.RI.toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td>CR = CI / RI</td>
                  <td style={{ textAlign: 'right' }} className="font-mono">
                    {consistency.CR.toFixed(4)}
                  </td>
                </tr>
                <tr>
                  <td>Syarat konsisten</td>
                  <td style={{ textAlign: 'right' }}>CR &lt; 0,1</td>
                </tr>
                <tr>
                  <td>Status</td>
                  <td style={{ textAlign: 'right' }}>
                    <span
                      className={`ds-badge ${
                        consistency.isConsistent ? 'ds-badge-success' : 'ds-badge-danger'
                      }`}
                    >
                      {consistency.isConsistent ? 'Konsisten' : 'Tidak konsisten'}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="ds-card">
        <div className="ds-card-header">
          <h3 className="ds-card-title">Matriks Perbandingan (5×5)</h3>
        </div>
        <div className="ds-card-content">
          <div className="ds-table-wrapper">
            <table className="ds-table">
              <thead>
                <tr>
                  <th>Kriteria</th>
                  {CRITERIA_LIST.map((c) => (
                    <th key={c.code} style={{ textAlign: 'right' }}>
                      {c.code}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pairwiseMatrix.map((row, i) => (
                  <tr key={CRITERIA_LIST[i].code}>
                    <td className="font-mono">{CRITERIA_LIST[i].code}</td>
                    {row.map((v, j) => (
                      <td key={j} style={{ textAlign: 'right' }} className="font-mono">
                        {v < 1 ? `1/${Math.round(1 / v)}` : v.toFixed(2)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="ds-caption ds-mt-4">
            Matriks ternormalisasi (setiap sel dibagi jumlah kolomnya):
          </p>
          <div className="ds-table-wrapper ds-mt-2">
            <table className="ds-table">
              <thead>
                <tr>
                  <th>Kriteria</th>
                  {CRITERIA_LIST.map((c) => (
                    <th key={c.code} style={{ textAlign: 'right' }}>
                      {c.code}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {normalizedMatrix.map((row, i) => (
                  <tr key={CRITERIA_LIST[i].code}>
                    <td className="font-mono">{CRITERIA_LIST[i].code}</td>
                    {row.map((v, j) => (
                      <td key={j} style={{ textAlign: 'right' }} className="font-mono">
                        {v.toFixed(4)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PairwiseMatrixForm
