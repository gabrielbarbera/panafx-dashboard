/**
 * Helper utilities for common operations
 */
export const helpers = {
    // Format currency with proper symbol and decimals
    formatCurrency(amount, currency = 'USD') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    },

    // Format date to local string
    formatDate(date, options = {}) {
        const defaultOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(date).toLocaleString('en-US', { ...defaultOptions, ...options });
    },

    // Debounce function to limit execution rate
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Get URL parameters as object
    getUrlParams() {
        const params = new URLSearchParams(window.location.search);
        const result = {};
        for (const [key, value] of params.entries()) {
            result[key] = value;
        }
        return result;
    },

    // Download file with proper mime type
    downloadFile(data, filename, type = 'text/plain') {
        const blob = new Blob([data], { type });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    },

    // Check if element is in viewport
    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },

    // Smooth scroll to element with offset
    scrollToElement(element, offset = 0) {
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    },

    // DOM manipulation helpers
    dom: {
        // Toggle class on element
        toggleClass(element, className) {
            element.classList.toggle(className);
        },

        // Add class to element
        addClass(element, className) {
            element.classList.add(className);
        },

        // Remove class from element
        removeClass(element, className) {
            element.classList.remove(className);
        },

        // Check if element has class
        hasClass(element, className) {
            return element.classList.contains(className);
        },

        // Get element by selector
        getElement(selector) {
            return document.querySelector(selector);
        },

        // Get elements by selector
        getElements(selector) {
            return document.querySelectorAll(selector);
        },

        // Create element with attributes and children
        createElement(tag, attributes = {}, children = []) {
            const element = document.createElement(tag);
            
            // Set attributes
            Object.entries(attributes).forEach(([key, value]) => {
                if (key === 'class') {
                    element.className = value;
                } else if (key === 'style' && typeof value === 'object') {
                    Object.assign(element.style, value);
                } else {
                    element.setAttribute(key, value);
                }
            });
            
            // Append children
            children.forEach(child => {
                if (typeof child === 'string') {
                    element.appendChild(document.createTextNode(child));
                } else {
                    element.appendChild(child);
                }
            });
            
            return element;
        }
    },

    // String manipulation helpers
    string: {
        // Capitalize first letter
        capitalize(str) {
            return str.charAt(0).toUpperCase() + str.slice(1);
        },

        // Truncate string with ellipsis
        truncate(str, length, ending = '...') {
            if (str.length > length) {
                return str.substring(0, length - ending.length) + ending;
            }
            return str;
        },

        // Generate random string
        random(length = 8) {
            return Math.random().toString(36).substring(2, length + 2);
        }
    },

    // Array manipulation helpers
    array: {
        // Chunk array into smaller arrays
        chunk(arr, size) {
            return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
                arr.slice(i * size, i * size + size)
            );
        },

        // Remove duplicates from array
        unique(arr) {
            return [...new Set(arr)];
        },

        // Group array by key
        groupBy(arr, key) {
            return arr.reduce((acc, item) => {
                (acc[item[key]] = acc[item[key]] || []).push(item);
                return acc;
            }, {});
        }
    }
};

// Make helpers available globally but maintain module exports
window.helpers = helpers;
export default helpers; 