// ============================================================
// A3‑ULTRA — FULL MERGED SCRIPT.JS (PART 1 / 5)
// ============================================================

// ------------------------------------------------------------
// GLOBAL STATE
// ------------------------------------------------------------
window.STATE = {
    users: {},
    currentUser: null,
    lastUser: null,
    flags: {
        godMode: false,
        luckMode: false
    },
    clicker: {
        clicks: 0,
        lastClickTimes: []
    },
    blackjack: {
        deck: [],
        player: [],
        dealer: [],
        active: false,
        bet: 100
    }
};


// ------------------------------------------------------------
// DOM REFERENCES
// ------------------------------------------------------------

// Login
const loginContainer = document.getElementById("loginContainer");
const loginUsername = document.getElementById("loginUsername");
const loginPassword = document.getElementById("loginPassword");
const loginBtn = document.getElementById("loginBtn");
const loginError = document.getElementById("loginError");

// Game area
const gameArea = document.getElementById("gameArea");

// HUD
const hudUsername = document.getElementById("hudUsername");
const moneyDisplay = document.getElementById("moneyDisplay");
const caseCountDisplay = document.getElementById("caseCountDisplay");
const clickCountDisplay = document.getElementById("clickCountDisplay");
const cpsDisplay = document.getElementById("cpsDisplay");
const xpFill = document.getElementById("xpFill");
const xpText = document.getElementById("xpText");

// Clicker
const bigClickBtn = document.getElementById("bigClickBtn");

// Cases
const casePriceValue = document.getElementById("casePriceValue");
const openCaseBtn = document.getElementById("openCaseBtn");
const open10CasesBtn = document.getElementById("open10CasesBtn");
const caseResult = document.getElementById("caseResult");
const rollViewport = document.getElementById("rollViewport");
const rollStrip = document.getElementById("rollStrip");

// Inventory
const inventoryGrid = document.getElementById("inventoryGrid");

// Leaderboard
const leaderboardTable = document.getElementById("leaderboardTable");

// Settings
const themeSelect = document.getElementById("themeSelect");
const sfxToggle = document.getElementById("sfxToggle");
const streamerModeToggle = document.getElementById("streamerModeToggle");

// Owner / Admin
const openOwnerPanelBtn = document.getElementById("openOwnerPanelBtn");
const ownerLoginModal = document.getElementById("ownerLoginModal");
const ownerPanelModal = document.getElementById("ownerPanelModal");
const ownerUserInput = document.getElementById("ownerUserInput");
const ownerPassInput = document.getElementById("ownerPassInput");
const ownerLoginBtn = document.getElementById("ownerLoginBtn");
const ownerLoginCancelBtn = document.getElementById("ownerLoginCancelBtn");
const ownerLoginError = document.getElementById("ownerLoginError");
const ownerPanelCloseBtn = document.getElementById("ownerPanelCloseBtn");

const ownerTabs = document.querySelectorAll(".admin-tab");
const ownerTabContents = document.querySelectorAll(".admin-tab-content");

// Owner buttons
const opInfiniteMoneyBtn = document.getElementById("opInfiniteMoneyBtn");
const opInfiniteXpBtn = document.getElementById("opInfiniteXpBtn");
const opMaxLevelBtn = document.getElementById("opMaxLevelBtn");
const opGodModeBtn = document.getElementById("opGodModeBtn");
const opLuckModeBtn = document.getElementById("opLuckModeBtn");

const spawnItemBtn = document.getElementById("spawnItemBtn");
const spawnHyperBtn = document.getElementById("spawnHyperBtn");
const spawnContrabandBtn = document.getElementById("spawnContrabandBtn");
const spawnKnifeBtn = document.getElementById("spawnKnifeBtn");
const invItemIdInput = document.getElementById("invItemIdInput");
const invDuplicateBtn = document.getElementById("invDuplicateBtn");
const invDeleteBtn = document.getElementById("invDeleteBtn");

const trollFakePullBtn = document.getElementById("trollFakePullBtn");
const trollFakeBalanceBtn = document.getElementById("trollFakeBalanceBtn");
const trollGhostInventoryBtn = document.getElementById("trollGhostInventoryBtn");
const trollScreenShakeBtn = document.getElementById("trollScreenShakeBtn");
const trollFlashbangBtn = document.getElementById("trollFlashbangBtn");
const trollInvertControlsBtn = document.getElementById("trollInvertControlsBtn");
const trollForceCaseBtn = document.getElementById("trollForceCaseBtn");
const trollForceMysteryBtn = document.getElementById("trollForceMysteryBtn");
const trollForceBadLuckBtn = document.getElementById("trollForceBadLuckBtn");
const trollForceGoodLuckBtn = document.getElementById("trollForceGoodLuckBtn");
const trollFakeBanBtn = document.getElementById("trollFakeBanBtn");

// Mystery Box
const openMysteryBtn = document.getElementById("openMysteryBtn");
const mysteryResult = document.getElementById("mysteryResult");

