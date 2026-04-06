// 1. Load settings from storage as soon as the script runs
function loadSettings() {
    // Check if there's a saved currency, otherwise default to USD
    const savedCurrency = localStorage.getItem("userCurrency") || "USD";
    const lowBalance = localStorage.getItem("lowBalanceAlert") === "true";
    const billDue = localStorage.getItem("billDueAlert") === "true";

    // Update the UI to match saved data
    document.getElementById("currencyDisplay").textContent = savedCurrency;
    document.getElementById("lowBalanceToggle").checked = lowBalance;
    document.getElementById("billDueToggle").checked = billDue;
}

// 2. Update the currency and SAVE it immediately
function toggleCurrency() {
    const display = document.getElementById("currencyDisplay");
    const newCurrency = (display.textContent === "USD") ? "EUR" : "USD";
    
    display.textContent = newCurrency;
    
    // Save to the browser's memory
    localStorage.setItem("userCurrency", newCurrency);
    
    // Optional: If you have a function in app.js to update symbols, call it here
    console.log("Currency updated to:", newCurrency);
}

// 3. Save the toggles whenever they are clicked
function saveSettings() {
    const lowBalanceAlert = document.getElementById("lowBalanceToggle").checked;
    const billDueAlert = document.getElementById("billDueToggle").checked;

    // Save toggles to storage
    localStorage.setItem("lowBalanceAlert", lowBalanceAlert);
    localStorage.setItem("billDueAlert", billDueAlert);

    console.log("Settings Saved - Low balance:", lowBalanceAlert, "Bill due:", billDueAlert);
}

// Initialize the page
loadSettings();