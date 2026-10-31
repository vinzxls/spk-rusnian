/**
 * useHasilRanking — hitung satu kali hasil AHP+VIKOR dari data tersimpan.
 *
 * Dipakai halaman Ranking, Hasil Identifikasi, dan Laporan supaya semuanya
 * memakai bobot AHP dan sumber data yang sama (tidak ada angka berbeda antar
 * halaman).
 */
import { useCallback, useEffect, useState } from 'react'
import { kuesionerService } from '../services/kuesioner.service'
import { gabungAHPdanVIKOR } from '../services/hasil-identifikasi.service'
import { getBobotAHP, hasBobotAHP } from '../services/ahp-store'
import { buildMahasiswaMap, toKuesionerJawaban } from '../utils/kuesioner-mapper'
import type { HasilRanking } from '../types/hasil.types'

export interface UseHasilRankingState {
  hasil: HasilRanking | null
  loading: boolean
  error: string | null
  /** Jumlah kuesioner yang menjadi dasar perhitungan. */
  jumlahResponden: number
  /** `true` bila bobot berasal dari perbandingan berpasangan yang disimpan. */
  bobotDariAHP: boolean
  reload: () => Promise<void>
}

export function useHasilRanking(): UseHasilRankingState {
  const [hasil, setHasil] = useState<HasilRanking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [jumlahResponden, setJumlahResponden] = useState(0)
  const [bobotDariAHP, setBobotDariAHP] = useState(false)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const jawaban = await kuesionerService.getAll()
      setJumlahResponden(jawaban.length)
      setBobotDariAHP(hasBobotAHP())

      if (jawaban.length === 0) {
        setHasil(null)
        return
      }

      const mahasiswaMap = await buildMahasiswaMap()
      setHasil(
        gabungAHPdanVIKOR({
          bobotAHP: getBobotAHP(),
          jawabanKuesioner: toKuesionerJawaban(jawaban),
          mahasiswaMap,
        })
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menghitung hasil identifikasi.')
      setHasil(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  return { hasil, loading, error, jumlahResponden, bobotDariAHP, reload }
}

export default useHasilRanking
