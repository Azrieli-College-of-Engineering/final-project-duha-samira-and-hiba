import { register, login } from "./api.js";

const $ = (id) => document.getElementById(id);
const KEY_MODE = "mg_mode";
const modeSelect = document.getElementById("securityMode");

// load saved mode on page load
if (modeSelect) {
    modeSelect.value = getMode();
    modeSelect.addEventListener("change", () => setMode(modeSelect.value));
}
function setMode(m) {
    localStorage.setItem(KEY_MODE, m);
}
function getMode() {
    return localStorage.getItem(KEY_MODE) || "secure";
}
function toast(el, msg, type = "") {
    if (!el) return;
    el.className = `toast ${type}`.trim();
    el.textContent = msg;
    el.style.display = "block";
    clearTimeout(el._t);
    el._t = setTimeout(() => (el.style.display = "none"), 2200);
}

// LOGIN
$("loginBtn")?.addEventListener("click", async () => {
    const u = $("loginUser")?.value?.trim();
    const p = $("loginPass")?.value?.trim();

    const msgEl = $("loginMsg");
    if (!u || !p) return toast(msgEl, "Enter username + password.", "bad");
    setMode(modeSelect?.value || "secure");
    try {
        await login(u, p); // stores session in localStorage + cookie in backend
        toast(msgEl, "Logged in! Redirecting…", "ok");
        setTimeout(() => (window.location.href = "./game.html"), 450);
    } catch (e) {
        toast(msgEl, e?.message || "Login failed.", "bad");
    }
});

// REGISTER
$("registerBtn")?.addEventListener("click", async () => {
    const u = $("regUser")?.value?.trim();
    const p = $("regPass")?.value?.trim();

    const msgEl = $("regMsg");
    if (!u || !p) return toast(msgEl, "Enter username + password.", "bad");
    setMode(modeSelect?.value || "secure");
    try {
        await register(u, p);
        toast(msgEl, "Registered. You can login now.", "ok");
    } catch (e) {
        toast(msgEl, e?.message || "Register failed.", "bad");
    }
});

// SKIP TO GAME (guest mode)
$("skipBtn")?.addEventListener("click", (e) => {
    e.preventDefault();
    setMode(modeSelect?.value || "secure");
    // no login. will stay guest
    window.location.href = "./game.html";
});