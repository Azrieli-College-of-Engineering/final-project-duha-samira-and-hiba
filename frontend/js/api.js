// frontend/js/api.js
// REAL backend integration (Express session cookies)
// IMPORTANT: open pages from http://localhost:3000 (same origin)

const KEY_SESSION = "mg_session";

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
}

export function getSession() {
    try {
        const raw = localStorage.getItem(KEY_SESSION);
        if (raw) {
            const s = JSON.parse(raw);
            if (s?.user?.username) return s;
        }
    } catch { }

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
    const data = await apiFetch("/api/login", {
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

export async function me() {
    return apiFetch("/api/me", { method: "GET" });
}

// -------------------- scores --------------------
export async function saveScore(score) {
    const { user } = getSession();

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
    const { user } = getSession();

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
