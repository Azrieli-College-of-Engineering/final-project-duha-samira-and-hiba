import {
    getSession,
    clearSession,
    saveScore,
    getScores,
    postComment,
    getComments,
    resetDemoData,
} from "./api.js";

const $ = (id) => document.getElementById(id);

const boardEl = $("board");
const userPill = $("userPill");
const timePill = $("timePill");
const scorePill = $("scorePill");

const restartBtn = $("restartBtn");
const resetDemoBtn = $("resetDemoBtn"); // NEW
const logoutBtn = $("logoutBtn");
const saveScoreBtn = $("saveScoreBtn") || $("saveScore"); // supports old/new id
const saveMsg = $("saveMsg");

const difficultySelect = $("difficultySelect");
const movesPill = $("movesPill");
const pairsPill = $("pairsPill");

const winOverlay = $("winOverlay");
const closeWinBtn = $("closeWinBtn");
const winSaveBtn = $("winSaveBtn");
const playAgainBtn = $("playAgainBtn");
const winTime = $("winTime");
const winMoves = $("winMoves");
const winScore = $("winScore");

const modeSelect = $("modeSelect");
const commentInput = $("commentInput");
const addCommentBtn = $("addCommentBtn");
const commentsList = $("commentsList");
const commentMsg = $("commentMsg");

const leaderBody = $("leaderBody");

// Big pool so we can support multiple board sizes.
const ICON_POOL = [
    "🍉", "🍇", "🥑", "🍍", "🍋", "🥝", "🍒", "🍓",
    "🍑", "🍊", "🍏", "🍌", "🥥", "🍈", "🫐", "🍐",
    "🥕", "🌶️",
];

let cards = [];
let flipped = [];
let lock = false;
let score = 0;
let moves = 0;
let pairsTotal = 8;

let timerId = null;
let startMs = 0;
let finished = false;

function toast(el, msg, type = "") {
    if (!el) return;
    el.className = `toast ${type}`.trim();
    el.textContent = msg;
    el.style.display = "block";
    clearTimeout(el._t);
    el._t = setTimeout(() => (el.style.display = "none"), 2200);
}

function startTimer() {
    stopTimer();
    startMs = Date.now();
    timePill.textContent = "Time: 0s";
    timerId = setInterval(() => {
        const s = Math.floor((Date.now() - startMs) / 1000);
        timePill.textContent = `Time: ${s}s`;
    }, 250);
}

function elapsedSeconds() {
    return Math.floor((Date.now() - startMs) / 1000);
}

function stopTimer() {
    if (timerId) clearInterval(timerId);
    timerId = null;
}

function renderBoard() {
    boardEl.innerHTML = "";
    cards.forEach((c, idx) => {
        const div = document.createElement("button");
        div.className = "tile";
        div.type = "button";
        div.dataset.idx = String(idx);

        if (c.revealed) div.classList.add("is-revealed");
        if (c.matched) div.classList.add("is-matched");

        div.disabled = c.matched || finished;
        div.setAttribute(
            "aria-label",
            c.revealed || c.matched ? `Card ${idx + 1}: ${c.icon}` : `Card ${idx + 1}`
        );

        const inner = document.createElement("div");
        inner.className = "tileInner";

        const front = document.createElement("div");
        front.className = "tileFace tileFront";
        const mark = document.createElement("div");
        mark.className = "tileFrontMark";
        mark.textContent = "?";
        front.appendChild(mark);

        const back = document.createElement("div");
        back.className = "tileFace tileBack";
        const icon = document.createElement("div");
        icon.className = "tileIcon";
        icon.textContent = c.icon;
        back.appendChild(icon);

        inner.appendChild(front);
        inner.appendChild(back);
        div.appendChild(inner);

        div.addEventListener("click", () => handleClick(idx));
        boardEl.appendChild(div);
    });
}

function updateScore(delta) {
    score += delta;
    if (score < 0) score = 0;
    scorePill.textContent = `Score: ${score}`;
}

function updateStats() {
    if (movesPill) movesPill.textContent = String(moves);
    const matched = cards.filter((c) => c.matched).length / 2;
    if (pairsPill) pairsPill.textContent = `${matched}/${pairsTotal}`;
}

function allMatched() {
    return cards.every((c) => c.matched);
}

function handleClick(idx) {
    if (lock || finished) return;
    const c = cards[idx];
    if (c.revealed || c.matched) return;

    c.revealed = true;
    flipped.push(idx);
    renderBoard();

    if (flipped.length === 2) {
        lock = true;
        const [a, b] = flipped;

        moves += 1;
        updateStats();

        if (cards[a].icon === cards[b].icon) {
            cards[a].matched = true;
            cards[b].matched = true;
            updateScore(10);
            flipped = [];
            lock = false;
            renderBoard();
            updateStats();

            if (allMatched()) {
                finished = true;
                stopTimer();
                openWinModal();
            }
            return;
        }

        updateScore(-1);
        setTimeout(() => {
            cards[a].revealed = false;
            cards[b].revealed = false;
            flipped = [];
            lock = false;
            renderBoard();
        }, 650);
    }
}

