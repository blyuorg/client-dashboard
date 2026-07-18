import { AuthError, isAuthError } from "@supabase/supabase-js";

type PostgrestLikeError = {
  message: string;
  code?: string;
  details?: string | null;
  hint?: string | null;
};

function isPostgrestLikeError(error: unknown): error is PostgrestLikeError {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    "code" in error &&
    !isAuthError(error)
  );
}

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: "Incorrect email or password.",
  email_not_confirmed: "Please confirm your email address before logging in.",
  user_already_exists: "An account with this email already exists.",
  user_not_found: "No account found with this email.",
  weak_password: "That password is too weak. Use at least 6 characters.",
  session_expired: "Your session has expired. Please log in again.",
  session_not_found: "Your session has expired. Please log in again.",
  refresh_token_not_found: "Your session has expired. Please log in again.",
  refresh_token_already_used: "Your session has expired. Please log in again.",
  over_request_rate_limit: "Too many attempts. Please wait a moment and try again.",
  over_email_send_rate_limit: "Too many emails sent. Please wait a moment and try again.",
  email_address_invalid: "Enter a valid email address.",
  same_password: "New password must be different from your current password.",
};

const POSTGRES_ERROR_MESSAGES: Record<string, string> = {
  "42501": "You don't have permission to do that.",
  "42P01": "This resource isn't available right now. Please try again later.",
  PGRST116: "The requested item couldn't be found.",
  PGRST301: "You don't have permission to do that.",
  "23505": "That record already exists.",
  "23503": "This action can't be completed because related data is missing.",
};

/**
 * Logs the full Supabase error (code/message/details/hint) so the real cause
 * is never hidden behind the friendly message shown to the user.
 */
function logFullError(error: unknown): void {
  if (isPostgrestLikeError(error)) {
    console.error({
      code: error.code ?? null,
      message: error.message,
      details: error.details ?? null,
      hint: error.hint ?? null,
    });
    return;
  }
  if (error instanceof AuthError || isAuthError(error)) {
    console.error({
      code: error.code ?? null,
      status: error.status ?? null,
      message: error.message,
    });
    return;
  }
  console.error(error);
}

/**
 * Converts any Supabase Auth/Postgrest/network error into a message safe to
 * show a user. Codes are matched first since `message` text is not stable
 * across Supabase versions. Always logs the full raw error first — never
 * lets the friendly message be the only record of what happened.
 */
export function getReadableErrorMessage(error: unknown): string {
  logFullError(error);

  if (error instanceof AuthError || isAuthError(error)) {
    if (error.code && AUTH_ERROR_MESSAGES[error.code]) {
      return AUTH_ERROR_MESSAGES[error.code];
    }
    if (error.status === 0 || error.name === "AuthRetryableFetchError") {
      return "Network error — check your connection and try again.";
    }
    return error.message || "Authentication failed. Please try again.";
  }

  if (isPostgrestLikeError(error)) {
    if (error.code && POSTGRES_ERROR_MESSAGES[error.code]) {
      return POSTGRES_ERROR_MESSAGES[error.code];
    }
    return error.message || "Something went wrong loading your data.";
  }

  if (error instanceof TypeError && /fetch/i.test(error.message)) {
    return "Network error — check your connection and try again.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}
