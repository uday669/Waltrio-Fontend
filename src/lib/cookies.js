// Minimal cookie helpers (no dependency).
// Used to persist the JWT auth token across page reloads.

export function setCookie(name, value, days = 7) {
  const maxAge = days * 24 * 60 * 60; // seconds
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie =
    `${name}=${encodeURIComponent(value)}` +
    `; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}

export function getCookie(name) {
  const prefix = `${name}=`;
  const found = document.cookie
    .split("; ")
    .find((row) => row.startsWith(prefix));
  return found ? decodeURIComponent(found.slice(prefix.length)) : null;
}

export function deleteCookie(name) {
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
}
