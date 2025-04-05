// Main entry point for the application
(async function() {
    console.log('Loading PanaFX application...');

    try {
        // Initialize global error handler
        window.onerror = function(msg, url, lineNo, columnNo, error) {
            console.error('Global error:', { msg, url, lineNo, columnNo, error });
            showNotification('An unexpected error occurred. Please try again.', 'error');
            return false;
        };

        // Initialize global promise rejection handler
        window.onunhandledrejection = function(event) {
            console.error('Unhandled promise rejection:', event.reason);
            showNotification('An unexpected error occurred. Please try again.', 'error');
        };

        // Load core modules
        await Promise.all([
            import('./app.js'),
            import('./helpers.js'),
            import('./security.js'),
            import('./supabase.js')
        ]);

        // Initialize core application
        await window.App.initialize();

        // Load feature-specific module based on current page
        const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
        if (currentPage && currentPage !== 'index') {
            try {
                const feature = await import(`./${currentPage}.js`);
                if (feature.default && typeof feature.default.initialize === 'function') {
                    await feature.default.initialize();
                }
            } catch (error) {
                console.warn(`No feature module found for page: ${currentPage}`);
            }
        }

        console.log('PanaFX application loaded successfully');
    } catch (error) {
        console.error('Failed to load PanaFX application:', error);
        showNotification('Failed to load application. Please refresh the page or contact support.', 'error');
    }
})(); 