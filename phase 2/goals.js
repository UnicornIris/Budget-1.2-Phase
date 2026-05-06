const GOALS_KEY = "budget-goals";

let editingGoalId = null;
let keyboardHideTimer = null;

function getKeyboardDemo() {
    return document.getElementById("keyboard-demo");
}

function setKeyboardMode(mode) {
    const keyboard = getKeyboardDemo();
    if (!keyboard) return;
    keyboard.dataset.mode = mode;
}

function showKeyboardDemo(target) {
    const keyboard = getKeyboardDemo();
    if (!keyboard) return;
    if (keyboardHideTimer) {
        clearTimeout(keyboardHideTimer);
        keyboardHideTimer = null;
    }
    const type = target && typeof target.type === "string" ? target.type : "";
    const numericTypes = new Set(["number", "date", "time", "month", "week"]);
    setKeyboardMode(numericTypes.has(type) ? "number" : "text");
    keyboard.classList.remove("hidden");
}

function hideKeyboardDemo() {
    const keyboard = getKeyboardDemo();
    if (!keyboard) return;
    keyboard.classList.add("hidden");
}

function formatCurrency(amt) {
    const currency = localStorage.getItem("userCurrency") || "USD";
    const symbol = currency === "EUR" ? "EUR " : "$";
    return symbol + Number(amt).toFixed(2);
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

function loadGoals() {
    try {
        const raw = localStorage.getItem(GOALS_KEY);
        if (raw) return JSON.parse(raw);
    } catch (e) {}
    return [];
}

function saveGoals(goals) {
    localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
}

function getMonthsLeft(date) {
    const now = new Date();
    const target = new Date(date + "T12:00:00");
    const months = (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth());
    return Math.max(0, months);
}

function getGoalTimelineLabel(date) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const target = new Date(date + "T12:00:00");
    target.setHours(0, 0, 0, 0);

    if (target < now) return "Overdue";

    const monthsLeft = getMonthsLeft(date);
    if (monthsLeft <= 1) return "Due soon";
    return monthsLeft + " months left";
}

function getMonthlyTarget(goal) {
    const remaining = Math.max(0, goal.amount - goal.saved);
    return remaining / Math.max(1, getMonthsLeft(goal.date));
}

function addGoal() {
    const nameInput = document.getElementById("goal-name");
    const amountInput = document.getElementById("goal-amount");
    const dateInput = document.getElementById("goal-date");
    const helper = document.getElementById("goal-form-helper");

    const name = nameInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const date = dateInput.value;

    if (!name || Number.isNaN(amount) || amount <= 0 || !date) {
        if (helper) helper.textContent = "Enter a goal name, target amount, and due date.";
        return;
    }

    const goals = loadGoals();
    goals.push({
        id: Date.now(),
        name,
        amount,
        date,
        saved: 0
    });
    saveGoals(goals);

    nameInput.value = "";
    amountInput.value = "";
    dateInput.value = "";
    if (helper) helper.textContent = "Goal added. Use the inline controls below to edit or add savings.";
    editingGoalId = null;
    hideKeyboardDemo();
    renderGoals();
}

function startEditGoal(id) {
    editingGoalId = id;
    renderGoals();
    const firstEditInput = document.getElementById(`edit-goal-name-${id}`);
    if (firstEditInput) firstEditInput.focus();
}

function cancelEditGoal() {
    editingGoalId = null;
    hideKeyboardDemo();
    renderGoals();
}

function saveGoalEdits(id) {
    const goals = loadGoals();
    const goal = goals.find((entry) => entry.id === id);
    if (!goal) return;

    const nameEl = document.getElementById(`edit-goal-name-${id}`);
    const amountEl = document.getElementById(`edit-goal-amount-${id}`);
    const dateEl = document.getElementById(`edit-goal-date-${id}`);

    const name = nameEl ? nameEl.value.trim() : "";
    const amount = amountEl ? parseFloat(amountEl.value) : NaN;
    const date = dateEl ? dateEl.value : "";

    if (!name || Number.isNaN(amount) || amount <= 0 || !date) {
        const errorEl = document.getElementById(`edit-goal-error-${id}`);
        if (errorEl) errorEl.textContent = "Enter a valid name, amount, and due date.";
        return;
    }

    goal.name = name;
    goal.amount = amount;
    goal.date = date;
    goal.saved = Math.min(goal.saved, goal.amount);

    saveGoals(goals);
    editingGoalId = null;
    renderGoals();
}

function addSavings(id) {
    const goals = loadGoals();
    const goal = goals.find((entry) => entry.id === id);
    if (!goal) return;

    const input = document.getElementById(`save-input-${id}`);
    const amount = input ? parseFloat(input.value) : NaN;
    if (Number.isNaN(amount) || amount <= 0) return;

    goal.saved = Math.min(goal.saved + amount, goal.amount);
    saveGoals(goals);
    hideKeyboardDemo();
    renderGoals();
}

