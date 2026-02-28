import {
    getSession,
    setSession,
    clearSession,
    me,
    logout,
    saveScore,
    getScores,
    postComment,
    getComments,
    resetDemoData,
} from "./api.js";

const $ = (id) => document.getElementById(id);

let scoreSavedThisRun = false;

const boardEl = $("board");
const userPill = $("userPill");
const timePill = $("timePill");
const scorePill = $("scorePill");

const restartBtn = $("restartBtn");
const resetDemoBtn = $("resetDemoBtn");
const logoutBtn = $("logoutBtn");
const saveScoreBtn = $("saveScoreBtn") || $("saveScore");
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

let currentUser = "guest";

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
    scoreSavedThisRun = false;
    if (saveScoreBtn) saveScoreBtn.disabled = false;
    if (winSaveBtn) winSaveBtn.disabled = false;

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
    const deck = chosen.concat(chosen).map((icon) => ({
        icon,
        revealed: false,
        matched: false,
    }));

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

async function refreshComments() {
    const mode = (modeSelect?.value || "secure");
    const items = await getComments(12);

    commentsList.innerHTML = "";
    items.forEach((c) => {
        const user = c.user ?? "guest";
        const text = c.text ?? "";

        const div = document.createElement("div");
        div.className = "commentItem";

        if (mode === "vuln") {
            div.innerHTML = `<b>${escapeHtml(user)}:</b> ${text}`;
        } else {
            div.innerHTML = `<b>${escapeHtml(user)}:</b> `;
            div.appendChild(document.createTextNode(text));
        }

        commentsList.appendChild(div);
    });
}

async function refreshLeaderboard() {
    const scores = await getScores(10);
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

/**
 * ✅ THE FIX:
 * user pill comes from /api/me (session cookie), not localStorage
 * fallback to localStorage if backend isn't reachable
 */
async function refreshUserPill() {
    try {
        const data = await me(); // { user: {id, username} } OR { user: null }
        if (data?.user?.id && data?.user?.username) {
            setSession(data.user); // keep local copy for saveScore/comment
            currentUser = data.user.username;
        } else {
            clearSession();
            currentUser = "guest";
        }
    } catch {
        // backend not reachable => fallback to localStorage
        const sess = getSession();
        currentUser = sess?.user?.username || "guest";
    }

    userPill.textContent = `User: ${currentUser}`;
}

// events
restartBtn.addEventListener("click", resetGame);
difficultySelect?.addEventListener("change", resetGame);

resetDemoBtn?.addEventListener("click", async () => {
    const ok = confirm("Reset demo session?\n\nThis will logout current user.\n(DB data stays.)");
    if (!ok) return;

    stopTimer();
    await resetDemoData();
    await refreshUserPill();

    if (saveMsg) saveMsg.style.display = "none";
    if (commentInput) commentInput.value = "";

    await refreshLeaderboard();
    await refreshComments();
    resetGame();
});

logoutBtn.addEventListener("click", async () => {
    stopTimer();
    await logout().catch(() => { });
    window.location.href = "./index.html";
});

if (saveScoreBtn) {
    saveScoreBtn.addEventListener("click", async () => {
        if (scoreSavedThisRun) {
            return toast(saveMsg, "Score already saved for this game ✅", "bad");
        }

        const res = await saveScore(score);
        if (!res?.ok) return toast(saveMsg, "Login first to save score.", "bad");

        scoreSavedThisRun = true;
        saveScoreBtn.disabled = true;
        if (winSaveBtn) winSaveBtn.disabled = true;

        toast(saveMsg, "Score saved to backend.", "ok");
        await refreshLeaderboard();
    });
}

winSaveBtn?.addEventListener("click", async () => {
    if (scoreSavedThisRun) {
        return toast(saveMsg, "Score already saved for this game ✅", "bad");
    }

    const res = await saveScore(score);
    if (!res?.ok) return toast(saveMsg, "Login first to save score.", "bad");

    scoreSavedThisRun = true;
    if (saveScoreBtn) saveScoreBtn.disabled = true;
    winSaveBtn.disabled = true;

    toast(saveMsg, "Score saved to backend.", "ok");
    await refreshLeaderboard();
});

playAgainBtn?.addEventListener("click", () => {
    closeWinModal();
    resetGame();
});

closeWinBtn?.addEventListener("click", closeWinModal);

winOverlay?.addEventListener("click", (e) => {
    if (e.target === winOverlay) closeWinModal();
});

addCommentBtn.addEventListener("click", async () => {
    const txt = commentInput.value;
    if (!txt || !txt.trim()) return toast(commentMsg, "Please enter a comment.", "bad");

    const res = await postComment(txt);
    if (!res?.ok) return toast(commentMsg, "Login first to comment.", "bad");

    commentInput.value = "";
    toast(commentMsg, "Comment saved to backend.", "ok");
    await refreshComments();
});

modeSelect.addEventListener("change", () => {
    refreshComments();
});

// init
(async function init() {
    await refreshUserPill();
    resetGame();
    await refreshLeaderboard();

    if (modeSelect) modeSelect.value = "secure";
    await refreshComments();
})();