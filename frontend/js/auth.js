import { register, login } from "./api.js";

const $ = (id) => document.getElementById(id);

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

    try {
        await login(u, p); 
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
    // no login. will stay guest
    window.location.href = "./game.html";
});