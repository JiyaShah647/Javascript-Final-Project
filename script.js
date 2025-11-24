const balance = document.getElementById("balance");
const money_plus = document.getElementById("money-plus");
const money_minus = document.getElementById("money-minus");
const list = document.getElementById("list");
const form = document.getElementById("form");
const text = document.getElementById("text");
const amount = document.getElementById("amount");
const category = document.getElementById("category");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

let pieChart;

const type = document.getElementById("type");
const currencySelect = document.getElementById("currency");
let currencySymbol = localStorage.getItem("currency") || "₹";

currencySelect.value = currencySymbol;

currencySelect.addEventListener("change", () => {
    currencySymbol = currencySelect.value;
    localStorage.setItem("currency", currencySymbol);
    updateValues();
    init();
});

form.addEventListener("submit", (e) => {
    e.preventDefault();

    let amt = +amount.value;

    if (type.value === "expense") {
        amt = -Math.abs(amt);
    } else {
        amt = Math.abs(amt);
    }

    const transaction = {
        id: Date.now(),
        text: text.value,
        amount: amt,
        category: category.value
    };

    transactions.push(transaction);
    updateLocalStorage();
    addTransactionDOM(transaction);
    updateValues();
    updatePieChart();

    text.value = "";
    amount.value = "";
});

function addTransactionDOM(transaction) {
    const sign = transaction.amount < 0 ? "-" : "+";

    const item = document.createElement("li");
    item.classList.add(transaction.amount < 0 ? "minus" : "plus");

    item.innerHTML = `
        ${transaction.text} (${transaction.category})
        <span>${sign}${currencySymbol}${Math.abs(transaction.amount)}</span>
        <button class="edit-btn" onclick="editTransaction(${transaction.id})">Edit</button>
        <button class="delete-btn" onclick="removeTransaction(${transaction.id})">x</button>
    `;

    list.appendChild(item);
}

function removeTransaction(id) {
    transactions = transactions.filter((t) => t.id !== id);
    updateLocalStorage();
    init();
}
function editTransaction(id) {
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) return;

    text.value = transaction.text;
    amount.value = Math.abs(transaction.amount);
    category.value = transaction.category;
    type.value = transaction.amount < 0 ? "expense" : "income";

    transactions = transactions.filter(t => t.id !== id);
    updateLocalStorage();
    init();
}

function updateValues() {
    const amounts = transactions.map(t => t.amount);

    const total = amounts.reduce((acc, item) => acc + item, 0).toFixed(2);
    const income = amounts.filter(i => i > 0).reduce((a, b) => a + b, 0).toFixed(2);
    const expense = (amounts.filter(i => i < 0).reduce((a, b) => a + b, 0) * -1).toFixed(2);

    balance.innerText = `${currencySymbol}${total}`;
    money_plus.innerText = `+${currencySymbol}${income}`;
    money_minus.innerText = `-${currencySymbol}${expense}`;
}

function updateLocalStorage() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

function updatePieChart() {
    const categoryTotals = {};

    transactions.forEach((t) => {
        if (t.amount < 0) {
            categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Math.abs(t.amount);
        }
    });

    const labels = Object.keys(categoryTotals);
    const values = Object.values(categoryTotals);

    if (pieChart) pieChart.destroy();

    const ctx = document.getElementById("pieChart").getContext("2d");

    pieChart = new Chart(ctx, {
        type: "pie",
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: [
                    "#ff6384", "#36a2eb", "#ffce56", "#4bc0c0", "#9966ff", "#ff9f40"
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: "bottom" }
            }
        }
    });
}

function init() {
    list.innerHTML = "";
    transactions.forEach(addTransactionDOM);
    updateValues();
    updatePieChart();
}

init();
