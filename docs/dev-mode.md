# Browser development API

Run `npm run dev` and open the Vite URL to exercise the frontend without the Tauri desktop runtime.

The Vite dev server provides these in-memory endpoints:

- `GET /api/reptiles` lists the seeded Noodle demo reptile.
- `POST /api/reptiles` creates a reptile from `{ "name": "...", "birth_date": "YYYY-MM-DD" }`.
- `GET /api/reptiles/:id` returns a reptile with an empty feeding list, or a 404 response.

New reptiles and edits exist only for the lifetime of the dev server. Desktop mode continues to use its Tauri list and create commands; detail data remains a frontend mock because the desktop backend has no detail command yet.
