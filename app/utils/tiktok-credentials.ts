/** TikTok Login Kit — Sandbox (không dùng Production). */
export const TIKTOK_ENV = "sandbox" as const;

export const TIKTOK_CLIENT_KEY = "sbaw7oubryb7flszwc";
export const TIKTOK_CLIENT_SECRET = "TAI1y7bQRhTiMc06jlxwTsjxplGmbI4m";

/** Phải khớp Redirect URI khai báo ở tab Sandbox → Login Kit */
export const TIKTOK_REDIRECT_URI =
  "https://badmintion-booking.netlify.app/auth/tiktok/callback";
