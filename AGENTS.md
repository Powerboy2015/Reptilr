# Frontend contribution requirements

When you add or change a frontend feature or hook, add or update tests for its observable behavior in the same change. Cover the successful path and relevant error or state transitions. Run `npm test` before handing off the change, and report any failures.

Keep tests focused on behavior callers can observe. Mock external boundaries such as the Tauri bridge or HTTP responses, but do not assert private helper calls or internal implementation details.

# App architecture

This app targets Android and runs locally through Tauri. It has no remote backend. Use the Tauri backend and its local SQLite database in the Android app. Mirror every Tauri backend feature used by the frontend with local mock data so browser development and the frontend can run without starting a backend server.
