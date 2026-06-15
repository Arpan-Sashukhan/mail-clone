# MailX

MailX is a production-style Gmail Android inspired Progressive Web App built with React 19, Vite, TypeScript, Tailwind CSS, React Router, and placeholder Firebase integration.

The UI is intentionally mobile-first: rounded search, sliding drawer, Material-style floating compose action, inbox/detail/compose flows, dark mode, mock data, and an installable offline shell.

## Setup

```bash
npm install
npm run dev
```

Open the local URL shown by Vite. On Android Chrome, use **Add to Home Screen** to install the PWA.

## Build

```bash
npm run build
```

## Project Structure

```text
src/
  components/
  pages/
  hooks/
  services/
  layouts/
  assets/
  data/
  routes/
  types/
```

## Data And Services

Mock inbox data lives in `src/data/emails.json` and contains 30 realistic emails.

Service stubs live in:

- `src/services/gmailService.ts`
- `src/services/customMailService.ts`
- `src/services/firebase.ts`

The mail service methods currently return mock data and are ready to be swapped for Gmail, custom mail, or Firebase-backed implementations later.
