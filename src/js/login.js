import { showNotification } from './helpers.js';
import { supabaseClient } from './supabase.js';
import { Security } from './security.js';

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    checkAuthState();

    // Set up form submission handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Set up Google login handler
    const googleLoginButton = document.getElementById('googleLoginButton');
    if (googleLoginButton) {
        googleLoginButton.addEventListener('click', handleGoogleLogin);
    }

    // Set up password visibility toggle
    setupPasswordToggle();
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

async function handleLogin(e) {
    e.preventDefault();

    const emailInput = document.getElementById('emailaddress');
    const passwordInput = document.getElementById('password');
    const rememberMe = document.getElementById('checkbox-signin').checked;

    // Validate inputs
    if (!Security.validateEmail(emailInput.value)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }

    // Show loading state
    setLoadingState(true);

    try {
        const { data: { user }, error } = await supabaseClient.auth.signInWithPassword({
            email: emailInput.value,
            password: passwordInput.value
        });

        if (error) throw error;

        if (user) {
            // Save remember me preference
            if (rememberMe) {
                localStorage.setItem('rememberMe', 'true');
                localStorage.setItem('userEmail', emailInput.value);
            } else {
                localStorage.removeItem('rememberMe');
                localStorage.removeItem('userEmail');
            }

            showNotification('Login successful! Redirecting...', 'success');
            
            // Redirect to dashboard or previous page
            const redirectUrl = new URLSearchParams(window.location.search).get('redirect') || 'index.html';
            window.location.href = redirectUrl;
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification(getErrorMessage(error), 'error');
        setLoadingState(false);
    }
}

async function handleGoogleLogin() {
    try {
        const { data, error } = await supabaseClient.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/callback.html`
            }
        });

        if (error) throw error;

    } catch (error) {
        console.error('Google login error:', error);
        showNotification('Error signing in with Google. Please try again.', 'error');
    }
}

function setupPasswordToggle() {
    const passwordInput = document.getElementById('password');
    const toggleButton = document.querySelector('.password-eye');
    
    if (toggleButton && passwordInput) {
        toggleButton.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // Toggle eye icon
            this.classList.toggle('show');
        });
    }
}

function setLoadingState(isLoading) {
    const loginButton = document.getElementById('loginButton');
    const indicatorLabel = loginButton.querySelector('.indicator-label');
    const indicatorProgress = loginButton.querySelector('.indicator-progress');

    if (isLoading) {
        loginButton.disabled = true;
        indicatorLabel.style.display = 'none';
        indicatorProgress.classList.remove('d-none');
    } else {
        loginButton.disabled = false;
        indicatorLabel.style.display = 'block';
        indicatorProgress.classList.add('d-none');
    }
}

function getErrorMessage(error) {
    switch (error.message) {
        case 'Invalid login credentials':
            return 'Invalid email or password. Please try again.';
        case 'Email not confirmed':
            return 'Please verify your email address before logging in.';
        case 'Rate limit exceeded':
            return 'Too many login attempts. Please try again later.';
        default:
            return 'An error occurred during login. Please try again.';
    }
}

// Restore remembered email if exists
const rememberedEmail = localStorage.getItem('rememberMe') ? localStorage.getItem('userEmail') : '';
if (rememberedEmail) {
    const emailInput = document.getElementById('emailaddress');
    if (emailInput) {
        emailInput.value = rememberedEmail;
    }
} 