// Blackjack
const bjPlayerEl = document.getElementById("bjPlayer");
const bjDealerEl = document.getElementById("bjDealer");
const bjHitBtn = document.getElementById("bjHitBtn");
const bjStandBtn = document.getElementById("bjStandBtn");
const bjResult = document.getElementById("bjResult");

// Debug console
const debugConsole = document.getElementById("debugConsole");
const debugBody = document.getElementById("debugBody");

// Views
const views = document.querySelectorAll(".view");
const sideButtons = document.querySelectorAll(".side-btn");

// ============================================================
// DEBUG LOG
// ============================================================
function logDebug(msg) {
    if (!debugBody) return;
    const time = new Date().toLocaleTimeString();
    debugBody.textContent += `[${time}] ${msg}\n`;
    debugBody.scrollTop = debugBody.scrollHeight;
}

document.addEventListener("keydown", e => {
    if (e.key === "F2") {
        if (!debugConsole) return;
        debugConsole.style.display =
            debugConsole.style.display === "flex" ? "none" : "flex";
    }
});

// ============================================================
// STORAGE: LOAD / SAVE USERS + LAST USER
// ============================================================
let _saveUsersTimeout = null;

function saveAllUsers() {
    if (!STATE || !STATE.users) return;
    if (_saveUsersTimeout) return;

    _saveUsersTimeout = setTimeout(() => {
        _saveUsersTimeout = null;
        try {
            localStorage.setItem("A3_USERS", JSON.stringify(STATE.users));
            if (STATE.currentUser) {
                localStorage.setItem("A3_LAST_USER", STATE.currentUser.username);
            }
        } catch (e) {
            logDebug("Save error: " + e.message);
        }
    }, 200);
}

function loadAllUsers() {
    try {
        const raw = localStorage.getItem("A3_USERS");
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === "object") {
                STATE.users = parsed;
            }
        }
        const last = localStorage.getItem("A3_LAST_USER");
        if (last) STATE.lastUser = last;
    } catch (e) {
        logDebug("Load error: " + e.message);
    }
}

// ============================================================
// USER / LOGIN / AUTO-LOGIN
// ============================================================
function createDefaultUser(username, password) {
    return {
        username,
        password,
        money: 0,
        cases: 0,
        clicks: 0,
        cps: 0,
        xp: 0,
        level: 1,
        xpToNext: 100,
        inventory: [],
        upgrades: {
            clickPower: 1,
            autoClicker: 0,
            luckBoost: 0,
            caseDiscount: 0,
            xpBoost: 0,
            inventorySize: 50,
            rebirthBoost: 0
        },
        settings: {
            theme: "darkmatter",
            sfx: true,
            streamerMode: false
        },
        lastMysteryAt: null
    };
}

function setCurrentUser(user) {
    STATE.currentUser = user;
    if (hudUsername) hudUsername.textContent = user.username;
    initializeUI();
    saveAllUsers();
}

function handleLogin() {
    const user = (loginUsername?.value || "").trim();
    const pass = (loginPassword?.value || "").trim();

    if (!user || !pass) {
        if (loginError) {
            loginError.textContent = "Enter username and password.";
            loginError.style.display = "block";
        }
        return;
    }

    if (!STATE.users[user]) {
        STATE.users[user] = createDefaultUser(user, pass);
        logDebug("Created new user: " + user);
    } else {
        if (STATE.users[user].password !== pass) {
            if (loginError) {
                loginError.textContent = "Incorrect password.";
                loginError.style.display = "block";
            }
            return;
        }
    }

    if (loginError) loginError.style.display = "none";
    setCurrentUser(STATE.users[user]);

    if (loginContainer) loginContainer.style.display = "none";
    if (gameArea) gameArea.style.display = "flex";

    logDebug("User logged in: " + user);
}

if (loginBtn) loginBtn.addEventListener("click", handleLogin);
if (loginPassword) {
    loginPassword.addEventListener("keydown", e => {
        if (e.key === "Enter") handleLogin();
    });
}
if (loginUsername) {
    loginUsername.addEventListener("keydown", e => {
        if (e.key === "Enter") handleLogin();
    });
}

// Auto-login last user if exists
function tryAutoLogin() {
    if (!STATE.lastUser) return;
    const u = STATE.users[STATE.lastUser];
    if (!u) return;

    setCurrentUser(u);
    if (loginContainer) loginContainer.style.display = "none";
    if (gameArea) gameArea.style.display = "flex";
    logDebug("Auto-logged in as: " + u.username);
}

// ============================================================
// VIEW SWITCHING
// ============================================================
function showView(id) {
    views.forEach(v => v.classList.remove("active"));
    const target = document.getElementById(id);
    if (target) target.classList.add("active");
}

sideButtons.forEach(btn => {
    const target = btn.getAttribute("data-view-target");
    if (!target) return;
    btn.addEventListener("click", () => {
        showView(target);
    });
});

