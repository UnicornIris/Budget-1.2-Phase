const GOALS_KEY = "budget-goals";

function formatCurrency(amt) {
    const currency = localStorage.getItem("userCurrency") || "USD";
    const symbol = (currency === "EUR") ? "€" : "$";
    return symbol + Number(amt).toFixed(2);
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

function addGoal() {
    const name = document.getElementById("goal-name").value;
    const amount = parseFloat(document.getElementById("goal-amount").value);
    const date = document.getElementById("goal-date").value;

    if (!name || !amount || !date) {
        alert("Fill all fields");
        return;
    }

    const months = getMonthsLeft(date);
    const monthly = amount / months;

    const goal = {
        id: Date.now(),
        name,
        amount,
        date,
        saved: 0,
        view: "percent" 
    };

    const goals = loadGoals();
    goals.push(goal);
    saveGoals(goals);

    // UPDATED: Alert now uses dynamic currency
    alert(`Save ${formatCurrency(monthly)} per month`);
    
    // Clear inputs after adding
    document.getElementById("goal-name").value = "";
    document.getElementById("goal-amount").value = "";
    document.getElementById("goal-date").value = "";

    renderGoals();
}

function getMonthsLeft(date) {
    const now = new Date();
    const target = new Date(date);
    return Math.max(1, (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth()));
}

function editGoal(id) {
    const goals = loadGoals();
    const goal = goals.find((g) => g.id === id);
    if (!goal) return;

    const name = prompt("Goal name:", goal.name);
    if (name === null) return;
    const amountStr = prompt("Target amount:", String(goal.amount));
    if (amountStr === null) return;
    const date = prompt("Due date (YYYY-MM-DD):", goal.date);
    if (date === null) return;

    const amount = parseFloat(amountStr);
    if (!name.trim() || Number.isNaN(amount) || amount <= 0 || !date.trim()) {
        alert("Please enter valid name, amount, and date.");
        return;
    }

    goal.name = name.trim();
    goal.amount = amount;
    goal.date = date.trim();
    if (goal.saved > goal.amount) goal.saved = goal.amount;

    saveGoals(goals);
    renderGoals();
}

function addMoney(id) {
    const goals = loadGoals();
    const goal = goals.find(g => g.id === id);
    if (!goal) return;
    const amount = prompt("How much did you save?");
    const n = parseFloat(amount);
    if (amount === null || amount === "" || Number.isNaN(n)) return;
    goal.saved += n;
    saveGoals(goals);
    renderGoals();
}

function deleteGoal(id) {
    const confirmDelete = confirm("Are you sure you want to delete this goal?");
    if (!confirmDelete) return;

    let goals = loadGoals();
    goals = goals.filter(g => g.id !== id);

    saveGoals(goals);
    renderGoals();
}


function renderGoals() {
    const goals = loadGoals();
    const activeContainer = document.getElementById("goals-list");
    const completedContainer = document.getElementById("completed-goals-list");

    if (!activeContainer || !completedContainer) return;

    activeContainer.innerHTML = "";
    completedContainer.innerHTML = "";

    goals.forEach(g => {
        const percent = ((g.saved / g.amount) * 100).toFixed(0);
        const div = document.createElement("div");
        div.className = "goal-card " + (g.saved >= g.amount ? "goal-complete" : "goal-incomplete");

        // UPDATED: All currency values now use formatCurrency()
        div.innerHTML = `
            <h3>${g.name}</h3>

            <p class="goal-numbers">
                ${formatCurrency(g.saved)} / ${formatCurrency(g.amount)}
            </p>

            <p class="goal-percent">
                ${percent}% complete
            </p>

            <div class="progress-bar">
                <div class="progress-fill" style="width: ${percent}%"></div>
            </div>

            <p class="goal-date">Due: ${g.date}</p>

            ${
                g.saved < g.amount
                ? `<div class="goal-actions">
                        <button onclick="addMoney(${g.id})">+ Add Savings</button>
                        <button onclick="editGoal(${g.id})">Edit</button>
                        <button onclick="deleteGoal(${g.id})" class="btn-delete">Delete</button>
                   </div>`
                : `<div>
                            <p class="goal-done"> Goal Achieved</p>
                            <div class="goal-actions">
                                <button onclick="deleteGoal(${g.id})" class="btn-delete">Delete</button>
                            </div>
                    </div>`               
            }
        `;

        if (g.saved >= g.amount) {
            completedContainer.appendChild(div);
        } else {
            activeContainer.appendChild(div);
        }
    });
}

document.addEventListener("DOMContentLoaded", renderGoals);