# Firestore / Firebase Performance Measurements

This short guide explains the lightweight console timers added to the codebase to help measure where time is spent when the app initializes and when Firestore listeners/readers run.

Where to look
- Open the browser DevTools Console (F12) and reload the page.
- Look for `console.time`/`console.timeEnd` output using these labels:
  - `firebase.init` — time to initialize the Firebase SDK and get a `Firestore` instance.
  - `getAllQuests` — time taken by `getAllQuests()` to perform a `getDocs()` read.
  - `getAllProgress` — time for `getAllProgress()` reads.
  - `subscribeToQuests.firstSnapshot` — time between subscribing and receiving the first realtime snapshot.
  - `subscribeToProgress.firstSnapshot` — same for per-day progress subscriptions.
  - `subscribeToMonthlyProgress.firstSnapshot` — same for monthly range subscriptions.

How to interpret
- `firebase.init` high values indicate SDK/network handshake / DNS/TLS latency.
- `*.firstSnapshot` shows how long until the server pushed initial data. High values could be network latency, blocked requests (ad-blockers), or many listeners being opened concurrently.
- If `getAll*` calls are slow, consider query optimization (indexes) or batching.

Quick actions
- Disable ad/tracker extensions to ensure Firestore traffic isn't blocked (`ERR_BLOCKED_BY_CLIENT`).
- Try the app in Incognito to avoid extension interference.
- Consider lazy-loading Firebase and enabling `enableIndexedDbPersistence(db)` to improve repeat load times.

Next steps (optional)
- If you want, I can add automatic logging to send these measurements to a monitoring endpoint, or add performance markers in more places.

---
File: `docs/measurements.md`
