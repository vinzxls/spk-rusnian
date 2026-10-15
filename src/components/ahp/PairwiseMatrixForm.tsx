import { useState } from 'react'
import type { PairwiseComparison, CriteriaWeight, ConsistencyTest } from '../../types/ahp.types'
import * as ahpService from '../../services/ahp.service'

type PairKey = keyof PairwiseComparison

const PAIRS: { key: PairKey; label: string }[] = [
  { key: 'C1_C2', label: 'C1 Durasi vs C2 Frekuensi' },
  { key: 'C1_C3', label: 'C1 Durasi vs C3 Ketergantungan' },
  { key: 'C1_C4', label: 'C1 Durasi vs C4 Gangguan Akademik' },
  { key: 'C1_C5', label: 'C1 Durasi vs C5 FoMO' },
  { key: 'C2_C3', label: 'C2 Frekuensi vs C3 Ketergantungan' },
  { key: 'C2_C4', label: 'C2 Frekuensi vs C4 Gangguan Akademik' },
  { key: 'C2_C5', label: 'C2 Frekuensi vs C5 FoMO' },
  { key: 'C3_C4', label: 'C3 Ketergantungan vs C4 Gangguan Akademik' },
  { key: 'C3_C5', label: 'C3 Ketergantungan vs C5 FoMO' },
  { key: 'C4_C5', label: 'C4 Gangguan Akademik vs C5 FoMO' },
]

const SAATY_OPTIONS: { value: number; label: string }[] = [
  { value: 1 / 9, label: '1/9 Mutlak kurang penting' },
  { value: 1 / 7, label: '1/7 Sangat kurang penting' },
  { value: 1 / 5, label: '1/5 Kurang penting' },
  { value: 1 / 3, label: '1/3 Sedikit kurang penting' },
  { value: 1, label: '1 Sama penting' },
  { value: 3, label: '3 Sedikit lebih penting' },
  { value: 5, label: '5 Lebih penting' },
  { value: 7, label: '7 Sangat lebih penting' },
  { value: 9, label: '9 Mutlak lebih penting' },
]

const DEFAULT_COMP: PairwiseComparison = {
  C1_C2: 1, C1_C3: 1, C1_C4: 1, C1_C5: 1,
  C2_C3: 1, C2_C4: 1, C2_C5: 1,
  C3_C4: 1, C3_C5: 1, C4_C5: 1,
}

export function PairwiseMatrixForm() {
  const [comp, setComp] = useState<PairwiseComparison>(DEFAULT_COMP)
  const [weights, setWeights] = useState<CriteriaWeight | null>(null)
  const [consistency, setConsistency] = useState<ConsistencyTest | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      const result = ahpService.computeAHP(comp)
      setWeights(result.weights)
      setConsistency(result.consistency)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Perhitungan gagal')
      setWeights(null)
      setConsistency(null)
    }
  }

  const handleReset = () => {
    setComp(DEFAULT_COMP)
    setWeights(null)
    setConsistency(null)
    setError(null)
  }

  const handleChange = (key: PairKey, raw: string) => {
    const v = Number(raw)
    setComp((prev) => ({ ...prev, [key]: v as PairwiseComparison[PairKey] }))
  }

  const isConsistent = consistency ? consistency.isConsistent : null

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Matriks Perbandingan Berpasangan AHP</h2>
        {consistency && (
          <span style={{ padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600, background: isConsistent ? '#dcfce7' : '#fee2e2', color: isConsistent ? '#166534' : '#991b1b' }}>
            {isConsistent ? 'Konsisten (CR kurang dari 0.1)' : 'Tidak Konsisten (CR 0.1 atau lebih)'}
          </span>
        )}
      </header>

      <form onSubmit={handleCalculate} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16, maxWidth: 640 }}>
        {PAIRS.map(({ key, label }) => (
          <div key={key}>
            <label style={{ fontSize: 13, fontWeight: 500, color: '#6b7280' }}>{label}</label>
            <select
              value={String(comp[key])}
              onChange={(e) => handleChange(key, e.target.value)}
              className="ds-select"
              style={{ marginTop: 4 }}
            >
              {SAATY_OPTIONS.map((opt) => (
                <option key={opt.value} value={String(opt.value)}>{opt.label}</option>
              ))}
            </select>
          </div>
        ))}
        <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
          <button type="button" onClick={handleReset} className="ds-btn ds-btn-secondary">Reset</button>
          <button type="submit" className="ds-btn ds-btn-primary">Hitung Bobot AHP</button>
        </div>
      </form>

      {weights && consistency && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, padding: 16, border: '1px solid var(--border)', borderRadius: 8, background: '#f8fafc' }}>
          <div>
            <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Bobot Prioritas</h3>
            <div style={{ fontSize: 13, lineHeight: 1.8 }}>
              <div>C1 Durasi: {weights.C1.toFixed(4)}</div>
              <div>C2 Frekuensi: {weights.C2.toFixed(4)}</div>
              <div>C3 Ketergantungan: {weights.C3.toFixed(4)}</div>
              <div>C4 Gangguan Akademik: {weights.C4.toFixed(4)}</div>
              <div>C5 FoMO: {weights.C5.toFixed(4)}</div>
              <div style={{ marginTop: 6, color: '#6b7280' }}>Total: {((weights.C1 + weights.C2 + weights.C3 + weights.C4 + weights.C5) * 100).toFixed(1)}% (harus sekitar 100%)</div>
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Uji Konsistensi</h3>
            <div style={{ fontSize: 13, lineHeight: 1.8 }}>
              <div>lambda max: {consistency.lambdaMax.toFixed(4)}</div>
              <div>CI: {consistency.CI.toFixed(6)}</div>
              <div>RI (n=5): {consistency.RI}</div>
              <div>CR: {consistency.CR.toFixed(4)} {consistency.isConsistent ? 'OK' : 'Tidak OK'}</div>
              <div>Konsisten: {consistency.isConsistent ? 'Ya' : 'Tidak'}</div>
            </div>
          </div>
        </div>
      )}

      {error && <div style={{ padding: 12, borderRadius: 8, background: '#fef2f2', color: '#991b1b', fontSize: 13 }}>{error}</div>}
    </section>
  )
}

export default PairwiseMatrixForm
