import { UserManagement } from '../userManagement';
import { showNotification } from '../utils/notifications';
import { transactionService } from '../services/transactionService';

let usersTable;
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', async function() {
    // Check if user has admin access
    const isAdmin = await UserManagement.isUserAdmin();
    if (!isAdmin) {
        window.location.href = 'index.html';
        return;
    }

    // Initialize DataTable
    usersTable = $('#users-datatable').DataTable({
        processing: true,
        serverSide: false,
        responsive: true,
        order: [[3, 'desc']], // Sort by registration date descending
        columns: [
            { data: 'id' },
            { 
                data: null,
                render: function(data) {
                    return `${data.first_name} ${data.last_name}`;
                }
            },
            { data: 'email' },
            { 
                data: 'created_at',
                render: function(data) {
                    return new Date(data).toLocaleDateString();
                }
            },
            { 
                data: 'status',
                render: function(data) {
                    const statusClasses = {
                        'pending': 'bg-warning',
                        'approved': 'bg-success',
                        'rejected': 'bg-danger',
                        'suspended': 'bg-secondary'
                    };
                    return `<span class="badge ${statusClasses[data] || 'bg-info'}">${data}</span>`;
                }
            },
            { 
                data: 'kyc_status',
                render: function(data) {
                    const kycClasses = {
                        'pending': 'bg-warning',
                        'verified': 'bg-success',
                        'rejected': 'bg-danger'
                    };
                    return `<span class="badge ${kycClasses[data] || 'bg-secondary'}">${data}</span>`;
                }
            },
            {
                data: null,
                orderable: false,
                render: function(data) {
                    return `
                        <button type="button" class="btn btn-sm btn-info view-user" data-id="${data.id}">
                            <i class="mdi mdi-eye"></i>
                        </button>
                    `;
                }
            }
        ]
    });

    // Load initial data
    await loadUsers();

    // Set up event listeners
    setupEventListeners();
});

async function loadUsers() {
    try {
        const users = await UserManagement.getUsers(currentFilter);
        usersTable.clear().rows.add(users).draw();
    } catch (error) {
        console.error('Error loading users:', error);
        showNotification('Error loading users. Please try again.', 'error');
    }
}

function setupEventListeners() {
    // Refresh button
    document.getElementById('refreshUsers').addEventListener('click', loadUsers);

    // Filter dropdown
    document.querySelectorAll('[data-filter]').forEach(filter => {
        filter.addEventListener('click', async (e) => {
            e.preventDefault();
            currentFilter = e.target.dataset.filter;
            await loadUsers();
        });
    });

    // View user details
    $('#users-datatable').on('click', '.view-user', async function() {
        const userId = $(this).data('id');
        await showUserDetails(userId);
    });

    // Modal action buttons
    document.getElementById('modal-approve-btn').addEventListener('click', handleApprove);
    document.getElementById('modal-reject-btn').addEventListener('click', handleReject);
    document.getElementById('modal-suspend-btn').addEventListener('click', handleSuspend);

    // Tab change handlers
    $('a[data-bs-toggle="tab"]').on('shown.bs.tab', function (e) {
        const tabId = e.target.getAttribute('href');
        if (tabId === '#documents-tab') {
            loadUserDocuments();
        } else if (tabId === '#transactions-tab') {
            loadUserTransactions();
        } else if (tabId === '#activity-tab') {
            loadUserActivity();
        }
    });
}

async function showUserDetails(userId) {
    try {
        const user = await UserManagement.getUserById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Store user ID for actions
        document.getElementById('userModal').dataset.userId = userId;

        // Populate profile tab
        document.getElementById('modal-full-name').textContent = `${user.first_name} ${user.last_name}`;
        document.getElementById('modal-email').textContent = user.email;
        document.getElementById('modal-phone').textContent = user.phone;
        document.getElementById('modal-dob').textContent = new Date(user.date_of_birth).toLocaleDateString();
        document.getElementById('modal-address').textContent = formatAddress(user);

        document.getElementById('modal-account-type').textContent = user.account_type;
        document.getElementById('modal-status').textContent = user.status;
        document.getElementById('modal-registration-date').textContent = new Date(user.created_at).toLocaleString();
        document.getElementById('modal-last-login').textContent = user.last_login ? new Date(user.last_login).toLocaleString() : 'Never';
        document.getElementById('modal-2fa-status').textContent = user.two_factor_enabled ? 'Enabled' : 'Disabled';

        // Show/hide action buttons based on status
        updateActionButtons(user.status);

        // Load initial tab content
        await loadUserDocuments(userId);

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('userModal'));
        modal.show();
    } catch (error) {
        console.error('Error showing user details:', error);
        showNotification('Error loading user details', 'error');
    }
}

