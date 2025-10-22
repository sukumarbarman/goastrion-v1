// goastrion-frontend/app/lib/authEndpoints.ts
// Keep these RELATIVE. Your apiClient can prepend NEXT_PUBLIC_API_BASE if needed.
export const AUTH_ENDPOINTS = {
  register:        "/api/auth/register/",
  login:           "/api/auth/login/",
  me:              "/api/auth/me/",
  logout:          "/api/auth/logout/",
  refresh:         "/api/auth/token/refresh/",
  forgot:          "/api/auth/forgot-password/",
  reset:           "/api/auth/reset-password/",
  changePassword:  "/api/auth/change-password/",
  deleteAccount:   "/api/auth/delete-account/",
} as const;
