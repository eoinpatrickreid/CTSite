# Deploy to Vercel + MongoDB Atlas

## 1. MongoDB Atlas (free tier)

1. Create a free cluster at https://www.mongodb.com/cloud/atlas (M0 Sandbox is free forever).
2. Database Access -> add a user with a password.
3. Network Access -> add IP `0.0.0.0/0` (Vercel serverless egress IPs are dynamic).
4. Connect -> Drivers -> copy the connection string. Replace `<password>` with the user's password.

## 2. Vercel

1. Push this folder to a GitHub repo.
2. Import the repo at https://vercel.com/new. Framework preset: **Other**. No build command, no output directory.
3. Project Settings -> Environment Variables:
   - `MONGODB_URI` = the Atlas connection string
   - `MONGODB_DB` = `ct_site` (or any name)
4. Deploy. The first request to `/api/state` creates the collection on demand.

## 3. Local dev (optional)

```bash
npm install
npx vercel dev
```

Set the same env vars in `.env.local`.

## How it works

- `Together.html` is served as a static page.
- `cloud-storage.js` runs before React mounts. It calls `GET /api/state`, hydrates `localStorage` with the server snapshot, then lets the existing app boot.
- Every `localStorage.setItem` / `removeItem` is wrapped to debounce-push the full snapshot to `PUT /api/state` (and flushes on tab hide via `sendBeacon`).
- All state (custom items, edits, deletes, ratings, visited, map pins, holidays, agenda, calendar events, important stars, widget collapse, tweaks) is stored in a single MongoDB document with `_id: "shared"` in the `state` collection. Both users see the same data.

## Notes

- Anyone who can reach the URL can read and write the document. If you want to lock it down later, add a shared password header check in `api/state.js`.
- The shim is debounced 800 ms, so rapid changes coalesce into one write.
