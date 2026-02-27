import { setSession, registerMock, loginMock } from "./api.js";

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
$("loginBtn")?.addEventListener("click", () => {
    const u = $("loginUser")?.value?.trim();
    const p = $("loginPass")?.value?.trim();

    const msgEl = $("loginMsg");
    if (!u || !p) return toast(msgEl, "Enter username + password.", "bad");

    const res = loginMock(u, p);
    if (!res.ok) return toast(msgEl, res.msg, "bad");

    setSession(u);
    toast(msgEl, "Logged in! Redirecting…", "ok");
    setTimeout(() => (window.location.href = "./game.html"), 450);
});

// REGISTER
$("registerBtn")?.addEventListener("click", () => {
    const u = $("regUser")?.value?.trim();
    const p = $("regPass")?.value?.trim();

    const msgEl = $("regMsg");
    if (!u || !p) return toast(msgEl, "Enter username + password.", "bad");

    const res = registerMock(u, p);
    if (!res.ok) return toast(msgEl, res.msg, "bad");

    toast(msgEl, "Registered. You can login now.", "ok");
});

// SKIP TO GAME (sets session so it won't become 'undefined')
$("skipBtn")?.addEventListener("click", (e) => {
    e.preventDefault();
    setSession("guest");
    window.location.href = "./game.html";
});