// ============================================================
// BASIC UI HELPERS (HEADERS ONLY, IMPLEMENTED IN LATER PARTS)
// ============================================================
function updateMoney(delta) {}
function updateCases(delta) {}
function updateClickerDisplay() {}
function updateXP(amount) {}
function renderInventory() {}
function renderLeaderboard() {}
function updateCasePriceUI() {}
function applyTheme(themeKey) {}
function loadUserSettings() {}

// ============================================================
// INITIALIZE UI AFTER LOGIN
// ============================================================
function initializeUI() {
    if (!STATE.currentUser) return;

    // Money / cases / clicks / cps / xp
    updateMoney(0);
    updateCases(0);
    updateClickerDisplay();
    updateXP(0);

    // Inventory
    renderInventory();

    // Leaderboard
    renderLeaderboard();

    // Case price
    updateCasePriceUI();

    // Settings / theme
    loadUserSettings();

    // Owner button visibility
    if (openOwnerPanelBtn) {
        const owners = ["owner", "admin", "LOGAN"];
        if (owners.includes(STATE.currentUser.username)) {
            openOwnerPanelBtn.style.display = "block";
        } else {
            openOwnerPanelBtn.style.display = "none";
        }
    }

    // Default view
    showView("clickerView");
}

// ============================================================
// BOOTSTRAP
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
    loadAllUsers();
    logDebug("A3‑ULTRA booting…");
    tryAutoLogin();
});
// ============================================================
// PART 2 / 5 — MONEY, XP, CLICKER, CASE SYSTEM BASE
// ============================================================

// ------------------------------------------------------------
// MONEY
// ------------------------------------------------------------
function updateMoney(delta) {
    if (!STATE.currentUser) return;

    STATE.currentUser.money += delta;
    if (STATE.currentUser.money < 0) STATE.currentUser.money = 0;

    if (moneyDisplay)
        moneyDisplay.textContent = "$" + STATE.currentUser.money.toLocaleString();

    saveAllUsers();
}

// ------------------------------------------------------------
// CASES
// ------------------------------------------------------------
function updateCases(delta) {
    if (!STATE.currentUser) return;

    STATE.currentUser.cases += delta;
    if (STATE.currentUser.cases < 0) STATE.currentUser.cases = 0;

    if (caseCountDisplay)
        caseCountDisplay.textContent = STATE.currentUser.cases;

    saveAllUsers();
}

// ------------------------------------------------------------
// CLICKER DISPLAY
// ------------------------------------------------------------
function updateClickerDisplay() {
    if (!STATE.currentUser) return;

    if (clickCountDisplay)
        clickCountDisplay.textContent = STATE.currentUser.clicks;

    if (cpsDisplay)
        cpsDisplay.textContent = STATE.currentUser.cps.toFixed(1);
}

// ------------------------------------------------------------
// XP + LEVELING
// ------------------------------------------------------------
function updateXP(amount) {
    if (!STATE.currentUser) return;

    const user = STATE.currentUser;

    // XP boost upgrade
    const boost = 1 + (user.upgrades.xpBoost || 0) * 0.1;
    const xpGain = Math.floor(amount * boost);

    user.xp += xpGain;

    // Level up loop
    while (user.xp >= user.xpToNext) {
        user.xp -= user.xpToNext;
        user.level++;
        user.xpToNext = Math.floor(user.xpToNext * 1.25);
        logDebug(`Level up! Now level ${user.level}`);
    }

    // Update XP bar
    const pct = (user.xp / user.xpToNext) * 100;
    if (xpFill) xpFill.style.width = pct + "%";
    if (xpText) xpText.textContent = `Level ${user.level} • ${user.xp} / ${user.xpToNext} XP`;

    saveAllUsers();
}

// ------------------------------------------------------------
// CLICKER SYSTEM
// ------------------------------------------------------------
if (bigClickBtn) {
    bigClickBtn.addEventListener("click", () => {
        if (!STATE.currentUser) return;

        const power = STATE.currentUser.upgrades.clickPower || 1;

        updateMoney(power);
        updateXP(1);

        STATE.currentUser.clicks++;
        STATE.clicker.clicks = STATE.currentUser.clicks;

        // CPS tracking
        const now = Date.now();
        STATE.clicker.lastClickTimes.push(now);
        STATE.clicker.lastClickTimes = STATE.clicker.lastClickTimes.filter(
            t => now - t < 1000
        );

        STATE.currentUser.cps = STATE.clicker.lastClickTimes.length;

        updateClickerDisplay();
    });
}

// ------------------------------------------------------------
// CASE PRICE CALCULATION
// ------------------------------------------------------------
function getCasePrice() {
    if (!STATE.currentUser) return 100;

    const base = 100;
    const discount = STATE.currentUser.upgrades.caseDiscount || 0;
    const factor = 1 - discount * 0.05;

    return Math.max(10, Math.floor(base * factor));
}

function updateCasePriceUI() {
    if (casePriceValue)
        casePriceValue.textContent = "$" + getCasePrice().toLocaleString();
}

