import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { KuesionerForm } from '@/components/mahasiswa/KuesionerForm'

export function KuesionerFormPage() {
  return (
    <DashboardLayout
      role="mahasiswa"
      pageTitle="Pengisian Kuesioner"
      pageDesc="Silakan isi kuesioner di bawah ini."
    >
      <KuesionerForm />
    </DashboardLayout>
  )
}
