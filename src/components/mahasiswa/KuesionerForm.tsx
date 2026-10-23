import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { kuesionerService } from '@/services/kuesioner.service'
import { useAuth } from '@/hooks/useAuth'

const QUESTIONS = {
  C1: {
    title: 'Durasi Penggunaan Media Sosial',
    items: [
      { id: 'A1', text: 'Saya menggunakan media sosial dalam waktu yang lama setiap hari.' },
      { id: 'A2', text: 'Saya sering menghabiskan waktu lebih lama di media sosial daripada yang saya rencanakan.' },
      { id: 'A3', text: 'Saya tetap menggunakan media sosial meskipun sudah menghabiskan banyak waktu.' },
      { id: 'A4', text: 'Saya sulit membatasi lama waktu penggunaan media sosial.' },
      { id: 'A5', text: 'Saya sering tidak menyadari bahwa saya telah menghabiskan banyak waktu di media sosial.' },
    ]
  },
  C2: {
    title: 'Frekuensi Penggunaan Media Sosial',
    items: [
      { id: 'A1', text: 'Saya membuka media sosial berkali-kali dalam sehari.' },
      { id: 'A2', text: 'Saya sering memeriksa media sosial meskipun tidak ada notifikasi.' },
      { id: 'A3', text: 'Saya terbiasa membuka media sosial segera setelah bangun tidur.' },
      { id: 'A4', text: 'Saya sering membuka media sosial di sela-sela aktivitas sehari-hari.' },
      { id: 'A5', text: 'Saya merasa sudah menjadi kebiasaan untuk memeriksa media sosial secara berulang.' },
    ]
  },
  C3: {
    title: 'Ketergantungan terhadap Media Sosial',
    items: [
      { id: 'A1', text: 'Saya merasa sulit untuk tidak membuka media sosial dalam waktu yang lama.' },
      { id: 'A2', text: 'Saya merasa gelisah ketika tidak dapat mengakses media sosial.' },
      { id: 'A3', text: 'Saya merasa media sosial sudah menjadi bagian penting dalam kehidupan sehari-hari saya.' },
      { id: 'A4', text: 'Saya memiliki keinginan kuat untuk membuka media sosial ketika sedang tidak menggunakannya.' },
      { id: 'A5', text: 'Saya merasa sulit mengurangi penggunaan media sosial meskipun sudah mencoba.' },
    ]
  },
  C4: {
    title: 'Gangguan Aktivitas Akademik',
    items: [
      { id: 'A1', text: 'Penggunaan media sosial membuat saya menunda mengerjakan tugas kuliah.' },
      { id: 'A2', text: 'Saya sering membuka media sosial ketika sedang belajar.' },
      { id: 'A3', text: 'Penggunaan media sosial membuat konsentrasi belajar saya terganggu.' },
      { id: 'A4', text: 'Saya pernah mengabaikan tugas atau kegiatan akademik karena terlalu lama menggunakan media sosial.' },
      { id: 'A5', text: 'Waktu belajar saya berkurang karena penggunaan media sosial.' },
    ]
  },
  C5: {
    title: 'Fear of Missing Out (FoMO)',
    items: [
      { id: 'A1', text: 'Saya merasa khawatir jika tidak mengetahui aktivitas terbaru teman-teman saya di media sosial.' },
      { id: 'A2', text: 'Saya merasa perlu mengikuti informasi terbaru yang sedang ramai di media sosial.' },
      { id: 'A3', text: 'Saya merasa tertinggal ketika tidak mengetahui apa yang sedang dibicarakan di media sosial.' },
      { id: 'A4', text: 'Saya sering memeriksa media sosial karena takut melewatkan informasi atau kegiatan penting.' },
      { id: 'A5', text: 'Saya merasa tidak nyaman ketika tidak dapat mengikuti perkembangan terbaru di media sosial.' },
    ]
  }
}

const SCALE = [
  { val: 1, label: 'STS', desc: 'Sangat Tidak Setuju' },
  { val: 2, label: 'TS', desc: 'Tidak Setuju' },
  { val: 3, label: 'N', desc: 'Netral' },
  { val: 4, label: 'S', desc: 'Setuju' },
  { val: 5, label: 'SS', desc: 'Sangat Setuju' }
]

export function KuesionerForm() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [answers, setAnswers] = useState<Record<string, number>>({})

  const handleChange = (k: string, s: string, val: number) => {
    setAnswers({ ...answers, [`${k}_${s}`]: val })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (Object.keys(answers).length < 25) {
      alert('Mohon isi semua pertanyaan (25 pertanyaan wajib diisi)')
      return
    }
    if (user?.id) {
      await kuesionerService.submit(user.id, answers)
      navigate('/mahasiswa/dashboard')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="ds-form">
      {Object.entries(QUESTIONS).map(([kKey, kData]) => (
        <div key={kKey} className="ds-card" style={{ marginBottom: 24 }}>
          <div className="ds-card-header" style={{ borderBottom: '1px solid var(--color-rule)', marginBottom: 16 }}>
            <h4 className="ds-card-title" style={{ color: 'var(--color-accent)' }}>
              {kKey} - {kData.title}
            </h4>
          </div>
          <div className="ds-card-content">
            {kData.items.map((item, index) => (
              <div key={`${kKey}_${item.id}`} className="ds-form-group" style={{ marginBottom: 24, borderBottom: index < 4 ? '1px dashed var(--color-rule)' : 'none', paddingBottom: 16 }}>
                <p className="ds-label" style={{ fontSize: '1rem', marginBottom: 12, display: 'block', fontWeight: 500 }}>
                  {index + 1}. {item.text}
                </p>
                <div className="ds-radio-group" style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                  {SCALE.map((s) => (
                    <label key={s.val} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.875rem' }}>
                      <input 
                        type="radio" 
                        name={`${kKey}_${item.id}`} 
                        value={s.val} 
                        checked={answers[`${kKey}_${item.id}`] === s.val}
                        onChange={() => handleChange(kKey, item.id, s.val)}
                        required
                      /> 
                      <span title={s.desc}>{s.label} ({s.val})</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div style={{ position: 'sticky', bottom: 20, background: 'var(--color-paper)', padding: 16, borderTop: '1px solid var(--color-rule)', borderRadius: 12, boxShadow: '0 -4px 12px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p className="ds-caption">{Object.keys(answers).length} dari 25 pertanyaan terisi</p>
        <button type="submit" className="ds-btn ds-btn-primary">Kirim Jawaban Kuesioner</button>
      </div>
    </form>
  )
}
