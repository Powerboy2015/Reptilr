# Frontend contribution requirements

When you add or change a frontend feature or hook, add or update tests for its observable behavior in the same change. Cover the successful path and relevant error or state transitions. Run `npm test` before handing off the change, and report any failures.

Keep tests focused on behavior callers can observe. Mock external boundaries such as the Tauri bridge or HTTP responses, but do not assert private helper calls or internal implementation details.
