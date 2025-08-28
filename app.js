const sampleTransactions = [
    {"id": 1, "type": "income", "amount": 8000, "category": "Part-time Job", "description": "Tutoring payment", "date": "2025-01-25", "timestamp": 1724572800000},
    {"id": 2, "type": "expense", "amount": 150, "category": "Food & Dining", "description": "Lunch with friends", "date": "2025-01-25", "timestamp": 1724572800000},
    {"id": 3, "type": "expense", "amount": 50, "category": "Transportation", "description": "MTR monthly pass", "date": "2025-01-24", "timestamp": 1724486400000},
    {"id": 4, "type": "income", "amount": 2000, "category": "Freelance", "description": "Web development project", "date": "2025-01-22", "timestamp": 1724313600000},
    {"id": 5, "type": "expense", "amount": 300, "category": "Shopping", "description": "Programming books", "date": "2025-01-20", "timestamp": 1724140800000},
    {"id": 6, "type": "expense", "amount": 80, "category": "Entertainment", "description": "Movie tickets", "date": "2025-01-18", "timestamp": 1723968000000},
    {"id": 7, "type": "expense", "amount": 25, "category": "Food & Dining", "description": "Starbucks", "date": "2025-01-15", "timestamp": 1723708800000},
    {"id": 8, "type": "income", "amount": 500, "category": "Investment", "description": "Dividend payment", "date": "2025-01-10", "timestamp": 1723276800000}
];

const stockData = [
    {"symbol": "AAPL", "name": "Apple Inc.", "price": 227.52, "change": 2.85, "changePercent": 1.27},
    {"symbol": "GOOGL", "name": "Alphabet Inc.", "price": 166.89, "change": -1.23, "changePercent": -0.73},
    {"symbol": "TSLA", "name": "Tesla Inc.", "price": 219.16, "change": 4.67, "changePercent": 2.18},
    {"symbol": "MSFT", "name": "Microsoft Corp.", "price": 417.32, "change": -2.14, "changePercent": -0.51},
    {"symbol": "AMZN", "name": "Amazon.com Inc.", "price": 178.25, "change": 3.45, "changePercent": 1.97},
    {"symbol": "NVDA", "name": "NVIDIA Corp.", "price": 125.61, "change": 7.89, "changePercent": 6.70},
    {"symbol": "META", "name": "Meta Platforms Inc.", "price": 528.73, "change": -4.52, "changePercent": -0.85}
];

const forexRates = [
    {"pair": "USD/HKD", "rate": 7.8125, "change": 0.0025, "changePercent": 0.03},
    {"pair": "EUR/HKD", "rate": 8.4567, "change": -0.0234, "changePercent": -0.28},
    {"pair": "GBP/HKD", "rate": 9.9834, "change": 0.0456, "changePercent": 0.46},
    {"pair": "JPY/HKD", "rate": 0.0523, "change": -0.0012, "changePercent": -2.24},
    {"pair": "CNY/HKD", "rate": 1.0876, "change": 0.0034, "changePercent": 0.31}
];

const categories = [
    "Food & Dining",
    "Transportation", 
    "Shopping",
    "Entertainment",
    "Bills & Utilities",
    "Healthcare",
    "Education",
    "Investment",
    "Part-time Job",
    "Freelance",
    "Other Income",
    "Other Expense"
];

// Application state
let transactions = [...sampleTransactions];
let nextTransactionId = Math.max(...transactions.map(t => t.id)) + 1;
let expenseChart = null;
let trendChart = null;

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    updateRealTimeClock();
    setInterval(updateRealTimeClock, 1000);
    
    populateCategories();
    updateDashboard();
    renderTransactions();
    renderStocks();
    renderForexRates();
    initializeCharts();
    calculateBankruptcyPrediction();
    
    // Set default date in transaction form
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('transaction-date').value = today;
    
    // Initialize forex converter
    updateForexConverter();
    
    // Add event listeners for forex converter
    ['convert-amount', 'from-currency', 'to-currency'].forEach(id => {
        document.getElementById(id).addEventListener('change', updateForexConverter);
    });
}

