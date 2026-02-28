// frontend/js/api.js
// REAL backend integration (Express session cookies)
// IMPORTANT: open pages from http://localhost:3000 (same origin)

const KEY_SESSION = "mg_session";
const KEY_MODE = "mg_mode";
function getMode() {
    return localStorage.getItem(KEY_MODE) || "secure";
}
// -------------------- helpers --------------------
async function apiFetch(path, options = {}) {
    const res = await fetch(path, {
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
        },
        ...options,
    });

    let data = null;
    try {
        data = await res.json();
    } catch { }

    if (!res.ok) {
        const msg = data?.error || `Request failed: ${res.status}`;
        throw new Error(msg);
    }

    return data;
}

export function setSession(user) {
    localStorage.setItem(KEY_SESSION, JSON.stringify({ user, ts: Date.now() }));
}

export function clearSession() {
    localStorage.removeItem(KEY_SESSION);
    localStorage.removeItem("mg_user");
    localStorage.removeItem("mg_username");
    localStorage.removeItem("mg_session_user");
}

export function getSession() {
    try {
        const raw = localStorage.getItem(KEY_SESSION);
        if (raw) {
            const s = JSON.parse(raw);
            if (s?.user?.username) return s;
        }
    } catch { }

    const old = localStorage.getItem("mg_user");
    if (old) {
        const migrated = { user: { id: null, username: old }, ts: Date.now() };
        localStorage.setItem(KEY_SESSION, JSON.stringify(migrated));
        return migrated;
    }

    return { user: { id: null, username: "guest" }, ts: Date.now() };
}

// -------------------- auth --------------------
export async function register(username, password) {
    return apiFetch("/api/register", {
        method: "POST",
        body: JSON.stringify({ username, password }),
    });
}

export async function login(username, password) {
    const mode = getMode(); // "secure" | "vuln"

    const path = mode === "vuln" ? "/api/login" : "/api/login-secure";

    const data = await apiFetch(path, {
        method: "POST",
        body: JSON.stringify({ username, password }),
    });

    if (data?.user?.id && data?.user?.username) {
        setSession(data.user);
    }
    return data;
}
export async function logout() {
    const data = await apiFetch("/api/logout", { method: "POST" });
    clearSession();
    return data;
}

// -------------------- scores --------------------
export async function saveScore(score) {
    const sess = getSession();
    const user = sess?.user;

    if (!user?.id) {
        return { ok: false, msg: "Not logged in (guest can't save score)." };
    }

    await apiFetch("/api/score", {
        method: "POST",
        body: JSON.stringify({ userId: user.id, score }),
    });

    return { ok: true };
}

export async function getScores(limit = 10) {
    const data = await apiFetch("/api/leaderboard", { method: "GET" });
    const rows = Array.isArray(data?.leaderboard) ? data.leaderboard : [];

    return rows.slice(0, limit).map((r) => ({
        user: r.username ?? "guest",
        score: r.score ?? 0,
        date: (r.createdAt ?? "").slice(0, 10),
    }));
}

// -------------------- comments --------------------
export async function postComment(text) {
    const sess = getSession();
    const user = sess?.user;

    if (!user?.id) {
        return { ok: false, msg: "Not logged in (guest can't post comments)." };
    }

    await apiFetch("/api/comment", {
        method: "POST",
        body: JSON.stringify({ userId: user.id, content: text }),
    });

    return { ok: true };
}

export async function getComments(limit = 12) {
    const data = await apiFetch("/api/comments", { method: "GET" });
    const rows = Array.isArray(data?.comments) ? data.comments : [];

    return rows.slice(0, limit).map((c) => ({
        user: c.username ?? "guest",
        text: c.content ?? "",
        ts: Date.parse(c.createdAt || "") || Date.now(),
    }));
}

// -------------------- demo reset --------------------
export async function resetDemoData() {
    await logout().catch(() => { });
    clearSession();
    return getSession();
}
// login, register, logout, saveScore, getScores, postComment, getComments, resetDemoData
export async function me() {
    return apiFetch("/api/me", { method: "GET" });
}