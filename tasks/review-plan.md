# Review: Mahasiswa Questionnaire Injection

## Adversarial Review

### 1. Unstated Assumptions
- **Questionnaire Content:** The spec mentions "5 criteria × 5 sub-criteria". Are these fixed? If the admin changes criteria, does the form break?
- **User Experience:** 25 questions on one page might be overwhelming. Should it be a stepper?
- **Data Persistence:** The service layer mentions "mock store". If the user refreshes, is the progress lost?
- **Navigation:** What happens if a user tries to access `/mahasiswa/kuesioner` after having already submitted? The spec says "redirect to dashboard", but is this enforced at the route level or component level?

### 2. Failure Modes
- **Partial Submission:** If a student fills 20/25 questions and closes the browser, they lose everything.
- **Concurrent Modification:** What if the admin deletes a criteria while a student is filling the form?
- **Validation:** If the validation is only client-side, a malicious user could submit empty or invalid data via the console.

### 3. Conventions
- **Naming:** `KuesionerForm` vs `QuestionnaireForm`. The codebase uses Indonesian (`mahasiswa`, `hasil`), so `Kuesioner` is consistent.
- **Service Pattern:** Existing services use classes or exported functions. `mahasiswa.service.ts` uses a class instance. `kuesioner.service.ts` should follow suit.

### 4. Hidden Coupling
- **VIKOR Trigger:** Triggering VIKOR calculation immediately upon submission might be expensive if many students submit at once. Should it be a background job or on-demand by the admin?

## Reconciled Decisions
- **UX:** Will implement a single-page layout first for simplicity, but group questions by criteria headers to improve readability.
- **Persistence:** Submission will be atomic. No "save draft" for now to keep implementation simple.
- **Redirection:** Will handle redirection in `KuesionerFormPage` based on status from the service.
- **Service:** Will use a class-based `KuesionerService` for consistency.
- **Trigger:** VIKOR will be triggered conceptually (the data will be ready), but the actual "Ranking" page already performs calculations on render or via service.
