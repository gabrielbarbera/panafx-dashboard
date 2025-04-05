import { authService } from '../services/authService';
import { showNotification } from '../utils/notifications';

document.addEventListener('DOMContentLoaded', async () => {
    const profileForm = document.getElementById('profile-form');
    const preferencesForm = document.getElementById('preferences-form');
    const changePictureBtn = document.getElementById('change-picture-btn');
    const changePasswordBtn = document.getElementById('change-password-btn');
    const enable2faBtn = document.getElementById('enable-2fa-btn');

    // Load user profile
    async function loadUserProfile() {
        try {
            const profile = await authService.getUserProfile();
            if (profile) {
                document.getElementById('first-name').value = profile.first_name || '';
                document.getElementById('last-name').value = profile.last_name || '';
                document.getElementById('email').value = profile.email || '';
                document.getElementById('phone-number').value = profile.phone_number || '';
                document.getElementById('address').value = profile.address || '';
                document.getElementById('city').value = profile.city || '';
                document.getElementById('country').value = profile.country || '';
                document.getElementById('postal-code').value = profile.postal_code || '';
            }
        } catch (error) {
            showNotification('Error loading profile', 'error');
        }
    }

    // Handle profile form submission
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = {
            first_name: document.getElementById('first-name').value,
            last_name: document.getElementById('last-name').value,
            phone_number: document.getElementById('phone-number').value,
            address: document.getElementById('address').value,
            city: document.getElementById('city').value,
            country: document.getElementById('country').value,
            postal_code: document.getElementById('postal-code').value
        };

        try {
            await authService.updateUserProfile(formData);
            showNotification('Profile updated successfully!', 'success');
        } catch (error) {
            showNotification('Error updating profile: ' + error.message, 'error');
        }
    });

    // Handle preferences form submission
    preferencesForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const preferences = {
            email_notifications: document.getElementById('email-notifications').checked,
            sms_notifications: document.getElementById('sms-notifications').checked,
            push_notifications: document.getElementById('push-notifications').checked
        };

        try {
            await authService.updateUserProfile({ preferences });
            showNotification('Preferences updated successfully!', 'success');
        } catch (error) {
            showNotification('Error updating preferences: ' + error.message, 'error');
        }
    });

    // Handle profile picture change
    changePictureBtn.addEventListener('click', async () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    const { data, error } = await supabase.storage
                        .from('profile-pictures')
                        .upload(`${auth.uid()}/profile.jpg`, file);

                    if (error) throw error;

                    const { data: { publicUrl } } = supabase.storage
                        .from('profile-pictures')
                        .getPublicUrl(`${auth.uid()}/profile.jpg`);

                    document.getElementById('profile-picture').src = publicUrl;
                    showNotification('Profile picture updated successfully!', 'success');
                } catch (error) {
                    showNotification('Error updating profile picture: ' + error.message, 'error');
                }
            }
        };

        input.click();
    });

    // Handle password change
    changePasswordBtn.addEventListener('click', async () => {
        const newPassword = prompt('Enter your new password:');
        if (newPassword) {
            try {
                await authService.updatePassword(newPassword);
                showNotification('Password updated successfully!', 'success');
            } catch (error) {
                showNotification('Error updating password: ' + error.message, 'error');
            }
        }
    });

    // Handle 2FA enable/disable
    enable2faBtn.addEventListener('click', async () => {
        try {
            const { data, error } = await supabase.auth.mfa.enroll({
                factorType: 'totp'
            });

            if (error) throw error;

            // Show QR code to user
            const qrCodeUrl = data.totp.qr_code;
            // Implement QR code display logic here

            const verificationCode = prompt('Enter the verification code from your authenticator app:');
            if (verificationCode) {
                const { error: verifyError } = await supabase.auth.mfa.challenge({
                    factorId: data.totp.id,
                    code: verificationCode
                });

                if (verifyError) throw verifyError;
                showNotification('Two-factor authentication enabled successfully!', 'success');
            }
        } catch (error) {
            showNotification('Error enabling 2FA: ' + error.message, 'error');
        }
    });

    // Initial load
    loadUserProfile();
}); 