// Real-time clock functionality
function updateRealTimeClock() {
    const now = new Date();
    const options = { 
        timeZone: 'Asia/Hong_Kong',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
    };
    const timeOptions = {
        timeZone: 'Asia/Hong_Kong',
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: false
    };
    
    document.getElementById('current-date').textContent = now.toLocaleDateString('zh-HK', options);
    document.getElementById('current-time').textContent = now.toLocaleTimeString('zh-HK', timeOptions);
}

// Navigation functionality
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all menu items
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionId).classList.add('active');
    
    // Add active class to clicked menu item
    event.target.closest('.menu-item').classList.add('active');
}

// Dashboard functionality
function updateDashboard() {
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalBalance = totalIncome - totalExpenses;
    
    // Get current month transactions
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyIncome = transactions
        .filter(t => {
            const transactionDate = new Date(t.date);
            return t.type === 'income' && 
                   transactionDate.getMonth() === currentMonth &&
                   transactionDate.getFullYear() === currentYear;
        })
        .reduce((sum, t) => sum + t.amount, 0);
    
    const monthlyExpenses = transactions
        .filter(t => {
            const transactionDate = new Date(t.date);
            return t.type === 'expense' && 
                   transactionDate.getMonth() === currentMonth &&
                   transactionDate.getFullYear() === currentYear;
        })
        .reduce((sum, t) => sum + t.amount, 0);
    
    // Calculate portfolio value (simplified)
    const portfolioValue = transactions
        .filter(t => t.category === 'Investment')
        .reduce((sum, t) => t.type === 'income' ? sum + t.amount : sum - t.amount, 0);
    
    // Update dashboard displays
    document.getElementById('total-balance').textContent = `HK$${totalBalance.toFixed(2)}`;
    document.getElementById('monthly-income').textContent = `HK$${monthlyIncome.toFixed(2)}`;
    document.getElementById('monthly-expense').textContent = `HK$${monthlyExpenses.toFixed(2)}`;
    document.getElementById('portfolio-value').textContent = `HK$${portfolioValue.toFixed(2)}`;
    
    // Update financial health
    updateFinancialHealth(monthlyIncome, monthlyExpenses, totalBalance);
}

function updateFinancialHealth(monthlyIncome, monthlyExpenses, totalBalance) {
    let score = 50; // Base score
    let status = '一般';
    let details = '';
    
    // Income vs expenses ratio
    if (monthlyIncome > 0) {
        const savingsRate = (monthlyIncome - monthlyExpenses) / monthlyIncome;
        score += savingsRate * 30;
    }
    
    // Total balance factor
    if (totalBalance > 10000) score += 20;
    else if (totalBalance > 0) score += 10;
    else score -= 20;
    
    // Expense pattern analysis
    if (monthlyExpenses > monthlyIncome) score -= 15;
    
    // Determine status and details
    if (score >= 80) {
        status = '優秀';
        details = '您的財務狀況非常健康！繼續保持良好的理財習慣。';
    } else if (score >= 60) {
        status = '良好';
        details = '您的財務狀況良好，建議增加儲蓄比例。';
    } else if (score >= 40) {
        status = '一般';
        details = '需要注意支出控制，建議制定預算計劃。';
    } else {
        status = '需改善';
        details = '財務狀況需要改善，請減少非必要支出並增加收入。';
    }
    
    document.getElementById('health-score').textContent = Math.max(0, Math.min(100, Math.round(score)));
    document.getElementById('health-status').textContent = status;
    document.getElementById('health-details').innerHTML = `<p>${details}</p>`;
}

// Transaction management
function populateCategories() {
    const categorySelects = ['transaction-category', 'filter-category'];
    
    categorySelects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (selectId === 'filter-category') {
            select.innerHTML = '<option value="">所有類別</option>';
        } else {
            select.innerHTML = '';
        }
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            select.appendChild(option);
        });
    });
}

function openAddTransactionModal(type = 'expense') {
    document.getElementById('addTransactionModal').classList.remove('hidden');
    document.getElementById('transaction-type').value = type;
    document.getElementById('modal-title').textContent = type === 'income' ? '新增收入' : '新增支出';
    
    // Reset form
    document.getElementById('transaction-form').reset();
    document.getElementById('transaction-date').value = new Date().toISOString().split('T')[0];
}

