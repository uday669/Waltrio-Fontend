// Minimal cookie helpers (no dependency).
// Used to persist the JWT auth token across page reloads.

export function setCookie(name, value, days = 1) {
  const maxAge = days * 24 * 60 * 60; // seconds (1 day = 86400s)
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  const expires = new Date(Date.now() + maxAge * 1000).toUTCString();
  document.cookie =
    `${name}=${encodeURIComponent(value)}` +
    `; Path=/; Max-Age=${maxAge}; Expires=${expires}; SameSite=Lax${secure}`;
}

export function getCookie(name) {
  if (typeof document === "undefined") return null;
  const prefix = `${name}=`;
  const cookies = document.cookie ? document.cookie.split("; ") : [];
  const found = cookies.find((row) => row.startsWith(prefix));
  if (!found) return null;
  const val = decodeURIComponent(found.slice(prefix.length));
  return val && val.trim() ? val.trim() : null;
}

export function deleteCookie(name) {
  if (typeof document === "undefined") return;

  const hostname = window.location.hostname;
  const pathnames = ["/", window.location.pathname, ""];

  // Collect domain variations
  const domains = ["", hostname, `.${hostname}`];
  if (hostname && hostname.includes(".")) {
    const parts = hostname.split(".");
    if (parts.length > 1) {
      const rootDomain = parts.slice(-2).join(".");
      domains.push(rootDomain, `.${rootDomain}`);
    }
  }

  // SameSite variants
  const sameSites = ["", "; SameSite=Lax", "; SameSite=Strict", "; SameSite=None; Secure"];

  domains.forEach((dom) => {
    pathnames.forEach((path) => {
      sameSites.forEach((sSite) => {
        const domPart = dom ? `; Domain=${dom}` : "";
        const pathPart = path ? `; Path=${path}` : "; Path=/";
        document.cookie = `${name}=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0${pathPart}${domPart}${sSite}`;
        document.cookie = `${name}=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=-99999999${pathPart}${domPart}${sSite}`;
      });
    });
  });
}

export function clearAllCookies() {
  if (typeof document === "undefined") return;

  // 1. Delete each cookie currently in document.cookie
  if (document.cookie) {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.slice(0, eqPos).trim() : cookie.trim();
      if (name) {
        deleteCookie(name);
      }
    }
  }

  // 2. Explicitly wipe all known token and auth cookie names
  const commonTokenKeys = [
    "waltrio_token",
    "token",
    "jwt",
    "access_token",
    "accessToken",
    "auth_token",
    "authToken",
    "refreshToken",
    "refresh_token",
    "session",
    "sessionId",
    "waltrio_user",
  ];
  commonTokenKeys.forEach((k) => deleteCookie(k));
}

