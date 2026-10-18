import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { kuesionerService } from '@/services/kuesioner.service'
import { useAuth } from '@/hooks/useAuth'

const KRITERIA = ['C1', 'C2', 'C3', 'C4', 'C5']
const SUBKRITERIA = ['A1', 'A2', 'A3', 'A4', 'A5']

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
      alert('Mohon isi semua pertanyaan')
      return
    }
    if (user?.id) {
      await kuesionerService.submit(user.id, answers)
      navigate('/mahasiswa/dashboard')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="ds-form">
      {KRITERIA.map((k) => (
        <div key={k} className="ds-card" style={{ marginBottom: 16 }}>
          <div className="ds-card-header"><h4 className="ds-card-title">Kriteria {k}</h4></div>
          <div className="ds-card-content">
            {SUBKRITERIA.map((s) => (
              <div key={`${k}_${s}`} className="ds-form-group">
                <label className="ds-label">Subkriteria {s}</label>
                <div className="ds-radio-group">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <label key={v}>
                      <input 
                        type="radio" 
                        name={`${k}_${s}`} 
                        value={v} 
                        onChange={() => handleChange(k, s, v)}
                      /> {v}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      <button type="submit" className="ds-btn ds-btn-primary">Kirim Jawaban</button>
    </form>
  )
}