function closeAddTransactionModal() {
    document.getElementById('addTransactionModal').classList.add('hidden');
}

document.getElementById('transaction-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const transaction = {
        id: nextTransactionId++,
        type: document.getElementById('transaction-type').value,
        amount: parseFloat(document.getElementById('transaction-amount').value),
        category: document.getElementById('transaction-category').value,
        description: document.getElementById('transaction-description').value,
        date: document.getElementById('transaction-date').value,
        timestamp: new Date(document.getElementById('transaction-date').value).getTime()
    };
    
    transactions.unshift(transaction);
    
    updateDashboard();
    renderTransactions();
    updateCharts();
    calculateBankruptcyPrediction();
    
    closeAddTransactionModal();
    
    // Show success message
    showNotification('交易已成功添加！', 'success');
});

function renderTransactions() {
    const container = document.getElementById('transactions-list');
    const filteredTransactions = getFilteredTransactions();
    
    if (filteredTransactions.length === 0) {
        container.innerHTML = '<p class="no-data">暫無交易記錄</p>';
        return;
    }
    
    container.innerHTML = filteredTransactions.map(transaction => `
        <div class="transaction-item">
            <div class="transaction-info">
                <div class="transaction-icon ${transaction.type}">
                    <i class="fas fa-${transaction.type === 'income' ? 'arrow-up' : 'arrow-down'}"></i>
                </div>
                <div class="transaction-details">
                    <h4>${transaction.description}</h4>
                    <p>${transaction.category} • ${new Date(transaction.date).toLocaleDateString('zh-HK')}</p>
                </div>
            </div>
            <div class="transaction-amount ${transaction.type}">
                ${transaction.type === 'income' ? '+' : '-'}HK$${transaction.amount.toFixed(2)}
            </div>
        </div>
    `).join('');
}

function getFilteredTransactions() {
    const typeFilter = document.getElementById('filter-type').value;
    const categoryFilter = document.getElementById('filter-category').value;
    
    return transactions.filter(transaction => {
        const matchesType = !typeFilter || transaction.type === typeFilter;
        const matchesCategory = !categoryFilter || transaction.category === categoryFilter;
        return matchesType && matchesCategory;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
}

function filterTransactions() {
    renderTransactions();
}

// Charts functionality
function initializeCharts() {
    createExpenseChart();
    createTrendChart();
}

function createExpenseChart() {
    const ctx = document.getElementById('expenseChart').getContext('2d');
    const expensesByCategory = getExpensesByCategory();
    
    if (expenseChart) {
        expenseChart.destroy();
    }
    
    expenseChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(expensesByCategory),
            datasets: [{
                data: Object.values(expensesByCategory),
                backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545', '#D2BA4C', '#964325'],
                borderWidth: 2,
                borderColor: '#1f2937'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#e5e7eb',
                        padding: 15
                    }
                }
            }
        }
    });
}

function createTrendChart() {
    const ctx = document.getElementById('trendChart').getContext('2d');
    const trendData = getTrendData();
    
    if (trendChart) {
        trendChart.destroy();
    }
    
    trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: trendData.labels,
            datasets: [{
                label: '收入',
                data: trendData.income,
                borderColor: '#1FB8CD',
                backgroundColor: 'rgba(31, 184, 205, 0.1)',
                tension: 0.4
            }, {
                label: '支出',
                data: trendData.expenses,
                borderColor: '#DB4545',
                backgroundColor: 'rgba(219, 69, 69, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: '#374151'
                    },
                    ticks: {
                        color: '#e5e7eb'
                    }
                },
                x: {
                    grid: {
                        color: '#374151'
                    },
                    ticks: {
                        color: '#e5e7eb'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#e5e7eb'
                    }
                }
            }
        }
    });
}

function getExpensesByCategory() {
    const expenses = transactions.filter(t => t.type === 'expense');
    const categoryTotals = {};
    
    expenses.forEach(expense => {
        categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });
    
    return categoryTotals;
}

