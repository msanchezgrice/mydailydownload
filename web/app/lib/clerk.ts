export const CLERK_SIGN_IN_URL = "/sign-in";
export const CLERK_AFTER_SIGN_IN_URL = "/";

export const CLERK_CLIENT_ENABLED = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim(),
);
