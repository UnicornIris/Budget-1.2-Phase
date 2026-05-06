const STORAGE_KEY = "budget-transactions";
const STORAGE_KEY_INCOME = "budget-income";
const STORAGE_KEY_PERIOD = "budget-period";
const CATEGORIES = ["Food", "Coffee", "Transport", "Shopping", "Entertainment", "Bills", "Other"];
const INCOME_SOURCES = ["Salary", "Freelance", "Side job", "Gift", "Refund", "Other"];

let entryMode = "expense";
let ledgerFilter = "all";
let showAllEntries = false;
let selectedPeriod = loadSelectedPeriod();

function getDefaultTransactions() {
    const today = formatDateForStorage(new Date());
    const d = new Date();
    const weekAgo = new Date(d);
    weekAgo.setDate(d.getDate() - 5);
    return [
        { id: "1", name: "Coffee", amount: 5.5, category: "Coffee", date: today },
        { id: "2", name: "Lunch", amount: 12.99, category: "Food", date: today },
        { id: "3", name: "Uber", amount: 8.25, category: "Transport", date: today },
        { id: "4", name: "Groceries", amount: 45.0, category: "Shopping", date: formatDateForStorage(weekAgo) },
        { id: "5", name: "Netflix", amount: 15.99, category: "Bills", date: formatDateForStorage(d) }
    ];
}

function getDefaultIncome() {
    const d = new Date();
    const y = d.getFullYear();
    const m = d.getMonth();
    const pad = (n) => String(n).padStart(2, "0");
    return [
        { id: generateId(), name: "Salary", date: `${y}-${pad(m + 1)}-01`, amount: 2500, source: "Salary" },
        { id: generateId(), name: "Freelance", date: `${y}-${pad(m + 1)}-15`, amount: 1000, source: "Freelance" }
    ];
}

function normalizeIncomeEntry(raw) {
    if (!raw || typeof raw !== "object") return null;
    const amount = Math.max(0, parseFloat(raw.amount) || 0);
    const date = raw.date || formatDateForStorage(new Date());
    const source = INCOME_SOURCES.includes(raw.source) ? raw.source : "Other";
    return {
        id: raw.id || generateId(),
        name: (raw.name && String(raw.name).trim()) || "Income",
        amount,
        date,
        source
    };
}

function loadTransactions() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch (e) {}
    return getDefaultTransactions();
}

function saveTransactions(transactions) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

function loadIncome() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY_INCOME);
        if (raw) {
            const arr = JSON.parse(raw);
            if (Array.isArray(arr)) return arr.map(normalizeIncomeEntry).filter(Boolean);
        }
    } catch (e) {}
    return getDefaultIncome();
}

function saveIncome(entries) {
    localStorage.setItem(STORAGE_KEY_INCOME, JSON.stringify(entries));
}

function loadSelectedPeriod() {
    return localStorage.getItem(STORAGE_KEY_PERIOD) || "month";
}

function saveSelectedPeriod(period) {
    localStorage.setItem(STORAGE_KEY_PERIOD, period);
}

function formatDateForStorage(date) {
    return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0");
}

function formatShortDateDisplay(dateStr) {
    const d = new Date(dateStr + "T12:00:00");
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.getMonth() + 1 + "/" + d.getDate();
}

