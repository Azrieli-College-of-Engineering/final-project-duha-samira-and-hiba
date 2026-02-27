// api.js — local mock “backend” using localStorage

const KEY_SESSION = "mg_session";
const KEY_USERS = "mg_users";
const KEY_SCORES = "mg_scores";
const KEY_COMMENTS = "mg_comments";

function load(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

function save(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
}

export function setSession(username) {
    save(KEY_SESSION, { user: username, ts: Date.now() });
}

export function clearSession() {
    localStorage.removeItem(KEY_SESSION);
    // migration cleanup
    localStorage.removeItem("mg_user");
}

export function getSession() {
    const s = load(KEY_SESSION, null);
    if (s?.user) return s;

    // migration: old key
    const old = localStorage.getItem("mg_user");
    if (old) {
        setSession(old);
        return { user: old, ts: Date.now() };
    }

    return { user: "guest", ts: Date.now() };
}

export function registerMock(username, password) {
    const users = load(KEY_USERS, []);
    const exists = users.some((u) => u.user === username);
    if (exists) return { ok: false, msg: "Username already exists." };

    users.push({ user: username, pass: password });
    save(KEY_USERS, users);
    return { ok: true };
}

export function loginMock(username, password) {
    const users = load(KEY_USERS, []);
    // allow login even if not registered (as UI says)
    const found = users.find((u) => u.user === username);
    if (!found) return { ok: true };

    if (found.pass !== password) return { ok: false, msg: "Wrong password." };
    return { ok: true };
}

export function saveScore(username, score) {
    const scores = load(KEY_SCORES, []);
    scores.push({ user: username, score, date: new Date().toISOString().slice(0, 10) });
    save(KEY_SCORES, scores);
}

export function getScores(limit = 10) {
    const scores = load(KEY_SCORES, []);
    return scores
        .slice()
        .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
        .slice(0, limit);
}

function normalizeComment(c) {
    const user = (c?.user ?? c?.username ?? c?.name ?? "guest").toString();
    const text = (c?.text ?? c?.comment ?? c?.msg ?? "").toString();
    const ts = Number(c?.ts ?? c?.time ?? Date.now());
    return { user, text, ts };
}

export function postComment(username, text) {
    const comments = load(KEY_COMMENTS, []).map(normalizeComment);
    comments.push(normalizeComment({ user: username, text, ts: Date.now() }));
    save(KEY_COMMENTS, comments.slice(-50));
}

export function getComments(limit = 8) {
    const comments = load(KEY_COMMENTS, []).map(normalizeComment);
    const cleaned = comments.filter((c) => c.text.trim().length > 0);
    if (cleaned.length !== comments.length) save(KEY_COMMENTS, cleaned.slice(-50));

    return cleaned
        .slice()
        .sort((a, b) => (b.ts ?? 0) - (a.ts ?? 0))
        .slice(0, limit);
}

/**
 * Reset demo data for clean presentations.
 * Keeps registered users by default (so you can still login).
 */
export function resetDemoData({ keepUsers = true } = {}) {
    // Clear gameplay artifacts
    localStorage.removeItem(KEY_SCORES);
    localStorage.removeItem(KEY_COMMENTS);
    localStorage.removeItem(KEY_SESSION);

    // Clear migration keys / old leftovers
    localStorage.removeItem("mg_user");
    localStorage.removeItem("mg_username");
    localStorage.removeItem("mg_session_user"); // if existed from older versions

    if (!keepUsers) {
        localStorage.removeItem(KEY_USERS);
    }

    // Return default session
    return getSession();
}