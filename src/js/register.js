import { showNotification } from './helpers.js';
import { supabaseClient } from './supabase.js';
import { Security } from './security.js';

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    checkAuthState();

    // Set up form submission handler
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegistration);
    }

    // Set up Google signup handler
    const googleSignupButton = document.getElementById('googleSignupButton');
    if (googleSignupButton) {
        googleSignupButton.addEventListener('click', handleGoogleSignup);
    }

    // Set up password validation
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', validatePasswordStrength);
    }

    // Set up password visibility toggles
    setupPasswordToggles();
});

async function checkAuthState() {
    try {
        const { data: { user }, error } = await supabaseClient.auth.getUser();
        
        if (user && !error) {
            // User is already logged in, redirect to dashboard
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('Error checking auth state:', error);
    }
}

async function handleRegistration(e) {
    e.preventDefault();

    const fullnameInput = document.getElementById('fullname');
    const emailInput = document.getElementById('emailaddress');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmpassword');
    const termsCheckbox = document.getElementById('checkbox-terms');

    // Validate inputs
    if (!validateInputs(fullnameInput, emailInput, passwordInput, confirmPasswordInput, termsCheckbox)) {
        return;
    }

    // Show loading state
    setLoadingState(true);

    try {
        // Register user with Supabase
        const { data: { user }, error } = await supabaseClient.auth.signUp({
            email: emailInput.value,
            password: passwordInput.value,
            options: {
                data: {
                    full_name: fullnameInput.value
                }
            }
        });

        if (error) throw error;

        if (user) {
            showNotification('Registration successful! Please check your email to verify your account.', 'success');
            
            // Clear form
            registerForm.reset();

            // Redirect to login page after a delay
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 3000);
        }
    } catch (error) {
        console.error('Registration error:', error);
        showNotification(getErrorMessage(error), 'error');
    } finally {
        setLoadingState(false);
    }
}

async function handleGoogleSignup() {
    try {
        const { data, error } = await supabaseClient.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/callback.html`
            }
        });

        if (error) throw error;

    } catch (error) {
        console.error('Google signup error:', error);
        showNotification('Error signing up with Google. Please try again.', 'error');
    }
}

function validateInputs(fullnameInput, emailInput, passwordInput, confirmPasswordInput, termsCheckbox) {
    let isValid = true;

    // Validate full name
    if (fullnameInput.value.trim().length < 2) {
        showError(fullnameInput, 'Please enter your full name');
        isValid = false;
    }

    // Validate email
    if (!Security.validateEmail(emailInput.value)) {
        showError(emailInput, 'Please enter a valid email address');
        isValid = false;
    }

    // Validate password
    const passwordValidation = Security.validatePassword(passwordInput.value);
    if (!passwordValidation.valid) {
        showError(passwordInput, passwordValidation.messages[0]);
        isValid = false;
    }

    // Validate password confirmation
    if (passwordInput.value !== confirmPasswordInput.value) {
        showError(confirmPasswordInput, 'Passwords do not match');
        isValid = false;
    }

    // Validate terms acceptance
    if (!termsCheckbox.checked) {
        showError(termsCheckbox, 'You must accept the Terms and Conditions');
        isValid = false;
    }

    return isValid;
}

function validatePasswordStrength() {
    const passwordInput = document.getElementById('password');
    const strengthIndicator = document.querySelector('.password-strength');
    
    const validation = Security.validatePassword(passwordInput.value);
    const strengthClasses = ['weak', 'medium', 'strong'];
    const strengthClass = strengthClasses[Math.min(Math.floor(validation.score / 2), 2)];
    
    strengthIndicator.className = `password-strength mt-1 ${strengthClass}`;
    strengthIndicator.textContent = validation.messages[0] || 'Password strength: ' + strengthClass;
}

function setupPasswordToggles() {
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    const toggleButtons = document.querySelectorAll('.password-eye');
    
    toggleButtons.forEach((button, index) => {
        button.addEventListener('click', function() {
            const type = passwordInputs[index].getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInputs[index].setAttribute('type', type);
            
            // Toggle eye icon
            this.classList.toggle('show');
        });
    });
}

function showError(element, message) {
    // Remove any existing error
    removeError(element);

    // Add error class
    element.classList.add('is-invalid');

    // Create and append error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'invalid-feedback';
    errorDiv.textContent = message;
    element.parentNode.appendChild(errorDiv);
}

function removeError(element) {
    element.classList.remove('is-invalid');
    const errorDiv = element.parentNode.querySelector('.invalid-feedback');
    if (errorDiv) {
        errorDiv.remove();
    }
}

function setLoadingState(isLoading) {
    const registerButton = document.getElementById('registerButton');
    const indicatorLabel = registerButton.querySelector('.indicator-label');
    const indicatorProgress = registerButton.querySelector('.indicator-progress');

    if (isLoading) {
        registerButton.disabled = true;
        indicatorLabel.style.display = 'none';
        indicatorProgress.classList.remove('d-none');
    } else {
        registerButton.disabled = false;
        indicatorLabel.style.display = 'block';
        indicatorProgress.classList.add('d-none');
    }
}

function getErrorMessage(error) {
    switch (error.message) {
        case 'User already registered':
            return 'This email is already registered. Please use a different email or try logging in.';
        case 'Password is too weak':
            return 'Password is too weak. Please use a stronger password.';
        case 'Rate limit exceeded':
            return 'Too many registration attempts. Please try again later.';
        default:
            return 'An error occurred during registration. Please try again.';
    }
} 