function openWinModal() {
    if (!winOverlay) return;

    const t = elapsedSeconds();
    if (winTime) winTime.textContent = `${t}s`;
    if (winMoves) winMoves.textContent = String(moves);
    if (winScore) winScore.textContent = String(score);

    winOverlay.style.display = "grid";
    winOverlay.setAttribute("aria-hidden", "false");
}

function closeWinModal() {
    if (!winOverlay) return;
    winOverlay.style.display = "none";
    winOverlay.setAttribute("aria-hidden", "true");
}

function difficultyConfig() {
    const v = (difficultySelect?.value ?? "easy").toLowerCase();
    if (v === "hard") return { cols: 6, pairs: 12 };
    if (v === "medium") return { cols: 5, pairs: 10 };
    return { cols: 4, pairs: 8 };
}

function resetGame() {
    finished = false;
    lock = false;
    flipped = [];
    score = 0;
    moves = 0;
    scorePill.textContent = "Score: 0";

    const cfg = difficultyConfig();
    pairsTotal = cfg.pairs;
    boardEl.style.setProperty("--cols", String(cfg.cols));

    updateStats();

    const chosen = ICON_POOL.slice(0, pairsTotal);
    const deck = chosen.concat(chosen).map((icon) => ({ icon, revealed: false, matched: false }));

    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    cards = deck;
    renderBoard();
    startTimer();

    if (saveMsg) saveMsg.style.display = "none";
    closeWinModal();
}

function escapeHtml(s) {
    return String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function refreshComments() {
    const mode = modeSelect.value; // "vuln" or "secure"
    const items = getComments(12);

    commentsList.innerHTML = "";
    items.forEach((c) => {
        const user = c.user ?? "guest";
        const text = c.text ?? "";

        const div = document.createElement("div");
        div.className = "commentItem";

        if (mode === "vuln") {
            // demo: vulnerable (intentionally)
            div.innerHTML = `<b>${escapeHtml(user)}:</b> ${text}`;
        } else {
            // secure: render user + text safely
            div.innerHTML = `<b>${escapeHtml(user)}:</b> `;
            div.appendChild(document.createTextNode(text));
        }

        commentsList.appendChild(div);
    });
}

function refreshLeaderboard() {
    const scores = getScores(10);
    leaderBody.innerHTML = "";

    scores.forEach((s) => {
        const tr = document.createElement("tr");

        const tdU = document.createElement("td");
        tdU.textContent = s.user ?? "guest";

        const tdS = document.createElement("td");
        tdS.textContent = String(s.score ?? 0);

        const tdD = document.createElement("td");
        tdD.textContent = s.date ?? "";

        tr.appendChild(tdU);
        tr.appendChild(tdS);
        tr.appendChild(tdD);

        leaderBody.appendChild(tr);
    });
}

// events
restartBtn.addEventListener("click", resetGame);
difficultySelect?.addEventListener("change", resetGame);

resetDemoBtn?.addEventListener("click", () => {
    const ok = confirm(
        "Reset demo data?\n\nThis will clear:\n- scores\n- comments\n- session\n\nUsers will be kept."
    );
    if (!ok) return;

    stopTimer();
    resetDemoData({ keepUsers: true });
    const sess = getSession();
    userPill.textContent = `User: ${sess.user}`;

    // clean UI
    if (saveMsg) saveMsg.style.display = "none";
    if (commentInput) commentInput.value = "";

    // refresh
    refreshLeaderboard();
    refreshComments();
    resetGame();
});

logoutBtn.addEventListener("click", () => {
    stopTimer();
    clearSession();
    window.location.href = "./index.html";
});

if (saveScoreBtn) {
    saveScoreBtn.addEventListener("click", () => {
        const sess = getSession();
        saveScore(sess.user, score);
        toast(saveMsg, "Saved locally (backend not running).", "ok");
        refreshLeaderboard();
    });
}

winSaveBtn?.addEventListener("click", () => {
    const sess = getSession();
    saveScore(sess.user, score);
    toast(saveMsg, "Saved locally (backend not running).", "ok");
    refreshLeaderboard();
});

playAgainBtn?.addEventListener("click", () => {
    closeWinModal();
    resetGame();
});

closeWinBtn?.addEventListener("click", closeWinModal);

winOverlay?.addEventListener("click", (e) => {
    if (e.target === winOverlay) closeWinModal();
});

addCommentBtn.addEventListener("click", () => {
    const txt = commentInput.value;
    if (!txt || !txt.trim()) {
        return toast(commentMsg, "Please enter a comment.", "bad");
    }

    const sess = getSession();
    postComment(sess.user, txt);
    commentInput.value = "";
    toast(commentMsg, "Comment added.", "ok");
    refreshComments();
});

modeSelect.addEventListener("change", refreshComments);

// init
(function init() {
    const sess = getSession();
    userPill.textContent = `User: ${sess.user}`;
    resetGame();
    refreshLeaderboard();
    refreshComments();
})();