async function loadUserDocuments(userId) {
    try {
        const documents = await UserManagement.getUserDocuments(userId);
        const container = document.querySelector('.documents-list');
        container.innerHTML = '';

        if (documents.length === 0) {
            container.innerHTML = '<p class="text-muted">No documents uploaded yet.</p>';
            return;
        }

        documents.forEach(doc => {
            const docElement = document.createElement('div');
            docElement.className = 'document-item p-2 border rounded mb-2';
            docElement.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="mb-0">${doc.document_type}</h6>
                        <small class="text-muted">Uploaded: ${new Date(doc.uploaded_at).toLocaleString()}</small>
                    </div>
                    <div>
                        <a href="${doc.document_url}" target="_blank" class="btn btn-sm btn-primary">
                            <i class="mdi mdi-eye"></i> View
                        </a>
                    </div>
                </div>
            `;
            container.appendChild(docElement);
        });
    } catch (error) {
        console.error('Error loading user documents:', error);
        showNotification('Error loading documents', 'error');
    }
}

async function loadUserTransactions(userId) {
    try {
        const transactions = await transactionService.getUserTransactions(userId);
        const tbody = document.querySelector('#modal-transactions-table tbody');
        tbody.innerHTML = '';

        if (transactions.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center">No transactions found.</td></tr>';
            return;
        }

        transactions.forEach(trans => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${new Date(trans.created_at).toLocaleDateString()}</td>
                <td>${trans.transaction_type}</td>
                <td>${formatCurrency(trans.amount, trans.currency)}</td>
                <td><span class="badge bg-${getStatusClass(trans.status)}">${trans.status}</span></td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading user transactions:', error);
        showNotification('Error loading transactions', 'error');
    }
}

async function loadUserActivity(userId) {
    try {
        const activities = await UserManagement.getUserActivity(userId);
        const container = document.querySelector('.activity-timeline');
        container.innerHTML = '';

        if (activities.length === 0) {
            container.innerHTML = '<p class="text-muted">No activity recorded yet.</p>';
            return;
        }

        activities.forEach(activity => {
            const activityElement = document.createElement('div');
            activityElement.className = 'activity-item mb-3';
            activityElement.innerHTML = `
                <div class="d-flex">
                    <div class="activity-content">
                        <small class="text-muted">${new Date(activity.timestamp).toLocaleString()}</small>
                        <p class="mb-0">${activity.description}</p>
                    </div>
                </div>
            `;
            container.appendChild(activityElement);
        });
    } catch (error) {
        console.error('Error loading user activity:', error);
        showNotification('Error loading activity log', 'error');
    }
}

async function handleApprove() {
    const modal = document.getElementById('userModal');
    const userId = modal.dataset.userId;
    const notes = document.getElementById('modal-notes').value;

    try {
        await UserManagement.updateUserStatus(userId, 'approved', notes);
        showNotification('User approved successfully', 'success');
        bootstrap.Modal.getInstance(modal).hide();
        await loadUsers();
    } catch (error) {
        console.error('Error approving user:', error);
        showNotification('Error approving user: ' + error.message, 'error');
    }
}

async function handleReject() {
    const modal = document.getElementById('userModal');
    const userId = modal.dataset.userId;
    const notes = document.getElementById('modal-notes').value;

    if (!confirm('Are you sure you want to reject this user?')) {
        return;
    }

    try {
        await UserManagement.updateUserStatus(userId, 'rejected', notes);
        showNotification('User rejected successfully', 'success');
        bootstrap.Modal.getInstance(modal).hide();
        await loadUsers();
    } catch (error) {
        console.error('Error rejecting user:', error);
        showNotification('Error rejecting user: ' + error.message, 'error');
    }
}

async function handleSuspend() {
    const modal = document.getElementById('userModal');
    const userId = modal.dataset.userId;
    const notes = document.getElementById('modal-notes').value;

    if (!confirm('Are you sure you want to suspend this user account?')) {
        return;
    }

    try {
        await UserManagement.updateUserStatus(userId, 'suspended', notes);
        showNotification('User account suspended successfully', 'success');
        bootstrap.Modal.getInstance(modal).hide();
        await loadUsers();
    } catch (error) {
        console.error('Error suspending user:', error);
        showNotification('Error suspending user: ' + error.message, 'error');
    }
}

function updateActionButtons(userStatus) {
    const approveBtn = document.getElementById('modal-approve-btn');
    const rejectBtn = document.getElementById('modal-reject-btn');
    const suspendBtn = document.getElementById('modal-suspend-btn');

    switch (userStatus) {
        case 'pending':
            approveBtn.style.display = 'block';
            rejectBtn.style.display = 'block';
            suspendBtn.style.display = 'none';
            break;
        case 'approved':
            approveBtn.style.display = 'none';
            rejectBtn.style.display = 'none';
            suspendBtn.style.display = 'block';
            break;
        case 'suspended':
            approveBtn.style.display = 'block';
            rejectBtn.style.display = 'none';
            suspendBtn.style.display = 'none';
            break;
        default:
            approveBtn.style.display = 'none';
            rejectBtn.style.display = 'none';
            suspendBtn.style.display = 'none';
    }
}

function formatAddress(user) {
    const parts = [
        user.address,
        user.city,
        user.state,
        user.postal_code,
        user.country
    ];
    return parts.filter(Boolean).join(', ');
}

function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

function getStatusClass(status) {
    const classes = {
        'pending': 'warning',
        'approved': 'success',
        'rejected': 'danger',
        'suspended': 'secondary',
        'completed': 'info'
    };
    return classes[status] || 'secondary';
}

// Set up real-time subscription for user updates
const setupRealtimeSubscription = async () => {
    try {
        const supabase = await import('../supabaseClient');
        
        supabase.default
            .from('user_profiles')
            .on('*', payload => {
                // Reload users when there's any change
                loadUsers();
                
                // Show notification for relevant updates
                const notificationMessages = {
                    INSERT: 'New user registered',
                    UPDATE: `User profile updated`,
                    DELETE: 'User profile deleted'
                };
                
                showNotification(notificationMessages[payload.eventType], 'info');
            })
            .subscribe();
    } catch (error) {
        console.error('Error setting up realtime subscription:', error);
    }
};

setupRealtimeSubscription(); 