function formatCurrency(amount) {
    const currency = localStorage.getItem("userCurrency") || "USD";
    const map = { USD: "$", EUR: "EUR ", GBP: "GBP ", JPY: "JPY " };
    return (map[currency] || "$") + Number(amount).toFixed(2);
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function getDateRangeForPeriod(period) {
    const end = new Date();
    const start = new Date();
    end.setHours(23, 59, 59, 999);
    start.setHours(0, 0, 0, 0);

    if (period === "7") start.setDate(end.getDate() - 6);
    else if (period === "14") start.setDate(end.getDate() - 13);
    else if (period === "30") start.setDate(end.getDate() - 29);
    else start.setDate(1);

    return { start, end };
}

function formatPeriodLabel(period) {
    const { start, end } = getDateRangeForPeriod(period);
    const fmt = (d) => d.getMonth() + 1 + "/" + d.getDate();
    if (period === "month") return "This month";
    return fmt(start) + " – " + fmt(end);
}

function isDateInRange(dateStr, start, end) {
    const d = new Date(dateStr);
    d.setHours(12, 0, 0, 0);
    return d >= start && d <= end;
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

let transactions = loadTransactions();
let incomeEntries = loadIncome();

const balanceAmountEl = document.getElementById("balance-amount");
const periodContextEl = document.getElementById("period-context");
const statIncomeEl = document.getElementById("stat-income");
const statExpensesEl = document.getElementById("stat-expenses");
const todaySpentInlineEl = document.getElementById("today-spent-inline");
const periodFilterButtons = Array.from(document.querySelectorAll("[data-period-filter]"));
const entryModeButtons = Array.from(document.querySelectorAll("[data-entry-mode]"));
const entryNameEl = document.getElementById("entry-name");
const entryAmountEl = document.getElementById("entry-amount");
const entryDateEl = document.getElementById("entry-date");
const entryKindLabelEl = document.getElementById("entry-kind-label");
const entryKindSelectEl = document.getElementById("entry-kind-select");
const entrySaveBtn = document.getElementById("entry-save-btn");
const entryClearBtn = document.getElementById("entry-clear-btn");
const composerHintEl = document.getElementById("composer-hint");
const activityListEl = document.getElementById("activity-list");
const activityStatusEl = document.getElementById("activity-status");
const activityFilterButtons = Array.from(document.querySelectorAll("[data-ledger-filter]"));
const activityShowMoreBtn = document.getElementById("activity-show-more-btn");
const keyboardDemo = document.getElementById("keyboard-demo");

function setActivityKeyboardMode(mode) {
    if (!keyboardDemo) return;
    keyboardDemo.dataset.mode = mode;
}

function showKeyboardDemo(target) {
    if (!keyboardDemo) return;
    const type = target && typeof target.type === "string" ? target.type : "";
    const numericTypes = new Set(["number", "date", "time", "month", "week"]);
    setActivityKeyboardMode(numericTypes.has(type) ? "number" : "text");
    keyboardDemo.classList.remove("hidden");
}

function hideKeyboardDemo() {
    if (keyboardDemo) keyboardDemo.classList.add("hidden");
}

function dismissActivityKeyboard() {
    hideKeyboardDemo();
    if (document.activeElement && typeof document.activeElement.blur === "function") {
        document.activeElement.blur();
    }
}

function bindKeyboardAwareInput(input) {
    if (!input) return;
    input.addEventListener("focus", () => showKeyboardDemo(input));
    input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") dismissActivityKeyboard();
    });
}

function getFilteredTotals() {
    const { start, end } = getDateRangeForPeriod(selectedPeriod);
    const income = incomeEntries.filter((i) => isDateInRange(i.date, start, end)).reduce((sum, i) => sum + i.amount, 0);
    const expenses = transactions.filter((t) => isDateInRange(t.date, start, end)).reduce((sum, t) => sum + t.amount, 0);
    return { income, expenses };
}

function getTodaySpent() {
    const today = formatDateForStorage(new Date());
    return transactions.filter((t) => t.date === today).reduce((sum, t) => sum + t.amount, 0);
}

function getLedgerRows() {
    const { start, end } = getDateRangeForPeriod(selectedPeriod);
    const rows = [];

    transactions
        .filter((entry) => isDateInRange(entry.date, start, end))
        .forEach((entry) => {
            rows.push({
                id: entry.id,
                type: "expense",
                name: entry.name,
                amount: entry.amount,
                date: entry.date,
                label: entry.category
            });
        });

    incomeEntries
        .filter((entry) => isDateInRange(entry.date, start, end))
        .forEach((entry) => {
            rows.push({
                id: entry.id,
                type: "income",
                name: entry.name,
                amount: entry.amount,
                date: entry.date,
                label: entry.source
            });
        });

    rows.sort((a, b) => new Date(b.date) - new Date(a.date));
    return rows;
}

