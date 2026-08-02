// app/api/auth/[...nextauth]/route.ts — Auth.js route handlers
// Handles the credentials sign-in POST and session/CSRF GET endpoints.
import { handlers } from "@/lib/auth/config";

export const { GET, POST } = handlers;
