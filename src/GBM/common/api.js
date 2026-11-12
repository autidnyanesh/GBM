export const req = async (url, opts = {}) => {
  const token = (() => {
    try {
      return JSON.parse(localStorage.getItem("gbmSession") || "null")?.token;
    } catch {
      return null;
    }
  })();
  if (token) window.dispatchEvent(new Event("gbm-user-activity"));
  const headers = {
    ...(opts.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const r = await fetch("/api" + url, { ...opts, headers });
  if (token && r.ok) window.dispatchEvent(new Event("gbm-user-activity"));
  const j = await r.json().catch(() => ({}));
  if (!r.ok) {
    if (r.status === 401 && url !== "/auth/login") {
      localStorage.removeItem("gbmSession");
      localStorage.removeItem("gbmLastActivityAt");
      window.dispatchEvent(new Event("auth-state-changed"));
      throw Error("Unauthorized");
    }
    const message = j.message || j.detail || j.error;
    throw Error(message || `Request failed (${r.status})`);
  }
  return j;
};
export async function encryptForBackend(value, prefix) {
  const keyInfo = await req("/auth/public-key");
  const spki = Uint8Array.from(atob(keyInfo.publicKey), (c) => c.charCodeAt(0));
  const publicKey = await crypto.subtle.importKey(
    "spki",
    spki,
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["encrypt"],
  );
  const aesKey = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt"],
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    aesKey,
    new TextEncoder().encode(value),
  );
  const rawAes = await crypto.subtle.exportKey("raw", aesKey);
  const wrappedKey = await crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    publicKey,
    rawAes,
  );
  const b64 = (b) => btoa(String.fromCharCode(...new Uint8Array(b)));
  return {
    [prefix + "Key"]: b64(wrappedKey),
    [prefix + "Iv"]: b64(iv),
    [prefix]: b64(ciphertext),
  };
}