function updateSummary() {
    const { income, expenses } = getFilteredTotals();
    const balance = income - expenses;
    if (balanceAmountEl) balanceAmountEl.textContent = formatCurrency(balance);
    if (periodContextEl) periodContextEl.textContent = formatPeriodLabel(selectedPeriod);
    if (statIncomeEl) statIncomeEl.textContent = formatCurrency(income);
    if (statExpensesEl) statExpensesEl.textContent = formatCurrency(expenses);
    if (todaySpentInlineEl) todaySpentInlineEl.textContent = formatCurrency(getTodaySpent());
}

function updatePeriodButtons() {
    periodFilterButtons.forEach((button) => {
        button.classList.toggle("active", button.dataset.periodFilter === selectedPeriod);
    });
}

function updateEntryModeButtons() {
    entryModeButtons.forEach((button) => {
        button.classList.toggle("active", button.dataset.entryMode === entryMode);
    });
}

function populateEntryKindSelect() {
    if (!entryKindSelectEl || !entryKindLabelEl) return;
    const options = entryMode === "expense" ? CATEGORIES : INCOME_SOURCES;
    entryKindLabelEl.textContent = entryMode === "expense" ? "Category" : "Source";
    entryKindSelectEl.innerHTML = options.map((value) => `<option value="${value}">${value}</option>`).join("");
}

function clearComposer(statusMessage) {
    if (entryNameEl) entryNameEl.value = "";
    if (entryAmountEl) entryAmountEl.value = "";
    if (entryDateEl) entryDateEl.value = formatDateForStorage(new Date());
    if (composerHintEl) {
        composerHintEl.textContent = statusMessage || (entryMode === "expense"
            ? "Save an expense without leaving the Activity screen."
            : "Save an income entry without opening another dialog.");
    }
    hideKeyboardDemo();
}

function saveComposerEntry() {
    const name = entryNameEl ? entryNameEl.value.trim() : "";
    const amount = entryAmountEl ? parseFloat(entryAmountEl.value) : NaN;
    const date = entryDateEl ? entryDateEl.value : "";
    const kind = entryKindSelectEl ? entryKindSelectEl.value : "Other";

    if (!name || Number.isNaN(amount) || amount <= 0 || !date) {
        if (composerHintEl) composerHintEl.textContent = "Enter a description, amount, and date before saving.";
        return;
    }

    if (entryMode === "expense") {
        transactions.unshift({
            id: generateId(),
            name,
            amount,
            date,
            category: kind
        });
        saveTransactions(transactions);
    } else {
        incomeEntries.unshift({
            id: generateId(),
            name,
            amount,
            date,
            source: kind
        });
        saveIncome(incomeEntries);
    }

    showAllEntries = false;
    clearComposer(
        entryMode === "expense"
            ? "Expense saved. Your recent activity list updated below."
            : "Income saved. Your recent activity list updated below."
    );
    updateSummary();
    renderLedgerList();
}

function setEntryMode(mode) {
    entryMode = mode;
    updateEntryModeButtons();
    populateEntryKindSelect();
    clearComposer();
}

function setPeriod(period) {
    selectedPeriod = period;
    saveSelectedPeriod(period);
    showAllEntries = false;
    updatePeriodButtons();
    updateSummary();
    renderLedgerList();
}

function setLedgerFilter(filter) {
    ledgerFilter = filter;
    showAllEntries = false;
    activityFilterButtons.forEach((button) => {
        button.classList.toggle("active", button.dataset.ledgerFilter === filter);
    });
    renderLedgerList();
}

