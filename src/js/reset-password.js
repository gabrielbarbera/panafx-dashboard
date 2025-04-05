import { showNotification } from './helpers.js';
import { supabaseClient } from './supabase.js';
import { Security } from './security.js';

document.addEventListener('DOMContentLoaded', function() {
    const security = new Security();
    const urlParams = new URLSearchParams(window.location.search);
    const resetToken = urlParams.get('token');
    
    // Show appropriate form based on token presence
    if (resetToken) {
        document.getElementById('request-form').style.display = 'none';
        document.getElementById('update-form').style.display = 'block';
        setupUpdatePasswordForm();
    } else {
        setupRequestResetForm();
    }

    // Setup password toggles
    setupPasswordToggles();
});

function setupRequestResetForm() {
    const form = document.getElementById('resetPasswordForm');
    const button = document.getElementById('resetButton');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('emailaddress').value;

        try {
            setLoading(button, true);
            
            const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin + '/html/reset-password.html'
            });

            if (error) throw error;

            showNotification('success', 'Password reset instructions have been sent to your email.');
            form.reset();
        } catch (error) {
            showNotification('error', error.message || 'Failed to send reset instructions.');
        } finally {
            setLoading(button, false);
        }
    });
}

function setupUpdatePasswordForm() {
    const form = document.getElementById('updatePasswordForm');
    const button = document.getElementById('updateButton');
    const passwordInput = document.getElementById('password');
    const confirmInput = document.getElementById('confirmpassword');
    const strengthMeter = document.querySelector('.password-strength');

    // Setup password strength meter
    passwordInput.addEventListener('input', () => {
        const strength = security.checkPasswordStrength(passwordInput.value);
        strengthMeter.innerHTML = `<small class="text-${strength.color}">${strength.message}</small>`;
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const password = passwordInput.value;
        const confirmPassword = confirmInput.value;

        // Validate password
        if (password !== confirmPassword) {
            showNotification('error', 'Passwords do not match.');
            return;
        }

        const strength = security.checkPasswordStrength(password);
        if (!strength.isStrong) {
            showNotification('error', 'Please choose a stronger password.');
            return;
        }

        try {
            setLoading(button, true);

            const { error } = await supabaseClient.auth.updateUser({
                password: password
            });

            if (error) throw error;

            showNotification('success', 'Password has been updated successfully.');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } catch (error) {
            showNotification('error', error.message || 'Failed to update password.');
        } finally {
            setLoading(button, false);
        }
    });
}

function setupPasswordToggles() {
    document.querySelectorAll('.password-eye').forEach(toggle => {
        const input = toggle.closest('.input-group').querySelector('input');
        toggle.addEventListener('click', () => {
            const container = toggle.closest('.input-group-text');
            const isVisible = container.getAttribute('data-password') === 'true';
            
            container.setAttribute('data-password', !isVisible);
            input.type = isVisible ? 'password' : 'text';
            toggle.className = `password-eye ${isVisible ? '' : 'show'}`;
        });
    });
}

function setLoading(button, isLoading) {
    const label = button.querySelector('.indicator-label');
    const progress = button.querySelector('.indicator-progress');
    
    if (isLoading) {
        label.style.display = 'none';
        progress.classList.remove('d-none');
        button.disabled = true;
    } else {
        label.style.display = 'block';
        progress.classList.add('d-none');
        button.disabled = false;
    }
} 