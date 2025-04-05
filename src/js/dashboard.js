import { UserManagement } from '../userManagement';
import { transactionService } from '../services/transactionService';
import { showNotification } from '../utils/notifications';

document.addEventListener("DOMContentLoaded", async function() {
    try {
        showLoader();
        
        // Check user authentication and profile
        const user = await UserManagement.getCurrentUser();
        if (!user) {
            window.location.href = "auth/login.html";
            return;
        }

        const profile = await UserManagement.getUserProfile();
        if (!profile) {
            window.location.href = "onboarding.html";
            return;
        }

        // If profile exists but is not approved, show appropriate message
        if (profile.status !== 'approved' && !profile.is_approved) {
            const container = document.querySelector('.container-fluid');
            container.innerHTML = `
                <div class="alert alert-warning">
                    <h4 class="alert-heading">Profile ${profile.status || 'pending'}</h4>
                    <p>Your profile is currently ${profile.status || 'pending'}. Please complete the onboarding process to access all features.</p>
                    <hr>
                    <p class="mb-0">
                        <a href="onboarding.html" class="btn btn-primary">Complete Onboarding</a>
                    </p>
                </div>
            `;
            hideLoader();
            return;
        }

        // Initialize dashboard
        await initializeDashboard();
        setupEventListeners();
        setupRealtimeSubscription();

    } catch (error) {
        console.error("Error initializing dashboard:", error);
        showNotification("An error occurred while loading the dashboard", "error");
    } finally {
        hideLoader();
    }
});

async function initializeDashboard() {
    try {
        // Load dashboard statistics
        const stats = await transactionService.getDashboardStats();
        updateDashboardStats(stats);

        // Load latest transactions
        await loadTransactions();
    } catch (error) {
        console.error("Error initializing dashboard:", error);
        showNotification("Error loading dashboard data", "error");
    }
}

function updateDashboardStats(stats) {
    // Update statistics cards
    document.getElementById('total-sent').textContent = formatCurrency(stats.totalSent);
    document.getElementById('completed-transfers').textContent = stats.completedTransfers;
    document.getElementById('pending-transfers').textContent = stats.pendingTransfers;
    document.getElementById('total-recipients').textContent = stats.totalRecipients;
}

async function loadTransactions() {
    try {
        const transactions = await transactionService.getUserTransactions(true);
        const transactionList = document.getElementById('transaction-list');
        
        if (!transactions || transactions.length === 0) {
            transactionList.innerHTML = `
                <li class="list-group-item">
                    No transactions found. 
                    <a href="send-money.html" class="btn btn-sm btn-primary ms-2">Send Money</a>
                </li>`;
            return;
        }

        const transactionsHtml = transactions.map(tx => {
            const statusBadgeClass = getStatusBadgeClass(tx.status);
            const paymentStatusBadgeClass = getStatusBadgeClass(tx.payment_status);
            
            const date = new Date(tx.created_at);
            const formattedDate = date.toLocaleDateString();
            const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            const sourceAmount = formatCurrency(tx.total_to_pay, tx.source_currency);
            const targetAmount = formatCurrency(tx.receiving_amount, tx.target_currency);
            
            return `
                <li class="list-group-item">
                    <div class="d-flex">
                        <div class="flex-shrink-0 align-self-center">
                            <div class="avatar border border-dashed rounded-circle align-content-center text-center p-1">
                                <i data-feather="dollar-sign" class="text-primary"></i>
                            </div>
                        </div>
                        <div class="flex-grow-1 ms-3 align-content-center">
                            <div class="row">
                                <div class="col-7 col-md-5 order-md-1">
                                    <h6 class="mb-1 text-black fs-15">${tx.recipient_name}</h6>
                                    <span class="fs-14 text-muted">${tx.send_from_country} to ${tx.send_to_country}</span>
                                    <div class="fs-14 text-muted">Reference: ${tx.reference_number}</div>
                                </div>
                                <div class="col-5 col-md-4 order-md-3 text-end mt-2 mt-md-0">
                                    <h6 class="mb-1 text-black fs-14">${sourceAmount}</h6>
                                    <span class="fs-13 text-success">→ ${targetAmount}</span><br>
                                    <span class="fs-13 text-muted">${formattedDate} ${formattedTime}</span>
                                </div>
                                <div class="col-12 col-md-3 order-md-2 align-self-center mt-2 mt-md-0">
                                    <span class="badge ${statusBadgeClass} fw-semibold rounded-pill">
                                        ${capitalizeFirst(tx.status)}
                                    </span>
                                    <span class="badge ${paymentStatusBadgeClass} fw-semibold rounded-pill mt-1">
                                        ${capitalizeFirst(tx.payment_status)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </li>
            `;
        }).join('');

        transactionList.innerHTML = transactionsHtml;
        
        // Initialize Feather icons
        feather.replace();
    } catch (error) {
        console.error('Error loading transactions:', error);
        showNotification('Error loading transactions', 'error');
    }
}

function setupEventListeners() {
    // Refresh button
    document.getElementById('refreshTransactions').addEventListener('click', async () => {
        showLoader();
        await initializeDashboard();
        hideLoader();
    });
}

// Set up real-time subscription for transaction updates
async function setupRealtimeSubscription() {
    try {
        const supabase = await import('../supabaseClient');
        
        supabase.default
            .from('transactions')
            .on('*', payload => {
                // Reload dashboard data when there's any change
                initializeDashboard();
                
                // Show notification for relevant updates
                const notificationMessages = {
                    INSERT: 'New transaction received',
                    UPDATE: `Transaction ${payload.new.reference_number} updated`,
                    DELETE: 'Transaction deleted'
                };
                
                showNotification(notificationMessages[payload.eventType], 'info');
            })
            .subscribe();
    } catch (error) {
        console.error('Error setting up realtime subscription:', error);
    }
}

// Helper Functions
function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

function getStatusBadgeClass(status) {
    if (!status) return 'bg-warning-subtle text-warning';
    
    switch (status.toLowerCase()) {
        case 'completed':
        case 'approved':
        case 'paid':
            return 'bg-success-subtle text-success';
        case 'failed':
        case 'declined':
        case 'cancelled':
            return 'bg-danger-subtle text-danger';
        case 'processing':
        case 'pending_payment':
            return 'bg-info-subtle text-info';
        case 'pending':
        case 'unpaid':
        default:
            return 'bg-warning-subtle text-warning';
    }
}

function capitalizeFirst(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

function showLoader() {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.classList.remove('d-none');
        loader.classList.add('d-flex');
    }
}

function hideLoader() {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.classList.remove('d-flex');
        loader.classList.add('d-none');
    }
} 