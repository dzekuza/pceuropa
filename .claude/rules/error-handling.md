---
paths:
  - "app/api/**"
  - "actions/**"
  - "app/**/actions.ts"
  - "lib/**"
---

# Error Handling

- Never swallow errors silently. Log or rethrow with context about what operation failed.
- Handle every rejected promise. No floating async calls.
- HTTP error responses: consistent shape (`{ error: { code, message } }`), correct status codes.
- Never expose stack traces, internal paths, or raw Supabase errors in production responses.
- Retry transient errors with exponential backoff. Fail fast on validation and auth errors.
