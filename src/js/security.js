/**
 * Security utility class for input sanitization and validation
 */
export class Security {
    /**
     * Sanitize HTML string to prevent XSS
     * @param {string} str - String to sanitize
     * @returns {string} Sanitized string
     */
    static sanitizeHTML(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    /**
     * Sanitize user input by trimming and removing special characters
     * @param {string} str - String to sanitize
     * @returns {string} Sanitized string
     */
    static sanitizeInput(str) {
        if (!str) return '';
        return String(str)
            .trim()
            .replace(/[<>]/g, ''); // Remove potential HTML tags
    }

    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean} Whether email is valid
     */
    static validateEmail(email) {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(String(email).toLowerCase());
    }

    /**
     * Validate phone number format
     * @param {string} phone - Phone number to validate
     * @returns {boolean} Whether phone number is valid
     */
    static validatePhone(phone) {
        const re = /^\+?[\d\s-()]{8,}$/;
        return re.test(String(phone));
    }

    /**
     * Validate password strength
     * @param {string} password - Password to validate
     * @returns {object} Validation result with strength score and messages
     */
    static validatePassword(password) {
        if (typeof password !== 'string') return { valid: false, score: 0, messages: ['Invalid password type'] };

        const minLength = 8;
        const messages = [];
        let score = 0;

        // Length check
        if (password.length < minLength) {
            messages.push(`Password must be at least ${minLength} characters long`);
        } else {
            score += 1;
        }

        // Contains number
        if (!/\d/.test(password)) {
            messages.push('Password must contain at least one number');
        } else {
            score += 1;
        }

        // Contains lowercase letter
        if (!/[a-z]/.test(password)) {
            messages.push('Password must contain at least one lowercase letter');
        } else {
            score += 1;
        }

        // Contains uppercase letter
        if (!/[A-Z]/.test(password)) {
            messages.push('Password must contain at least one uppercase letter');
        } else {
            score += 1;
        }

        // Contains special character
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            messages.push('Password must contain at least one special character');
        } else {
            score += 1;
        }

        return {
            valid: score >= 4,
            score: score,
            messages: messages
        };
    }

    /**
     * Generate a secure random string
     * @param {number} length - Length of the string
     * @returns {string} Random string
     */
    static generateRandomString(length = 32) {
        const array = new Uint8Array(length);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Hash a string using SHA-256
     * @param {string} str - String to hash
     * @returns {Promise<string>} Hashed string
     */
    static async hashString(str) {
        const encoder = new TextEncoder();
        const data = encoder.encode(str);
        const hash = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hash))
            .map(byte => byte.toString(16).padStart(2, '0'))
            .join('');
    }

    /**
     * Validate file type and size
     * @param {File} file - File to validate
     * @param {object} options - Validation options
     * @returns {object} Validation result
     */
    static validateFile(file, options = {}) {
        const {
            maxSize = 5 * 1024 * 1024, // 5MB default
            allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
        } = options;

        const errors = [];

        if (file.size > maxSize) {
            errors.push(`File size must not exceed ${maxSize / (1024 * 1024)}MB`);
        }

        if (!allowedTypes.includes(file.type)) {
            errors.push(`File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }
}

// Make security utilities available globally but maintain module exports
window.Security = Security;
export default Security; 