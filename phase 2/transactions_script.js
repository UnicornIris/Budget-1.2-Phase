let transactions = [{
    id: 1,
    name: "Netflix",
    amount: 15.99,
    category: "Entertainment",
    date: "2026-03-20",
    note: "Monthly subscription"
  }
];

let categories = ["Entertainment", "Food", "Rent", "Transportation","Shopping",
    "Bills", "Other"];

function renderTransactions(dat = transactions) {
    const list = document.getElementById("transactionList");
    list.innerHTML = "";

    transactions.forEach(x => {
        const li = document.createElement("li");

        li.innerHTML = `
            <strong>${x.name}</strong> - $${x.amount}
            (${x.category}) - ${x.date}
            <br>
            ${x.note || ""}
            <br>
            <button onclick="deleteTransaction(${x.id})">Delete</button>
            <button onclick="editTransaction(${x.id})">Edit</button>
            <hr>
        `;

        list.appendChild(li);
    });
}

function showForm() {
    document.getElementById("add-transaction-form").style.display = "block";
}

function addTransaction() {
    const name = document.getElementById("nameInput").value;
    const amount = parseFloat(document.getElementById("amountInput").value);
    const category = document.getElementById("categoryInput").value;
    const date = document.getElementById("dateInput").value;
    const note = document.getElementById("noteInput").value;

    const newTransaction = {
        id: Date.now(),
        name,
        amount,
        category,
        date,
        note
    };

    transactions.push(newTransaction);

    renderTransactions();

    document.getElementById("nameInput").value = "";
    document.getElementById("amountInput").value = "";
    document.getElementById("dateInput").value = "";
    document.getElementById("noteInput").value = "";

    document.getElementById("add-transaction-form").style.display = "none";
}

function createCategory() {
    const cat = prompt("Enter new category name:");
    if (!cat) return;

    if (!categories.includes(cat)) {
        categories.push(cat);
        alert("Category added!");
    } else {
        alert("Category already exists.");
    }
}

function editTransaction(id) {
    const t = transactions.find(t => t.id === id);
    if (!t) return;

    const newName = prompt("Edit name:", t.name);
    const newAmount = parseFloat(prompt("Edit amount:", t.amount));
    const newCategory = prompt("Edit category:", t.category);
    const newDate = prompt("Edit date:", t.date);
    const newNote = prompt("Edit note:", t.note);

    t.name = newName;
    t.amount = newAmount;
    t.category = newCategory;
    t.date = newDate;
    t.note = newNote;

    renderTransactions();
}

function rangeOfTransactions() {
    const start = prompt("Start date (YYYY-MM-DD):");
    const end = prompt("End date (YYYY-MM-DD):");

    const filtered = transactions.filter(x => {
        return x.date >= start && x.date <= end;
    });

    renderTransactions(filtered);
}

function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    renderTransactions();
}

renderTransactions();