function getTrendData() {
    const last6Months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        last6Months.push({
            month: date.toLocaleDateString('zh-HK', { month: 'short' }),
            year: date.getFullYear(),
            monthIndex: date.getMonth()
        });
    }
    
    const trendData = {
        labels: last6Months.map(m => m.month),
        income: [],
        expenses: []
    };
    
    last6Months.forEach(({ year, monthIndex }) => {
        const monthIncome = transactions
            .filter(t => {
                const transactionDate = new Date(t.date);
                return t.type === 'income' &&
                       transactionDate.getFullYear() === year &&
                       transactionDate.getMonth() === monthIndex;
            })
            .reduce((sum, t) => sum + t.amount, 0);
        
        const monthExpenses = transactions
            .filter(t => {
                const transactionDate = new Date(t.date);
                return t.type === 'expense' &&
                       transactionDate.getFullYear() === year &&
                       transactionDate.getMonth() === monthIndex;
            })
            .reduce((sum, t) => sum + t.amount, 0);
        
        trendData.income.push(monthIncome);
        trendData.expenses.push(monthExpenses);
    });
    
    return trendData;
}

function updateCharts() {
    if (expenseChart) {
        const expensesByCategory = getExpensesByCategory();
        expenseChart.data.labels = Object.keys(expensesByCategory);
        expenseChart.data.datasets[0].data = Object.values(expensesByCategory);
        expenseChart.update();
    }
    
    if (trendChart) {
        const trendData = getTrendData();
        trendChart.data.datasets[0].data = trendData.income;
        trendChart.data.datasets[1].data = trendData.expenses;
        trendChart.update();
    }
}

// Bankruptcy prediction
function calculateBankruptcyPrediction() {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyIncome = transactions
        .filter(t => {
            const transactionDate = new Date(t.date);
            return t.type === 'income' && 
                   transactionDate.getMonth() === currentMonth &&
                   transactionDate.getFullYear() === currentYear;
        })
        .reduce((sum, t) => sum + t.amount, 0);
    
    const monthlyExpenses = transactions
        .filter(t => {
            const transactionDate = new Date(t.date);
            return t.type === 'expense' && 
                   transactionDate.getMonth() === currentMonth &&
                   transactionDate.getFullYear() === currentYear;
        })
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalBalance = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0) - 
        transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    let riskLevel = 'low';
    let riskText = '低風險';
    let recommendation = '您的財務狀況健康，繼續保持良好的理財習慣。';
    
    // Calculate debt-to-income ratio
    const expenseRatio = monthlyIncome > 0 ? monthlyExpenses / monthlyIncome : 1;
    
    if (expenseRatio > 0.9 || totalBalance < 0) {
        riskLevel = 'high';
        riskText = '高風險';
        recommendation = '警告：支出過高或負債嚴重，建議立即削減非必要支出並增加收入來源。';
    } else if (expenseRatio > 0.7 || totalBalance < 1000) {
        riskLevel = 'medium';
        riskText = '中風險';
        recommendation = '需要注意：支出佔收入比例過高，建議建立緊急基金並控制支出。';
    }
    
    document.getElementById('bankruptcy-prediction').innerHTML = `
        <div class="risk-level ${riskLevel}">
            <i class="fas fa-${riskLevel === 'low' ? 'check-circle' : riskLevel === 'medium' ? 'exclamation-triangle' : 'times-circle'}"></i>
            <span>破產風險：${riskText}</span>
        </div>
        <div class="prediction-details">
            <p><strong>支出比例：</strong> ${(expenseRatio * 100).toFixed(1)}%</p>
            <p><strong>建議：</strong> ${recommendation}</p>
        </div>
    `;
}

// Stock market functionality
function renderStocks() {
    const container = document.getElementById('stocks-list');
    
    container.innerHTML = stockData.map(stock => `
        <div class="stock-item">
            <div class="stock-header">
                <div>
                    <h3 class="stock-symbol">${stock.symbol}</h3>
                    <p class="stock-name">${stock.name}</p>
                </div>
                <div class="stock-price">$${stock.price.toFixed(2)}</div>
            </div>
            <div class="stock-change ${stock.change >= 0 ? 'positive' : 'negative'}">
                <i class="fas fa-${stock.change >= 0 ? 'arrow-up' : 'arrow-down'}"></i>
                ${stock.change >= 0 ? '+' : ''}${stock.change.toFixed(2)} (${stock.changePercent >= 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%)
            </div>
        </div>
    `).join('');
}

