import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { kuesionerService } from '@/services/kuesioner.service'
import { useAuth } from '@/hooks/useAuth'

/**
 * Daftar pertanyaan kuesioner.
 *
 * `key` adalah kunci penyimpanan (`C1_A1` … `C5_A5`). Urutan tampil sengaja
 * tidak menampilkan nama kriteria — responden hanya melihat nomor 1–25 agar
 * tidak mengarahkan jawaban ke kriteria tertentu.
 */
interface Pertanyaan {
  key: string
  text: string
}

const PERTANYAAN: Pertanyaan[] = [
  // C1 — Durasi
  { key: 'C1_A1', text: 'Saya menggunakan media sosial dalam waktu yang lama setiap hari.' },
  { key: 'C1_A2', text: 'Saya sering menghabiskan waktu lebih lama di media sosial daripada yang saya rencanakan.' },
  { key: 'C1_A3', text: 'Saya tetap menggunakan media sosial meskipun sudah menghabiskan banyak waktu.' },
  { key: 'C1_A4', text: 'Saya sulit membatasi lama waktu penggunaan media sosial.' },
  { key: 'C1_A5', text: 'Saya sering tidak menyadari bahwa saya telah menghabiskan banyak waktu di media sosial.' },
  // C2 — Frekuensi
  { key: 'C2_A1', text: 'Saya membuka media sosial berkali-kali dalam sehari.' },
  { key: 'C2_A2', text: 'Saya sering memeriksa media sosial meskipun tidak ada notifikasi.' },
  { key: 'C2_A3', text: 'Saya terbiasa membuka media sosial segera setelah bangun tidur.' },
  { key: 'C2_A4', text: 'Saya sering membuka media sosial di sela-sela aktivitas sehari-hari.' },
  { key: 'C2_A5', text: 'Saya merasa sudah menjadi kebiasaan untuk memeriksa media sosial secara berulang.' },
  // C3 — Ketergantungan
  { key: 'C3_A1', text: 'Saya merasa sulit untuk tidak membuka media sosial dalam waktu yang lama.' },
  { key: 'C3_A2', text: 'Saya merasa gelisah ketika tidak dapat mengakses media sosial.' },
  { key: 'C3_A3', text: 'Saya merasa media sosial sudah menjadi bagian penting dalam kehidupan sehari-hari saya.' },
  { key: 'C3_A4', text: 'Saya memiliki keinginan kuat untuk membuka media sosial ketika sedang tidak menggunakannya.' },
  { key: 'C3_A5', text: 'Saya merasa sulit mengurangi penggunaan media sosial meskipun sudah mencoba.' },
  // C4 — Gangguan Akademik
  { key: 'C4_A1', text: 'Penggunaan media sosial membuat saya menunda mengerjakan tugas kuliah.' },
  { key: 'C4_A2', text: 'Saya sering membuka media sosial ketika sedang belajar.' },
  { key: 'C4_A3', text: 'Penggunaan media sosial membuat konsentrasi belajar saya terganggu.' },
  { key: 'C4_A4', text: 'Saya pernah mengabaikan tugas atau kegiatan akademik karena terlalu lama menggunakan media sosial.' },
  { key: 'C4_A5', text: 'Waktu belajar saya berkurang karena penggunaan media sosial.' },
  // C5 — FoMO
  { key: 'C5_A1', text: 'Saya merasa khawatir jika tidak mengetahui aktivitas terbaru teman-teman saya di media sosial.' },
  { key: 'C5_A2', text: 'Saya merasa perlu mengikuti informasi terbaru yang sedang ramai di media sosial.' },
  { key: 'C5_A3', text: 'Saya merasa tertinggal ketika tidak mengetahui apa yang sedang dibicarakan di media sosial.' },
  { key: 'C5_A4', text: 'Saya sering memeriksa media sosial karena takut melewatkan informasi atau kegiatan penting.' },
  { key: 'C5_A5', text: 'Saya merasa tidak nyaman ketika tidak dapat mengikuti perkembangan terbaru di media sosial.' },
]

