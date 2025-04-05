import { authService } from '../services/authService';
import { showNotification } from '../utils/notifications';

document.addEventListener('DOMContentLoaded', () => {
    const onboardingForm = document.getElementById('onboarding-form');
    const idDocumentInput = document.getElementById('id-document');

    // Handle file input change
    idDocumentInput.addEventListener('change', (e) => {
        const fileName = e.target.files[0]?.name;
        const label = e.target.nextElementSibling;
        label.textContent = fileName || 'Choose file';
    });

    // Handle form submission
    onboardingForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = {
            first_name: document.getElementById('first-name').value,
            last_name: document.getElementById('last-name').value,
            phone_number: document.getElementById('phone-number').value,
            address: document.getElementById('address').value,
            city: document.getElementById('city').value,
            country: document.getElementById('country').value,
            postal_code: document.getElementById('postal-code').value,
            date_of_birth: document.getElementById('date-of-birth').value,
            id_document_type: document.getElementById('id-document-type').value,
            id_document_number: document.getElementById('id-document-number').value
        };

        const idDocumentFile = idDocumentInput.files[0];
        if (!idDocumentFile) {
            showNotification('Please upload your ID document', 'error');
            return;
        }

        try {
            // Upload ID document
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('id-documents')
                .upload(`${auth.uid()}/${idDocumentFile.name}`, idDocumentFile);

            if (uploadError) throw uploadError;

            // Update user profile
            await authService.updateUserProfile({
                ...formData,
                id_document_verified: false
            });

            showNotification('Profile completed successfully!', 'success');
            window.location.href = '/dashboard';
        } catch (error) {
            showNotification('Error completing profile: ' + error.message, 'error');
        }
    });
}); 