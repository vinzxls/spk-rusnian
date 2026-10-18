# Spec: Mahasiswa Questionnaire Injection

## Objective
Implement a feature where Mahasiswa (students) can fill out the questionnaire directly within the system after logging in. Currently, the `KuesionerFormPage` is just a placeholder. We need a functional form that maps to the 5 criteria (Durasi, Frekuensi, Ketergantungan, Gangguan Akademik, FoMO) and their sub-criteria, calculates results, and saves them.

## Tech Stack
- React 18
- Tailwind CSS (via design-system.css)
- Lucide React (icons)
- TypeScript

## Commands
- Dev: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`

## Project Structure
- `src/pages/mahasiswa/KuesionerFormPage.tsx` -> Main entry for the form.
- `src/components/mahasiswa/KuesionerForm.tsx` -> The new form component.
- `src/services/kuesioner.service.ts` -> Handle saving and fetching questionnaire data.

## Code Style
Functional components with hooks. Use the existing `ds-*` CSS classes for styling.

## Success Criteria
- [ ] Mahasiswa can access the questionnaire form from their dashboard.
- [ ] The form displays 5 criteria, each with 5 sub-criteria questions.
- [ ] Questions use a Likert scale (1-5).
- [ ] Submission triggers a "success" state and redirects to dashboard.
- [ ] Data is persisted in the mock store (or database schema if integrated).

## Plan
1. Create `src/services/kuesioner.service.ts` to manage questionnaire submissions.
2. Build the `KuesionerForm` component with validation and multi-step or single-page layout.
3. Update `KuesionerFormPage.tsx` to use the new component.
4. Update `DashboardMahasiswa.tsx` to reflect the status (Sudah Mengisi / Belum Mengisi).

## Boundaries
- Always: Use existing design tokens.
- Ask first: Changing the database schema in `001_initial_schema.sql`.
- Never: Bypass authentication for form submission.