/** Skala Likert 1–5. Angka hanya dipakai sebagai nilai, tidak ditampilkan. */
const PILIHAN = [
  { nilai: 1, label: 'Sangat Tidak Setuju' },
  { nilai: 2, label: 'Tidak Setuju' },
  { nilai: 3, label: 'Netral' },
  { nilai: 4, label: 'Setuju' },
  { nilai: 5, label: 'Sangat Setuju' },
]

export function KuesionerForm() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [jawaban, setJawaban] = useState<Record<string, number>>({})
  const [mengirim, setMengirim] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const terisi = useMemo(() => Object.keys(jawaban).length, [jawaban])
  const lengkap = terisi === PERTANYAAN.length
  const persen = Math.round((terisi / PERTANYAAN.length) * 100)

  const pilih = (key: string, nilai: number) => {
    setJawaban((prev) => ({ ...prev, [key]: nilai }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!lengkap) {
      const belum = PERTANYAAN.map((p, i) => (jawaban[p.key] ? null : i + 1)).filter(
        (n): n is number => n !== null
      )
      setError(`Masih ada ${belum.length} pertanyaan yang belum dijawab (nomor ${belum.join(', ')}).`)
      return
    }

    if (!user?.id) {
      setError('Sesi login tidak ditemukan. Silakan masuk kembali.')
      return
    }

    setMengirim(true)
    try {
      const ok = await kuesionerService.submit(user.id, jawaban)
      if (!ok) {
        setError('Jawaban gagal disimpan. Coba lagi.')
        return
      }
      navigate('/mahasiswa/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat menyimpan jawaban.')
    } finally {
      setMengirim(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="ds-flex ds-flex-col ds-gap-4">
      <div className="ds-card">
        <div className="ds-card-content">
          <p className="ds-body-sm" style={{ marginBottom: 8 }}>
            Jawablah semua pernyataan berikut sesuai kondisi Anda. Tidak ada jawaban benar atau
            salah — pilih yang paling menggambarkan diri Anda.
          </p>
          <div
            className="ds-progress"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={PERTANYAAN.length}
            aria-valuenow={terisi}
            aria-label="Kemajuan pengisian kuesioner"
          >
            <div className="ds-progress-bar" style={{ width: `${persen}%` }} />
          </div>
          <p className="ds-caption" style={{ marginTop: 8 }}>
            {terisi} dari {PERTANYAAN.length} pertanyaan terjawab ({persen}%)
          </p>
        </div>
      </div>

      {error && (
        <div className="ds-alert ds-alert-danger" role="alert">
          <p className="ds-alert-body">{error}</p>
        </div>
      )}

      {PERTANYAAN.map((p, i) => {
        const nomor = i + 1
        const dipilih = jawaban[p.key]
        return (
          <fieldset key={p.key} className="ds-card ds-pertanyaan">
            <legend className="ds-pertanyaan-legend">
              <span className="ds-pertanyaan-nomor">{nomor}</span>
              <span>{p.text}</span>
            </legend>
            <div className="ds-pilihan">
              {PILIHAN.map((opsi) => {
                const aktif = dipilih === opsi.nilai
                return (
                  <label
                    key={opsi.nilai}
                    className={`ds-pilihan-item${aktif ? ' is-selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name={p.key}
                      value={opsi.nilai}
                      checked={aktif}
                      onChange={() => pilih(p.key, opsi.nilai)}
                      className="ds-pilihan-input"
                    />
                    <span>{opsi.label}</span>
                  </label>
                )
              })}
            </div>
          </fieldset>
        )
      })}

      <div className="ds-card ds-sticky-aksi">
        <div className="ds-card-content ds-flex ds-justify-between ds-items-center ds-gap-4 ds-flex-wrap">
          <p className="ds-caption" style={{ margin: 0 }}>
            {lengkap
              ? 'Semua pertanyaan sudah terjawab.'
              : `${PERTANYAAN.length - terisi} pertanyaan lagi.`}
          </p>
          <button
            type="submit"
            className="ds-btn ds-btn-primary"
            disabled={mengirim || !lengkap}
          >
            {mengirim ? 'Menyimpan...' : 'Kirim Jawaban Kuesioner'}
          </button>
        </div>
      </div>
    </form>
  )
}

export default KuesionerForm
