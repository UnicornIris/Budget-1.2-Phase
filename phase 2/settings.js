const CURRENCY_KEY = "userCurrency";
const SUPPORTED_CURRENCIES = ["USD", "EUR", "GBP", "JPY"];
const TRANSACTIONS_KEY = "budget-transactions";
const INCOME_KEY = "budget-income";
const GOALS_KEY = "budget-goals";
const PERIOD_KEY = "budget-period";

function loadCurrency() {
    return localStorage.getItem(CURRENCY_KEY) || "USD";
}

function saveCurrency(currency) {
    localStorage.setItem(CURRENCY_KEY, currency);
}

function updateCurrencyUI() {
    const current = loadCurrency();
    const currentEl = document.getElementById("currentCurrency");
    const detailEl = document.getElementById("currencyDetail");
    const statusEl = document.getElementById("settingsStatus");

    if (currentEl) currentEl.textContent = current;
    if (detailEl) detailEl.textContent = current + " will format Activity, Goals, and Reports totals.";

    document.querySelectorAll("[data-currency-choice]").forEach((button) => {
        button.classList.toggle("active", button.dataset.currencyChoice === current);
    });

    if (statusEl) statusEl.textContent = "Choose how amounts are displayed and manage the budget data stored on this device.";
}

function readStoredList(key) {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        return [];
    }
}

function updateDataSummary() {
    const transactionsEl = document.getElementById("dataTransactions");
    const incomeEl = document.getElementById("dataIncome");
    const goalsEl = document.getElementById("dataGoals");

    const transactions = readStoredList(TRANSACTIONS_KEY);
    const income = readStoredList(INCOME_KEY);
    const goals = readStoredList(GOALS_KEY);

    if (transactionsEl) transactionsEl.textContent = String(transactions.length);
    if (incomeEl) incomeEl.textContent = String(income.length);
    if (goalsEl) goalsEl.textContent = String(goals.length);
}

function setCurrency(currency) {
    saveCurrency(currency);
    updateCurrencyUI();
}

function clearDemoData() {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify([]));
    localStorage.setItem(INCOME_KEY, JSON.stringify([]));
    localStorage.setItem(GOALS_KEY, JSON.stringify([]));
    localStorage.setItem(PERIOD_KEY, "month");
    updateDataSummary();
    const statusEl = document.getElementById("settingsStatus");
    if (statusEl) statusEl.textContent = "All budget data on this device was cleared. You can start fresh now.";
}

document.addEventListener("DOMContentLoaded", () => {
    updateCurrencyUI();
    updateDataSummary();

    document.querySelectorAll("[data-currency-choice]").forEach((button) => {
        button.addEventListener("click", () => setCurrency(button.dataset.currencyChoice));
    });

    const resetBtn = document.getElementById("clearDemoDataBtn");
    if (resetBtn) resetBtn.addEventListener("click", clearDemoData);
});
