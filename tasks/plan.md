# Implementation Plan: Mahasiswa Questionnaire Form

## Phase 1: Service Layer
- Create `src/services/kuesioner.service.ts`.
- Implement `getKuesionerStatus(mahasiswaId: string)` to check if the student has already filled the form.
- Implement `submitKuesioner(mahasiswaId: string, answers: any)` to save answers to a mock store.
- Integrated with `hasil-identifikasi.service.ts` to trigger VIKOR calculation upon submission (conceptual or actual).

## Phase 2: UI Component
- Create `src/components/mahasiswa/KuesionerForm.tsx`.
- Define the 25 questions (5 per criteria).
- Use a state-managed form with Likert scale (Radio buttons 1-5).
- Add validation to ensure all questions are answered.
- Add a "Submit" button with loading state.

## Phase 3: Integration & Dashboard
- Update `src/pages/mahasiswa/KuesionerFormPage.tsx` to render the `KuesionerForm`.
- Update `src/pages/mahasiswa/DashboardMahasiswa.tsx`:
  - Fetch status from `kuesioner.service.ts`.
  - Toggle "Belum Mengisi" to "Sudah Mengisi" badge.
  - Disable "Isi Kuesioner Sekarang" button if already filled.

## Phase 4: Final Polish & Git Push
- Verify build.
- Commit and push to main.