// ------------------------------------------------------------
// ITEM POOLS
// ------------------------------------------------------------
const ITEM_POOLS = {
    milspec: [
        { name: "Blue SMG", base: 5 },
        { name: "Blue Pistol", base: 6 }
    ],
    restricted: [
        { name: "Purple Rifle", base: 20 },
        { name: "Purple SMG", base: 18 }
    ],
    classified: [
        { name: "Pink Rifle", base: 60 },
        { name: "Pink Sniper", base: 80 }
    ],
    covert: [
        { name: "Red AK", base: 200 },
        { name: "Red M4", base: 220 }
    ],
    contraband: [
        { name: "Contraband AWP", base: 1000 }
    ],
    knives: [
        { name: "Knife Fade", base: 1500 },
        { name: "Knife Doppler", base: 1800 }
    ],
    hyper: [
        { name: "HYPER Dragon", base: 5000 },
        { name: "HYPER Death Ray", base: 12000 },
        { name: "HYPER Tickler", base: 8000 },
        { name: "HYPER Bubble Wand", base: 33000 },
        { name: "HYPER Logan's Laser", base: 78000 },
        { name: "MRO's 10 days OSS", base: 90000 },
        { name: "DEATH Step on a Lego", base: 19000 },
        { name: "CURSED Sword", base: 19000 },
    ]
};

// ------------------------------------------------------------
// CASE ROLL (NO ANIMATION YET — JUST LOGIC)
// ------------------------------------------------------------
function rollCaseOnce() {
    const r = Math.random();
    let poolName = "milspec";

    if (r < 0.6) poolName = "milspec";
    else if (r < 0.8) poolName = "restricted";
    else if (r < 0.92) poolName = "classified";
    else if (r < 0.98) poolName = "covert";
    else if (r < 0.995) poolName = "contraband";
    else poolName = "knives";

    if (STATE.flags.luckMode) poolName = "hyper";

    const pool = ITEM_POOLS[poolName];
    const chosen = pool[Math.floor(Math.random() * pool.length)];

    const item = {
        id: "item_" + Math.random().toString(36).slice(2),
        name: chosen.name,
        rarity: poolName,
        float: (Math.random()).toFixed(4),
        value: chosen.base * 4,
        type: poolName,
        picture : "https://seagm-media.seagmcdn.com/game_480/1426.jpg?x-oss-process=image/resize,w_360"
    };

    STATE.currentUser.inventory.push(item);
    renderInventory();

    return item;
}

// ------------------------------------------------------------
// INVENTORY RENDERER (BASE VERSION)
// ------------------------------------------------------------
function renderInventory() {
    if (!inventoryGrid || !STATE.currentUser) return;

    const inv = STATE.currentUser.inventory || [];
    inventoryGrid.innerHTML = "";

    if (inv.length === 0) {
        const div = document.createElement("div");
        div.className = "inventory-empty";
        div.textContent = "No items yet.";
        inventoryGrid.appendChild(div);
        return;
    }

    inv.forEach((item, idx) => {
        const div = document.createElement("div");
        div.className = "inventory-item rarity-" + (item.rarity || "milspec");
        div.innerHTML = `
            <div>${item.name}</div>
            <img src=${item.picture}>
            <div style="font-size:12px;opacity:0.8;">Float: ${item.float}</div>
            <div style="font-size:12px;opacity:0.8;">$${item.value.toLocaleString()}</div>
            <div style="font-size:11px;opacity:0.6;">#${idx}</div>
        `;
        inventoryGrid.appendChild(div);
    });
}
// ============================================================
// PART 3 / 5 — CASE ANIMATION, CASE OPENING, UPGRADES, LEADERBOARD
// ============================================================

// ------------------------------------------------------------
// CASE ROLL ANIMATION
// ------------------------------------------------------------
function animateCaseRoll(finalItem) {
    if (!rollStrip || !rollViewport) return;

    rollStrip.innerHTML = "";
    const items = [];

    // Generate 40 random items for the animation strip
    for (let i = 0; i < 40; i++) {
        const poolNames = Object.keys(ITEM_POOLS);
        const poolName = poolNames[Math.floor(Math.random() * poolNames.length)];
        const pool = ITEM_POOLS[poolName];
        const chosen = pool[Math.floor(Math.random() * pool.length)];
       
        items.push({ ...chosen, rarity: poolName });
    }

    // Last item is the real reward
    items[items.length - 1] = {
        name: finalItem.name,
        rarity: finalItem.rarity
    };

    // Build strip
    items.forEach(it => {
        const div = document.createElement("div");
        div.className = "inventory-item rarity-" + it.rarity;
        div.textContent = it.name;
        rollStrip.appendChild(div);
    });

    const itemWidth = 140 + 12; // width + gap
    const totalWidth = items.length * itemWidth;
    rollStrip.style.width = totalWidth + "px";

    const centerOffset = (rollViewport.clientWidth / 2) - (itemWidth / 2);
    const targetX = -(totalWidth - itemWidth - centerOffset);

    rollStrip.style.transform = "translateX(0px)";
    void rollStrip.offsetWidth; // force reflow

    rollStrip.style.transition = "transform 3s cubic-bezier(.08,.6,.14,1)";
    rollStrip.style.transform = `translateX(${targetX}px)`;
}

