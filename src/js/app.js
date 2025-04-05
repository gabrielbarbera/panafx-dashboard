import { showNotification } from './helpers.js';

/**
 * Core application class
 */
export class App {
    static async initialize() {
        console.log("Initializing application...");
        
        try {
            // Initialize common components
            await this.initializeComponents();
            
            // Initialize feature-specific code
            await this.initializeFeature();
            
            // Initialize global event listeners
            this.initializeEventListeners();
            
            console.log("Application initialized successfully");
        } catch (error) {
            console.error("Error initializing application:", error);
            throw error;
        }
    }

    static async initializeComponents() {
        // Initialize Feather icons
        if (window.feather) {
            window.feather.replace();
        }

        // Initialize tooltips
        if (window.bootstrap && window.bootstrap.Tooltip) {
            const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
            tooltips.forEach(tooltip => new bootstrap.Tooltip(tooltip));
        }

        // Initialize popovers
        if (window.bootstrap && window.bootstrap.Popover) {
            const popovers = document.querySelectorAll('[data-bs-toggle="popover"]');
            popovers.forEach(popover => new bootstrap.Popover(popover));
        }

        // Initialize SimpleBar for custom scrollbars
        if (window.SimpleBar) {
            document.querySelectorAll('[data-simplebar]').forEach(element => {
                new SimpleBar(element);
            });
        }

        // Initialize notification system
        this.initializeNotifications();

        // Initialize loader
        this.initializeLoader();
    }

    static initializeNotifications() {
        // Create notification container if it doesn't exist
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.className = 'notification-container';
            document.body.appendChild(container);
        }

        // Global notification function
        window.showNotification = function(message, type = 'info', duration = 5000) {
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.innerHTML = `
                <div class="notification-content">
                    <span class="notification-message">${message}</span>
                    <button class="notification-close">&times;</button>
                </div>
            `;

            // Add close button functionality
            const closeButton = notification.querySelector('.notification-close');
            closeButton.addEventListener('click', () => {
                notification.classList.add('notification-hiding');
                setTimeout(() => notification.remove(), 300);
            });

            // Add to container
            container.appendChild(notification);

            // Auto-hide after duration
            if (duration > 0) {
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.classList.add('notification-hiding');
                        setTimeout(() => notification.remove(), 300);
                    }
                }, duration);
            }

            // Remove old notifications if there are too many
            const maxNotifications = 5;
            const notifications = container.getElementsByClassName('notification');
            while (notifications.length > maxNotifications) {
                container.removeChild(notifications[0]);
            }
        };
    }

    static initializeLoader() {
        // Create loader container if it doesn't exist
        let loader = document.getElementById('page-loader');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'page-loader';
            loader.className = 'page-loader';
            loader.innerHTML = `
                <div class="loader-content">
                    <div class="spinner"></div>
                    <div class="loader-text">Loading...</div>
                </div>
            `;
            document.body.appendChild(loader);
        }

        // Global loader functions
        window.PageLoader = {
            show() {
                loader.classList.add('show');
            },
            hide() {
                loader.classList.remove('show');
            }
        };

        // Auto-hide loader when page is fully loaded
        window.addEventListener('load', () => {
            window.PageLoader.hide();
        });
    }

    static initializeEventListeners() {
        // Handle all link clicks for loader
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && !link.target && !link.href.includes('#') && !link.href.includes('javascript:')) {
                window.PageLoader.show();
            }
        });

        // Handle form submissions
        document.addEventListener('submit', () => {
            window.PageLoader.show();
        });

        // Handle AJAX requests
        const originalFetch = window.fetch;
        window.fetch = function() {
            window.PageLoader.show();
            return originalFetch.apply(this, arguments)
                .finally(() => {
                    setTimeout(() => {
                        window.PageLoader.hide();
                    }, 300);
                });
        };

        // Handle browser back/forward
        window.addEventListener('popstate', () => {
            window.PageLoader.show();
        });

        // Handle scroll-to-top button
        const scrollTopButton = document.getElementById('scroll-top');
        if (scrollTopButton) {
            window.addEventListener('scroll', helpers.debounce(() => {
                if (window.pageYOffset > 100) {
                    scrollTopButton.classList.add('show');
                } else {
                    scrollTopButton.classList.remove('show');
                }
            }, 150));

            scrollTopButton.addEventListener('click', (e) => {
                e.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }
    }

    static async initializeFeature() {
        // Get current page name from URL
        const pagePath = window.location.pathname;
        const pageName = pagePath.split('/').pop().replace('.html', '');
        
        if (!pageName) return;

        try {
            // Try to load the feature module
            const feature = await import(`./${pageName}.js`);
            if (feature.default && typeof feature.default.initialize === 'function') {
                await feature.default.initialize();
            }
        } catch (error) {
            console.warn(`No feature module found for page: ${pageName}`);
        }
    }
}

// Make App available globally but maintain module exports
window.App = App;
export default App; 