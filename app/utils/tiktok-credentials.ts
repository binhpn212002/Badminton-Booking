/** TikTok Login Kit — Sandbox (không dùng Production). */
export const TIKTOK_ENV = "sandbox" as const;

export const TIKTOK_CLIENT_KEY = "sbaw7oubryb7flszwc";
export const TIKTOK_CLIENT_SECRET = "TAI1y7bQRhTiMc06jlxwTsjxplGmbI4m";

/** Phải khớp Redirect URI khai báo ở tab Sandbox → Login Kit */
export const TIKTOK_REDIRECT_URI =
  "https://badmintion-booking.netlify.app/auth/tiktok/callback";

/** Scope xin khi authorize — phải bật sẵn trên Portal (Sandbox).
 * - video.upload  → /v2/post/publish/inbox/video/init/ (draft inbox)
 * - video.publish → /v2/post/publish/video/init/ (direct post)
 */
export const TIKTOK_SCOPES = "user.info.basic,video.upload,video.publish";