// ------------------------------------------------------------
// CASE OPEN BUTTON
// ------------------------------------------------------------
if (openCaseBtn) {
    openCaseBtn.addEventListener("click", () => {
        if (!STATE.currentUser) return;

        const price = getCasePrice();
        if (STATE.currentUser.money < price && !STATE.flags.godMode) {
            caseResult.textContent = "Not enough money.";
            return;
        }

        if (!STATE.flags.godMode) updateMoney(-price);

        const item = rollCaseOnce();
        animateCaseRoll(item);

        caseResult.textContent = `You got: ${item.name}`;
        updateCases(1);
    });
}

// ------------------------------------------------------------
// OPEN 10 CASES
// ------------------------------------------------------------
if (open10CasesBtn) {
    open10CasesBtn.addEventListener("click", () => {
        if (!STATE.currentUser) return;

        const price = getCasePrice() * 10;
        if (STATE.currentUser.money < price && !STATE.flags.godMode) {
            caseResult.textContent = "Not enough money for 10 cases.";
            return;
        }

        if (!STATE.flags.godMode) updateMoney(-price);

        let lastItem = null;
        for (let i = 0; i < 10; i++) {
            lastItem = rollCaseOnce();
        }

        animateCaseRoll(lastItem);
        caseResult.textContent = `You opened 10 cases. Last: ${lastItem.name}`;
        updateCases(10);
    });
}

// ------------------------------------------------------------
// UPGRADES SYSTEM
// ------------------------------------------------------------
const upgradeEls = document.querySelectorAll(".upgrade-item");

upgradeEls.forEach(el => {
    el.addEventListener("click", () => {
        if (!STATE.currentUser) return;

        const key = el.getAttribute("data-upg");
        if (!key) return;

        const user = STATE.currentUser;
        const level = user.upgrades[key] || 0;
        const cost = (level + 1) * 100;

        if (user.money < cost && !STATE.flags.godMode) {
            logDebug("Not enough money for upgrade: " + key);
            return;
        }

        if (!STATE.flags.godMode) user.money -= cost;

        user.upgrades[key] = level + 1;
        updateMoney(0);

        logDebug(`Upgrade bought: ${key} -> ${user.upgrades[key]}`);

        if (key === "caseDiscount") updateCasePriceUI();

        saveAllUsers();
    });
});