// Forex functionality
function renderForexRates() {
    const container = document.getElementById('forex-rates');
    
    container.innerHTML = forexRates.map(forex => `
        <div class="forex-item">
            <div class="forex-pair">${forex.pair}</div>
            <div class="forex-rate">${forex.rate.toFixed(4)}</div>
            <div class="stock-change ${forex.change >= 0 ? 'positive' : 'negative'}">
                <i class="fas fa-${forex.change >= 0 ? 'arrow-up' : 'arrow-down'}"></i>
                ${forex.change >= 0 ? '+' : ''}${forex.change.toFixed(4)} (${forex.changePercent >= 0 ? '+' : ''}${forex.changePercent.toFixed(2)}%)
            </div>
        </div>
    `).join('');
}

function showMarketTab(tabName) {
    // Remove active class from all tabs
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.market-tab-content').forEach(content => content.classList.remove('active'));
    
    // Add active class to selected tab
    event.target.classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

function updateForexConverter() {
    const amount = parseFloat(document.getElementById('convert-amount').value) || 1;
    const fromCurrency = document.getElementById('from-currency').value;
    const toCurrency = document.getElementById('to-currency').value;
    
    let result = amount;
    
    // Simple conversion logic using forex rates
    if (fromCurrency !== toCurrency) {
        // Find conversion rate
        const directRate = forexRates.find(r => r.pair === `${fromCurrency}/${toCurrency}`);
        const reverseRate = forexRates.find(r => r.pair === `${toCurrency}/${fromCurrency}`);
        
        if (directRate) {
            result = amount * directRate.rate;
        } else if (reverseRate) {
            result = amount / reverseRate.rate;
        } else {
            // Convert through HKD
            const fromToHKD = forexRates.find(r => r.pair === `${fromCurrency}/HKD`);
            const toToHKD = forexRates.find(r => r.pair === `${toCurrency}/HKD`);
            
            if (fromCurrency === 'HKD' && toToHKD) {
                result = amount / toToHKD.rate;
            } else if (toCurrency === 'HKD' && fromToHKD) {
                result = amount * fromToHKD.rate;
            } else if (fromToHKD && toToHKD) {
                const hkdAmount = amount * fromToHKD.rate;
                result = hkdAmount / toToHKD.rate;
            }
        }
    }
    
    document.getElementById('converter-result').textContent = `${result.toFixed(2)} ${toCurrency}`;
}

// Export and share functionality
function exportData() {
    const data = {
        transactions,
        summary: {
            totalBalance: transactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0) - 
                transactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0),
            totalIncome: transactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0),
            totalExpenses: transactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0)
        },
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `acry-finance-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('數據已導出成功！', 'success');
}

function shareReport() {
    const totalBalance = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0) - 
        transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const shareText = `我在使用 Acry Finance Hub 管理財務！\n目前總餘額：HK$${totalBalance.toFixed(2)}\n\n#理財 #AcryFinance`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Acry Finance Hub - 財務報告',
            text: shareText
        });
    } else {
        // Fallback to copying to clipboard
        navigator.clipboard.writeText(shareText).then(() => {
            showNotification('報告已複製到剪貼板！', 'success');
        });
    }
}

// Utility functions
function showNotification(message, type = 'info') {
    // Simple notification system
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: var(--color-${type === 'success' ? 'success' : 'primary'});
        color: white;
        border-radius: 8px;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Add CSS for notification animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    .no-data {
        text-align: center;
        color: var(--color-text-secondary);
        padding: var(--space-32);
        font-style: italic;
    }
`;
document.head.appendChild(style);

document.getElementById('reset-transactions-btn').addEventListener('click', function () {
    if (confirm('確定要重設所有交易記錄嗎？此操作無法還原。')) {
        transactions = [];
        nextTransactionId = 1;
        updateDashboard();
        renderTransactions();
        updateCharts();
        calculateBankruptcyPrediction();
        showNotification('所有交易記錄已重設！', 'success');
    }
});
