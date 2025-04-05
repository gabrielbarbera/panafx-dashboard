export function showNotification(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container') || createToastContainer();
    const toast = createToast(message, type);
    toastContainer.appendChild(toast);

    // Show the toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);

    // Remove the toast after 5 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 5000);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
    `;
    document.body.appendChild(container);
    return container;
}

function createToast(message, type) {
    const toast = document.createElement('div');
    toast.className = `toast bg-${type}`;
    toast.style.cssText = `
        color: white;
        padding: 15px 25px;
        margin-bottom: 10px;
        border-radius: 4px;
        opacity: 0;
        transition: opacity 0.3s ease-in-out;
    `;

    const icon = getIconForType(type);
    toast.innerHTML = `
        <div style="display: flex; align-items: center;">
            <i class="fas ${icon}" style="margin-right: 10px;"></i>
            <span>${message}</span>
        </div>
    `;

    return toast;
}

function getIconForType(type) {
    switch (type) {
        case 'success':
            return 'fa-check-circle';
        case 'error':
            return 'fa-exclamation-circle';
        case 'warning':
            return 'fa-exclamation-triangle';
        case 'info':
        default:
            return 'fa-info-circle';
    }
} 