// ------------------------------------------------------------
// LEADERBOARD SYSTEM
// ------------------------------------------------------------
function renderLeaderboard() {
    if (!leaderboardTable) return;

    const users = Object.values(STATE.users || {});
    users.sort((a, b) => b.money - a.money);

    leaderboardTable.innerHTML = `
        <tr>
            <th>User</th>
            <th>Money</th>
            <th>Level</th>
        </tr>
    `;

    users.slice(0, 20).forEach(u => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${u.username}</td>
            <td>$${u.money.toLocaleString()}</td>
            <td>${u.level}</td>
        `;
        leaderboardTable.appendChild(tr);
    });
}
// ============================================================
// PART 4 / 5 — SETTINGS, THEMES, OWNER PANEL, POWERS, SPAWN, TROLL
// ============================================================

// ------------------------------------------------------------
// SETTINGS / THEMES
// ------------------------------------------------------------
function applyTheme(themeKey) {
    const body = document.body;
    body.classList.remove(
        "theme-darkmatter",
        "theme-electric",
        "theme-fire",
        "theme-hyper",
        "theme-neo",
        "theme-light"
    );
    body.classList.add("theme-" + themeKey);
}

function loadUserSettings() {
    if (!STATE.currentUser) return;
    const s = STATE.currentUser.settings || {};

    const theme = s.theme || "darkmatter";
    applyTheme(theme);
    if (themeSelect) themeSelect.value = theme;

    if (sfxToggle) sfxToggle.checked = s.sfx !== false;
    if (streamerModeToggle) streamerModeToggle.checked = !!s.streamerMode;
}

if (themeSelect) {
    themeSelect.addEventListener("change", () => {
        if (!STATE.currentUser) return;
        const val = themeSelect.value;
        STATE.currentUser.settings.theme = val;
        applyTheme(val);
        saveAllUsers();
    });
}

if (sfxToggle) {
    sfxToggle.addEventListener("change", () => {
        if (!STATE.currentUser) return;
        STATE.currentUser.settings.sfx = sfxToggle.checked;
        saveAllUsers();
    });
}

if (streamerModeToggle) {
    streamerModeToggle.addEventListener("change", () => {
        if (!STATE.currentUser) return;
        STATE.currentUser.settings.streamerMode = streamerModeToggle.checked;
        saveAllUsers();
    });
}

// ------------------------------------------------------------
// OWNER PANEL — LOGIN + ACCESS
// ------------------------------------------------------------
const OWNER_USERS = ["owner", "admin", "LOGAN"];

function isOwnerUser(user) {
    if (!user) return false;
    return OWNER_USERS.includes(user.username);
}

if (openOwnerPanelBtn) {
    openOwnerPanelBtn.addEventListener("click", () => {
        if (!STATE.currentUser) return;

        if (!isOwnerUser(STATE.currentUser)) {
            ownerLoginModal.classList.remove("hidden");
            ownerLoginError.style.display = "none";
            ownerUserInput.value = "";
            ownerPassInput.value = "";
        } else {
            ownerPanelModal.classList.remove("hidden");
        }
    });
}

if (ownerLoginCancelBtn) {
    ownerLoginCancelBtn.addEventListener("click", () => {
        ownerLoginModal.classList.add("hidden");
    });
}

if (ownerLoginBtn) {
    ownerLoginBtn.addEventListener("click", () => {
        const u = ownerUserInput.value.trim();
        const p = ownerPassInput.value.trim();

        if (!u || !p) {
            ownerLoginError.textContent = "Enter credentials.";
            ownerLoginError.style.display = "block";
            return;
        }

        if (!STATE.users[u] || STATE.users[u].password !== p) {
            ownerLoginError.textContent = "Invalid owner credentials.";
            ownerLoginError.style.display = "block";
            return;
        }

        ownerLoginError.style.display = "none";
        ownerLoginModal.classList.add("hidden");
        ownerPanelModal.classList.remove("hidden");
        logDebug("Owner logged in: " + u);
    });
}

if (ownerPanelCloseBtn) {
    ownerPanelCloseBtn.addEventListener("click", () => {
        ownerPanelModal.classList.add("hidden");
    });
}

// ------------------------------------------------------------
// OWNER PANEL — TABS
// ------------------------------------------------------------
ownerTabs.forEach(tab => {
    tab.addEventListener("click", () => {
        const target = tab.getAttribute("data-owner-tab");

        ownerTabs.forEach(t => t.classList.remove("active"));
        ownerTabContents.forEach(c => c.classList.remove("active"));

        tab.classList.add("active");
        document.getElementById(target).classList.add("active");
    });
});

// ------------------------------------------------------------
// OWNER POWERS
// ------------------------------------------------------------
if (opInfiniteMoneyBtn) {
    opInfiniteMoneyBtn.addEventListener("click", () => {
        if (!STATE.currentUser) return;
        STATE.currentUser.money = 999999999;
        updateMoney(0);
        logDebug("Owner: Infinite money.");
    });
}

if (opInfiniteXpBtn) {
    opInfiniteXpBtn.addEventListener("click", () => {
        if (!STATE.currentUser) return;
        updateXP(999999);
        logDebug("Owner: Infinite XP.");
    });
}

if (opMaxLevelBtn) {
    opMaxLevelBtn.addEventListener("click", () => {
        if (!STATE.currentUser) return;
        STATE.currentUser.level = 100;
        STATE.currentUser.xp = 0;
        STATE.currentUser.xpToNext = 100000;
        updateXP(0);
        logDebug("Owner: Max level.");
    });
}

if (opGodModeBtn) {
    opGodModeBtn.addEventListener("click", () => {
        STATE.flags.godMode = !STATE.flags.godMode;
        logDebug("God mode: " + STATE.flags.godMode);
    });
}

if (opLuckModeBtn) {
    opLuckModeBtn.addEventListener("click", () => {
        STATE.flags.luckMode = !STATE.flags.luckMode;
        logDebug("Luck mode: " + STATE.flags.luckMode);
    });
}

// ------------------------------------------------------------
// OWNER SPAWN
// ------------------------------------------------------------
function spawnFromPool(poolName) {
    if (!STATE.currentUser) return;

    const pool = ITEM_POOLS[poolName];
    if (!pool || pool.length === 0) return;

    const chosen = pool[Math.floor(Math.random() * pool.length)];

    const item = {
        id: "item_" + Math.random().toString(36).slice(2),
        name: chosen.name,
        rarity: poolName,
        float: (Math.random()).toFixed(4),
        value: chosen.base,
        type: poolName
    };

    STATE.currentUser.inventory.push(item);
    renderInventory();
    saveAllUsers();

    logDebug("Spawned item: " + item.name);
}

if (spawnItemBtn) spawnItemBtn.addEventListener("click", () => spawnFromPool("milspec"));
if (spawnHyperBtn) spawnHyperBtn.addEventListener("click", () => spawnFromPool("hyper"));
if (spawnContrabandBtn) spawnContrabandBtn.addEventListener("click", () => spawnFromPool("contraband"));
if (spawnKnifeBtn) spawnKnifeBtn.addEventListener("click", () => spawnFromPool("knives"));

if (invDuplicateBtn) {
    invDuplicateBtn.addEventListener("click", () => {
        if (!STATE.currentUser) return;

        const idx = parseInt(invItemIdInput.value, 10);
        const inv = STATE.currentUser.inventory;

        if (isNaN(idx) || idx < 0 || idx >= inv.length) return;

        const copy = { ...inv[idx], id: "item_" + Math.random().toString(36).slice(2) };
        inv.push(copy);

        renderInventory();
        saveAllUsers();

        logDebug("Duplicated item index: " + idx);
    });
}

if (invDeleteBtn) {
    invDeleteBtn.addEventListener("click", () => {
        if (!STATE.currentUser) return;

        const idx = parseInt(invItemIdInput.value, 10);
        const inv = STATE.currentUser.inventory;

        if (isNaN(idx) || idx < 0 || idx >= inv.length) return;

        inv.splice(idx, 1);

        renderInventory();
        saveAllUsers();

        logDebug("Deleted item index: " + idx);
    });
}

// ------------------------------------------------------------
// OWNER TROLL EFFECTS
// ------------------------------------------------------------
if (trollFakePullBtn) {
    trollFakePullBtn.addEventListener("click", () => {
        caseResult.textContent = "JACKPOT! (fake)";
        logDebug("Troll: Fake hyper pull.");
    });
}

if (trollFakeBalanceBtn) {
    trollFakeBalanceBtn.addEventListener("click", () => {
        moneyDisplay.textContent = "$999,999,999 (fake)";
        logDebug("Troll: Fake balance.");
    });
}

if (trollGhostInventoryBtn) {
    trollGhostInventoryBtn.addEventListener("click", () => {
        document.body.classList.add("ghost-inventory");
        setTimeout(() => document.body.classList.remove("ghost-inventory"), 5000);
        logDebug("Troll: Ghost inventory.");
    });
}

if (trollScreenShakeBtn) {
    trollScreenShakeBtn.addEventListener("click", () => {
        document.body.classList.add("screen-shake");
        setTimeout(() => document.body.classList.remove("screen-shake"), 600);
        logDebug("Troll: Screen shake.");
    });
}

if (trollFlashbangBtn) {
    trollFlashbangBtn.addEventListener("click", () => {
        const fb = document.createElement("div");
        fb.className = "flashbang";
        document.body.appendChild(fb);
        setTimeout(() => fb.remove(), 800);
        logDebug("Troll: Flashbang.");
    });
}

if (trollInvertControlsBtn) {
    trollInvertControlsBtn.addEventListener("click", () => {
        document.body.classList.add("inverted");
        setTimeout(() => document.body.classList.remove("inverted"), 3000);
        logDebug("Troll: Invert controls.");
    });
}

if (trollFakeBanBtn) {
    trollFakeBanBtn.addEventListener("click", () => {
        const div = document.createElement("div");
        div.className = "fake-ban-popup";
        div.textContent = "You have been permanently banned. (fake)";
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 4000);
        logDebug("Troll: Fake ban.");
    });
}
// ============================================================
// PART 5 / 5 — MYSTERY BOX, BLACKJACK, FINAL OPTIMIZATIONS
// ============================================================

// ------------------------------------------------------------
// MYSTERY BOX SYSTEM
// ------------------------------------------------------------
const MYSTERY_COOLDOWN_MS = 1000 * 60 * 60 * 24; // 24 hours

function getMysteryRemaining(user) {
    if (!user.lastMysteryAt) return 0;
    const diff = Date.now() - user.lastMysteryAt;
    return Math.max(0, MYSTERY_COOLDOWN_MS - diff);
}

function formatMs(ms) {
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;

    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${sec}s`;
    return `${sec}s`;
}

function rollMysteryReward() {
    const r = Math.random();

    // 40% money
    if (r < 0.4) {
        const amount = 500 + Math.floor(Math.random() * 2500);
        STATE.currentUser.money += amount;
        updateMoney(0);
        return `You found $${amount.toLocaleString()}!`;
    }

    // 30% XP
    if (r < 0.7) {
        const xp = 100 + Math.floor(Math.random() * 400);
        updateXP(xp);
        return `You gained ${xp} XP!`;
    }

    // 20% free case
    if (r < 0.9) {
        STATE.currentUser.cases += 1;
        updateCases(0);
        return `You received 1 free case!`;
    }

    // 10% Hyper jackpot
    const pool = ITEM_POOLS.hyper || [];
    if (pool.length === 0) {
        const fallback = 10000;
        STATE.currentUser.money += fallback;
        updateMoney(0);
        return `Jackpot fallback: $${fallback.toLocaleString()}!`;
    }

    const chosen = pool[Math.floor(Math.random() * pool.length)];
    const item = {
        id: "item_" + Math.random().toString(36).slice(2),
        name: chosen.name,
        rarity: "hyper",
        float: (Math.random()).toFixed(4),
        value: chosen.base * 2,
        type: "hyper"
    };

    STATE.currentUser.inventory.push(item);
    renderInventory();

    return `JACKPOT! You got a HYPER: ${item.name}`;
}

if (openMysteryBtn) {
    openMysteryBtn.addEventListener("click", () => {
        if (!STATE.currentUser) {
            mysteryResult.textContent = "Login first.";
            return;
        }

        const remaining = getMysteryRemaining(STATE.currentUser);
        if (remaining > 0 && !STATE.flags.godMode) {
            mysteryResult.textContent = `Mystery Box on cooldown: ${formatMs(remaining)} remaining.`;
            return;
        }

        const msg = rollMysteryReward();
        STATE.currentUser.lastMysteryAt = Date.now();
        saveAllUsers();

        mysteryResult.textContent = msg;
        logDebug("Mystery box opened: " + msg);
    });
}

// ------------------------------------------------------------
// BLACKJACK SYSTEM
// ------------------------------------------------------------
function bjCreateDeck() {
    const ranks = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
    const suits = ["♠","♥","♦","♣"];
    const deck = [];

    for (const r of ranks) {
        for (const s of suits) {
            deck.push({ r, s });
        }
    }

    // Shuffle
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    return deck;
}

function bjValue(hand) {
    let total = 0;
    let aces = 0;

    for (const card of hand) {
        if (card.r === "A") {
            total += 11;
            aces++;
        } else if (["J","Q","K"].includes(card.r)) {
            total += 10;
        } else {
            total += parseInt(card.r, 10);
        }
    }

    while (total > 21 && aces > 0) {
        total -= 10;
        aces--;
    }

    return total;
}

function bjRender() {
    if (!bjPlayerEl || !bjDealerEl) return;

    bjPlayerEl.innerHTML = "";
    bjDealerEl.innerHTML = "";

    // Player cards
    STATE.blackjack.player.forEach(c => {
        const div = document.createElement("div");
        div.className = "bj-card";
        div.textContent = c.r + c.s;
        bjPlayerEl.appendChild(div);
    });

    // Dealer cards
    STATE.blackjack.dealer.forEach((c, i) => {
        const div = document.createElement("div");
        div.className = "bj-card";

        if (STATE.blackjack.active && i === 0) {
            div.textContent = "??";
        } else {
            div.textContent = c.r + c.s;
        }

        bjDealerEl.appendChild(div);
    });
}

function bjStart() {
    if (!STATE.currentUser) {
        bjResult.textContent = "Login first.";
        return;
    }

    if (STATE.currentUser.money < STATE.blackjack.bet && !STATE.flags.godMode) {
        bjResult.textContent = "Not enough money.";
        return;
    }

    if (!STATE.flags.godMode) {
        STATE.currentUser.money -= STATE.blackjack.bet;
        updateMoney(0);
    }

    STATE.blackjack.deck = bjCreateDeck();
    STATE.blackjack.player = [STATE.blackjack.deck.pop(), STATE.blackjack.deck.pop()];
    STATE.blackjack.dealer = [STATE.blackjack.deck.pop(), STATE.blackjack.deck.pop()];
    STATE.blackjack.active = true;

    bjResult.textContent = "Blackjack started — Hit or Stand.";
    bjRender();
}

function bjEnd(message, payoutMultiplier = 0) {
    STATE.blackjack.active = false;

    if (payoutMultiplier !== 0) {
        const payout = Math.floor(STATE.blackjack.bet * payoutMultiplier);
        STATE.currentUser.money += payout;
        updateMoney(0);

        if (payout > 0) updateXP(50);

        message += ` (Payout: $${payout.toLocaleString()})`;
    }

    bjResult.textContent = message;
    bjRender();
    saveAllUsers();
}

if (bjHitBtn) {
    bjHitBtn.addEventListener("click", () => {
        if (!STATE.blackjack.active) {
            bjStart();
            return;
        }

        STATE.blackjack.player.push(STATE.blackjack.deck.pop());
        bjRender();

        const val = bjValue(STATE.blackjack.player);
        if (val > 21) bjEnd("You busted!", 0);
    });
}

if (bjStandBtn) {
    bjStandBtn.addEventListener("click", () => {
        if (!STATE.blackjack.active) {
            bjStart();
            return;
        }

        // Dealer draws
        while (bjValue(STATE.blackjack.dealer) < 17) {
            STATE.blackjack.dealer.push(STATE.blackjack.deck.pop());
        }

        const p = bjValue(STATE.blackjack.player);
        const d = bjValue(STATE.blackjack.dealer);

        if (d > 21) bjEnd("Dealer busted! You win!", 2);
        else if (p > d) bjEnd("You win!", 2);
        else if (p < d) bjEnd("You lose.", 0);
        else bjEnd("Push (tie).", 1);
    });
}

// ------------------------------------------------------------
// FINAL READY LOG
// ------------------------------------------------------------
logDebug("A3‑ULTRA FULL MERGE COMPLETE — All systems online.");