function deleteLedgerItem(id, type) {
    if (type === "expense") {
        transactions = transactions.filter((item) => item.id !== id);
        saveTransactions(transactions);
    } else {
        incomeEntries = incomeEntries.filter((item) => item.id !== id);
        saveIncome(incomeEntries);
    }
    updateSummary();
    renderLedgerList();
}

function renderLedgerList() {
    if (!activityListEl || !activityStatusEl || !activityShowMoreBtn) return;
    let rows = getLedgerRows();
    if (ledgerFilter !== "all") rows = rows.filter((row) => row.type === ledgerFilter);

    const limitedRows = showAllEntries ? rows : rows.slice(0, 6);
    activityListEl.innerHTML = "";

    if (rows.length === 0) {
        activityListEl.innerHTML = '<li class="transaction-item transaction-empty">No entries match the current filter.</li>';
        activityStatusEl.textContent = "Try another period or switch between income and expenses.";
        activityShowMoreBtn.classList.add("hidden");
        return;
    }

    activityStatusEl.textContent =
        (ledgerFilter === "all" ? "Showing both income and expenses" : "Showing only " + ledgerFilter) +
        " for " + formatPeriodLabel(selectedPeriod) + ".";

    limitedRows.forEach((row) => {
        const li = document.createElement("li");
        li.className = "transaction-item activity-ledger-item";
        li.innerHTML = `
            <div class="transaction-info">
                <div class="activity-ledger-top">
                    <span class="transaction-name">${escapeHtml(row.name)}</span>
                    <span class="activity-ledger-tag ${row.type === "income" ? "tag-income" : "tag-expense"}">${row.type}</span>
                </div>
                <span class="income-entry-meta">${escapeHtml(row.label)} · ${formatShortDateDisplay(row.date)}</span>
            </div>
            <div class="activity-ledger-right">
                <span class="${row.type === "income" ? "transaction-amount-income" : "transaction-amount"}">${row.type === "income" ? "+" : "-"}${formatCurrency(row.amount)}</span>
                <button type="button" class="activity-ledger-delete" data-delete-id="${row.id}" data-delete-type="${row.type}">Delete</button>
            </div>
        `;
        activityListEl.appendChild(li);
    });

    activityListEl.querySelectorAll("[data-delete-id]").forEach((button) => {
        button.addEventListener("click", () => deleteLedgerItem(button.dataset.deleteId, button.dataset.deleteType));
    });

    const hasMore = rows.length > 6;
    activityShowMoreBtn.classList.toggle("hidden", !hasMore);
    activityShowMoreBtn.textContent = showAllEntries ? "Show fewer entries" : "Show all " + rows.length + " entries";
}

document.addEventListener("DOMContentLoaded", () => {
    updateSummary();
    updatePeriodButtons();
    updateEntryModeButtons();
    populateEntryKindSelect();
    renderLedgerList();
    clearComposer();

    periodFilterButtons.forEach((button) => {
        button.addEventListener("click", () => setPeriod(button.dataset.periodFilter));
    });

    entryModeButtons.forEach((button) => {
        button.addEventListener("click", () => setEntryMode(button.dataset.entryMode));
    });

    activityFilterButtons.forEach((button) => {
        button.addEventListener("click", () => setLedgerFilter(button.dataset.ledgerFilter));
    });

    if (activityShowMoreBtn) {
        activityShowMoreBtn.addEventListener("click", () => {
            showAllEntries = !showAllEntries;
            renderLedgerList();
        });
    }

    if (entrySaveBtn) entrySaveBtn.addEventListener("click", saveComposerEntry);
    if (entryClearBtn) entryClearBtn.addEventListener("click", clearComposer);

    [entryNameEl, entryAmountEl, entryDateEl].forEach(bindKeyboardAwareInput);

    if (keyboardDemo) {
        keyboardDemo.querySelectorAll("[data-hide-key]").forEach((button) => {
            button.addEventListener("click", dismissActivityKeyboard);
        });
    }
});
