import { transactionService } from '../services/transactionService';
import { showNotification } from '../utils/notifications';
import { UserManagement } from '../userManagement';

let transactionsTable;
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', async function() {
    // Initialize DataTable
    transactionsTable = $('#transactions-datatable').DataTable({
        processing: true,
        serverSide: false, // Using client-side processing
        responsive: true,
        order: [[0, 'desc']], // Sort by date descending
        columns: [
            { 
                data: 'created_at',
                render: function(data) {
                    return new Date(data).toLocaleDateString();
                }
            },
            { data: 'reference_number' },
            { data: 'user_id' },
            { data: 'recipient_name' },
            { 
                data: 'amount',
                render: function(data, type, row) {
                    return new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: row.source_currency || 'USD'
                    }).format(data);
                }
            },
            { 
                data: 'status',
                render: function(data) {
                    const statusClasses = {
                        'pending': 'bg-warning',
                        'approved': 'bg-success',
                        'declined': 'bg-danger',
                        'accepted': 'bg-info'
                    };
                    return `<span class="badge ${statusClasses[data] || 'bg-secondary'}">${data}</span>`;
                }
            },
            {
                data: null,
                orderable: false,
                render: function(data, type, row) {
                    return `
                        <button type="button" class="btn btn-sm btn-info view-transaction" data-id="${row.id}">
                            <i class="mdi mdi-eye"></i>
                        </button>
                    `;
                }
            }
        ]
    });

    // Load initial data
    await loadTransactions();

    // Set up event listeners
    setupEventListeners();

    // Check if user is admin and show/hide admin features
    const isAdmin = await UserManagement.isUserAdmin();
    if (!isAdmin) {
        document.getElementById('modal-admin-section').style.display = 'none';
    }
});

async function loadTransactions() {
    try {
        const transactions = await transactionService.getTransactions(currentFilter);
        transactionsTable.clear().rows.add(transactions).draw();
    } catch (error) {
        console.error('Error loading transactions:', error);
        showNotification('Error loading transactions. Please try again.', 'error');
    }
}

function setupEventListeners() {
    // Refresh button
    document.getElementById('refreshTransactions').addEventListener('click', loadTransactions);

    // Filter dropdown
    document.querySelectorAll('[data-filter]').forEach(filter => {
        filter.addEventListener('click', async (e) => {
            e.preventDefault();
            currentFilter = e.target.dataset.filter;
            await loadTransactions();
        });
    });

    // View transaction details
    $('#transactions-datatable').on('click', '.view-transaction', async function() {
        const transactionId = $(this).data('id');
        await showTransactionDetails(transactionId);
    });

    // Modal action buttons
    document.getElementById('modal-approve-btn').addEventListener('click', handleApprove);
    document.getElementById('modal-decline-btn').addEventListener('click', handleDecline);
}

async function showTransactionDetails(transactionId) {
    try {
        const transaction = await transactionService.getTransactionById(transactionId);
        if (!transaction) {
            throw new Error('Transaction not found');
        }

        // Populate modal fields
        document.getElementById('modal-reference').textContent = transaction.reference_number;
        document.getElementById('modal-date').textContent = new Date(transaction.created_at).toLocaleString();
        document.getElementById('modal-status').textContent = transaction.status;
        document.getElementById('modal-amount').textContent = formatCurrency(transaction.amount, transaction.source_currency);
        document.getElementById('modal-exchange-rate').textContent = transaction.exchange_rate;
        document.getElementById('modal-fee').textContent = formatCurrency(transaction.transaction_fee, transaction.source_currency);
        document.getElementById('modal-total').textContent = formatCurrency(transaction.total_to_pay, transaction.source_currency);
        
        document.getElementById('modal-recipient-name').textContent = transaction.recipient_name;
        document.getElementById('modal-recipient-email').textContent = transaction.recipient_email;
        document.getElementById('modal-recipient-phone').textContent = transaction.recipient_phone;
        document.getElementById('modal-recipient-address').textContent = transaction.recipient_address;
        document.getElementById('modal-recipient-country').textContent = transaction.send_to_country;

        // Store transaction ID for actions
        document.getElementById('transactionModal').dataset.transactionId = transactionId;

        // Show/hide action buttons based on status
        const actionButtons = document.querySelectorAll('#modal-approve-btn, #modal-decline-btn');
        actionButtons.forEach(button => {
            button.style.display = transaction.status === 'pending' ? 'block' : 'none';
        });

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('transactionModal'));
        modal.show();
    } catch (error) {
        console.error('Error showing transaction details:', error);
        showNotification('Error loading transaction details', 'error');
    }
}

async function handleApprove() {
    const modal = document.getElementById('transactionModal');
    const transactionId = modal.dataset.transactionId;
    const notes = document.getElementById('modal-notes').value;

    try {
        await transactionService.updateTransactionStatus(transactionId, 'approved', notes);
        showNotification('Transaction approved successfully', 'success');
        bootstrap.Modal.getInstance(modal).hide();
        await loadTransactions();
    } catch (error) {
        console.error('Error approving transaction:', error);
        showNotification('Error approving transaction: ' + error.message, 'error');
    }
}

async function handleDecline() {
    const modal = document.getElementById('transactionModal');
    const transactionId = modal.dataset.transactionId;
    const notes = document.getElementById('modal-notes').value;

    if (!confirm('Are you sure you want to decline this transaction?')) {
        return;
    }

    try {
        await transactionService.updateTransactionStatus(transactionId, 'declined', notes);
        showNotification('Transaction declined successfully', 'success');
        bootstrap.Modal.getInstance(modal).hide();
        await loadTransactions();
    } catch (error) {
        console.error('Error declining transaction:', error);
        showNotification('Error declining transaction: ' + error.message, 'error');
    }
}

function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

// Set up real-time subscription for transaction updates
const setupRealtimeSubscription = async () => {
    try {
        const supabase = await import('../supabaseClient');
        
        supabase.default
            .from('transactions')
            .on('*', payload => {
                // Reload transactions when there's any change
                loadTransactions();
                
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
};

setupRealtimeSubscription(); 