function deleteGoal(id) {
    const goals = loadGoals().filter((goal) => goal.id !== id);
    saveGoals(goals);
    if (editingGoalId === id) editingGoalId = null;
    renderGoals();
}

function handleFocusIn(event) {
    const target = event.target;
    if (!target) return;
    if (target.matches('input, textarea, [contenteditable="true"]')) {
        showKeyboardDemo(target);
    }
}

function handleFocusOut(event) {
    const target = event.target;
    if (!target) return;
    if (!target.matches('input, textarea, [contenteditable="true"]')) return;

    if (keyboardHideTimer) clearTimeout(keyboardHideTimer);
    keyboardHideTimer = setTimeout(() => {
        const active = document.activeElement;
        if (!active || !active.matches('input, textarea, [contenteditable="true"]')) {
            hideKeyboardDemo();
        }
    }, 80);
}

function renderGoalCard(goal) {
    const percent = Math.min(100, Math.round((goal.saved / goal.amount) * 100));
    const monthlyTarget = getMonthlyTarget(goal);
    const timelineLabel = getGoalTimelineLabel(goal.date);
    const isEditing = editingGoalId === goal.id;

    return `
        <article class="goal-card ${goal.saved >= goal.amount ? "goal-complete" : "goal-incomplete"}">
            <div class="goal-top-row">
                <div class="goal-heading-block">
                    <h3>${escapeHtml(goal.name)}</h3>
                    <p class="goal-date">Due ${escapeHtml(goal.date)} · ${timelineLabel}</p>
                </div>
                <div class="goal-summary-chip">${percent}%</div>
            </div>

            <div class="goal-stats-grid">
                <div class="goal-stat">
                    <span class="goal-stat-label">Saved</span>
                    <strong>${formatCurrency(goal.saved)}</strong>
                </div>
                <div class="goal-stat">
                    <span class="goal-stat-label">Target</span>
                    <strong>${formatCurrency(goal.amount)}</strong>
                </div>
                <div class="goal-stat">
                    <span class="goal-stat-label">Needed / month</span>
                    <strong>${formatCurrency(monthlyTarget)}</strong>
                </div>
            </div>

            <div class="goal-progress-row">
                <div class="progress-bar">
                    <div class="progress-fill" style="width:${percent}%"></div>
                </div>
                <span class="goal-percent">${percent}% complete</span>
            </div>

            ${goal.saved < goal.amount ? `
                <div class="goal-inline-tools">
                    <input type="number" id="save-input-${goal.id}" class="goal-inline-input" placeholder="Add savings" min="0" step="0.01">
                    <button type="button" class="goal-tool-btn" onclick="addSavings(${goal.id})">Add</button>
                    <button type="button" class="goal-tool-btn goal-tool-secondary" onclick="startEditGoal(${goal.id})">Edit</button>
                    <button type="button" class="goal-tool-btn btn-delete" onclick="deleteGoal(${goal.id})">Delete</button>
                </div>
            ` : `
                <div class="goal-inline-tools goal-inline-tools-complete">
                    <p class="goal-done">Goal achieved</p>
                    <button type="button" class="goal-tool-btn btn-delete" onclick="deleteGoal(${goal.id})">Delete</button>
                </div>
            `}

            ${isEditing ? `
                <div class="goal-edit-panel">
                    <div class="goal-edit-grid">
                        <input type="text" id="edit-goal-name-${goal.id}" value="${escapeHtml(goal.name)}" aria-label="Edit goal name">
                        <input type="number" id="edit-goal-amount-${goal.id}" value="${goal.amount}" min="0" step="0.01" aria-label="Edit goal amount">
                        <input type="date" id="edit-goal-date-${goal.id}" value="${escapeHtml(goal.date)}" aria-label="Edit goal date">
                    </div>
                    <p class="goal-edit-error" id="edit-goal-error-${goal.id}"></p>
                    <div class="goal-actions compact-actions">
                        <button type="button" onclick="saveGoalEdits(${goal.id})">Save changes</button>
                        <button type="button" class="goal-tool-secondary" onclick="cancelEditGoal()">Cancel</button>
                    </div>
                </div>
            ` : ""}
        </article>
    `;
}

function renderGoals() {
    const goals = loadGoals();
    const activeContainer = document.getElementById("goals-list");
    const completedContainer = document.getElementById("completed-goals-list");

    if (!activeContainer || !completedContainer) return;

    const activeGoals = goals.filter((goal) => goal.saved < goal.amount);
    const completedGoals = goals.filter((goal) => goal.saved >= goal.amount);

    activeContainer.innerHTML = activeGoals.length
        ? activeGoals.map(renderGoalCard).join("")
        : '<div class="goal-empty card">No active goals yet.</div>';

    completedContainer.innerHTML = completedGoals.length
        ? completedGoals.map(renderGoalCard).join("")
        : '<div class="goal-empty card">No completed goals yet.</div>';
}

document.addEventListener("DOMContentLoaded", () => {
    renderGoals();
    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("focusout", handleFocusOut);
});
