import { transactionService } from '../services/transactionService';
import { showNotification } from '../utils/notifications';

// Mapping countries to currencies
const countryToCurrencyMap = {
  "Australia": "AUD",
  "Austria": "EUR",
  "Belgium": "EUR",
  "Brazil": "BRL",
  "Canada": "CAD",
  "Estonia": "EUR",
  "Finland": "EUR",
  "France": "EUR",
  "Germany": "EUR",
  "Iceland": "ISK",
  "India": "INR",
  "Indonesia": "IDR",
  "Ireland": "EUR",
  "Italy": "EUR",
  "Malaysia": "MYR",
  "Mexico": "MXN",
  "Philippines": "PHP",
  "Romania": "RON",
  "South Africa": "ZAR",
  "Spain": "EUR",
  "Switzerland": "CHF",
  "Thailand": "THB",
  "United Kingdom": "GBP",
  "United States": "USD"
};

const currencySymbolsMap = {
  "AFN": "؋",
  "ALL": "L",
  "ARS": "$",
  "AUD": "A$",
  "CAD": "C$",
  "USD": "$",
  "EUR": "€",
  "INR": "₹",
  "GBP": "£",
  "JPY": "¥",
  "CNY": "¥",
  "ZAR": "R",
  "BRL": "R$",
  "TRY": "₺"
};

// Helper function to fetch exchange rate using the Fawaz Ahmed API with fallback
async function fetchExchangeRate(sourceCurrency, targetCurrency) {
  // Primary URL using jsDelivr
  const primaryUrl = `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${sourceCurrency.toLowerCase()}.json`;
  // Fallback URL using Cloudflare Pages
  const fallbackUrl = `https://latest.currency-api.pages.dev/v1/currencies/${sourceCurrency.toLowerCase()}.json`;

  try {
    // Attempt primary fetch first
    const response = await fetch(primaryUrl);
    if (!response.ok) throw new Error("Primary API failed");
    const data = await response.json();
    return processExchangeRateData(data, sourceCurrency, targetCurrency);
  } catch (err) {
    console.warn("Primary API error, using fallback. Error:", err);
    const resp = await fetch(fallbackUrl);
    if (!resp.ok) throw new Error("Fallback API failed");
    const data = await resp.json();
    return processExchangeRateData(data, sourceCurrency, targetCurrency);
  }
}

function processExchangeRateData(data, sourceCurrency, targetCurrency) {
  const rates = data[sourceCurrency.toLowerCase()];
  if (!rates) throw new Error("No rates found for " + sourceCurrency);
  const rate = rates[targetCurrency.toLowerCase()];
  if (!rate) throw new Error("No conversion rate for " + targetCurrency);
  return rate;
}

document.addEventListener('DOMContentLoaded', async () => {
    const sendMoneyForm = document.getElementById('send-money-form');
    const recentTransactionsTable = document.getElementById('recent-transactions');

    // Load recent transactions
    async function loadRecentTransactions() {
        try {
            const transactions = await transactionService.getTransactions();
            recentTransactionsTable.innerHTML = transactions
                .slice(0, 5)
                .map(transaction => `
                    <tr>
                        <td>${new Date(transaction.created_at).toLocaleDateString()}</td>
                        <td>${transaction.receiver_id}</td>
                        <td>${transaction.amount} ${transaction.currency}</td>
                        <td><span class="badge badge-${getStatusBadgeClass(transaction.status)}">${transaction.status}</span></td>
                    </tr>
                `).join('');
        } catch (error) {
            showNotification('Error loading transactions', 'error');
        }
    }

    // Handle form submission
    sendMoneyForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = {
            recipient_email: document.getElementById('recipient-email').value,
            amount: parseFloat(document.getElementById('amount').value),
            currency: document.getElementById('currency').value,
            description: document.getElementById('description').value
        };

        try {
            await transactionService.createTransaction(formData);
            showNotification('Money sent successfully!', 'success');
            sendMoneyForm.reset();
            loadRecentTransactions();
        } catch (error) {
            showNotification('Error sending money: ' + error.message, 'error');
        }
    });

    // Helper function to get status badge class
    function getStatusBadgeClass(status) {
        switch (status.toLowerCase()) {
            case 'completed':
                return 'success';
            case 'pending':
                return 'warning';
            case 'failed':
                return 'danger';
            default:
                return 'secondary';
        }
    }

    // Initial load
    loadRecentTransactions();
}); 