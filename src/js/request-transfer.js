// Bank configuration
const banks = [
  { id: 'atb', name: 'ATB Financial', logo: 'atb.png' },
  { id: 'bmo', name: 'BMO', logo: 'bmo.png' },
  { id: 'cibc', name: 'CIBC', logo: 'cibc.png' },
  { id: 'coast', name: 'Coast Capital', logo: 'coast.png' },
  { id: 'laurentian', name: 'Laurentian Bank', logo: 'laurentian.png' },
  { id: 'meridian', name: 'Meridian', logo: 'meridian.png' },
  { id: 'motus', name: 'Motus Bank', logo: 'motus_bank.png' },
  { id: 'national', name: 'National Bank', logo: 'national_bank.png' },
  { id: 'peoples', name: 'Peoples Bank', logo: 'peoples.png' },
  { id: 'rbc', name: 'RBC', logo: 'rbc.png' },
  { id: 'scotiabank', name: 'Scotiabank', logo: 'scotiabank.png' },
  { id: 'simplii', name: 'Simplii Financial', logo: 'simplii.png' },
  { id: 'tangerine', name: 'Tangerine', logo: 'tangerine.png' },
  { id: 'td', name: 'TD Bank', logo: 'td.png' }
];

const provinces = [
  { id: 'ab', name: 'Alberta (AB)' },
  { id: 'bc', name: 'British Columbia (BC)' },
  { id: 'mb', name: 'Manitoba (MB)' },
  { id: 'nb', name: 'New Brunswick (NB)' },
  { id: 'nl', name: 'Newfoundland and Labrador (NL)' },
  { id: 'ns', name: 'Nova Scotia (NS)' },
  { id: 'nt', name: 'Northwest Territories (NT)' },
  { id: 'nu', name: 'Nunavut (NU)' },
  { id: 'on', name: 'Ontario (ON)' },
  { id: 'pe', name: 'Prince Edward Island (PE)' },
  { id: 'qc', name: 'Quebec (QC)' },
  { id: 'sk', name: 'Saskatchewan (SK)' },
  { id: 'yt', name: 'Yukon (YT)' }
];

const creditUnions = [
  { id: 'meridian', name: 'Meridian Credit Union' },
  { id: 'vancity', name: 'Vancity' },
  { id: 'servus', name: 'Servus Credit Union' },
  { id: 'coast', name: 'Coast Capital Savings' },
  { id: 'firstOntario', name: 'FirstOntario Credit Union' },
  { id: 'conexus', name: 'Conexus Credit Union' },
  { id: 'steinbach', name: 'Steinbach Credit Union' },
  { id: 'affinity', name: 'Affinity Credit Union' },
  { id: 'alterna', name: 'Alterna Savings' },
  { id: 'weathsimple', name: 'Wealthsimple Cash' }
];

document.addEventListener("DOMContentLoaded", async function() {
  try {
    // Get URL parameters to populate form
    const urlParams = new URLSearchParams(window.location.search);
    
    // Populate form fields from URL parameters or localStorage
    populateFormFields();
    
    // Set up event listeners for buttons
    document.getElementById('acceptRequestBtn').addEventListener('click', acceptRequest);
    document.getElementById('declineRequestBtn').addEventListener('click', declineRequest);
    
    // Initialize bank logos and dropdowns
    initializeBankLogos();
    initializeDropdowns();
    
    // Check form validity on load
    checkFormValidity();
  } catch (error) {
    console.error('Error initializing request transfer page:', error);
    MessageNotification.show("Error initializing page. Please try again.", "error");
  }
});

// Function to populate form fields from URL parameters or localStorage
function populateFormFields() {
  const urlParams = new URLSearchParams(window.location.search);
  
  // Get data from URL params or localStorage
  const recipientName = urlParams.get('recipient_name') || localStorage.getItem('recipient_name') || "Recipient Name";
  const recipientEmail = urlParams.get('recipient_email') || localStorage.getItem('recipient_email') || "";
  const amountToSend = urlParams.get('amount_to_send') || localStorage.getItem('amount_to_send') || "";
  const country = urlParams.get('country') || localStorage.getItem('country') || "";
  const expireDate = urlParams.get('expire_date') || localStorage.getItem('expire_date') || "";
  const refNumber = urlParams.get('reference_number') || localStorage.getItem('reference_number') || "";
  
  // Validate required fields
  if (!recipientName || !recipientEmail || !amountToSend || !country || !refNumber) {
    MessageNotification.show("Missing required transaction information. Redirecting back to send money page.", "error");
    setTimeout(() => {
      window.location.href = 'send-money.html';
    }, 2000);
    return;
  }
  
  // Format amount with currency symbol and commas
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'CAD'
  }).format(parseFloat(amountToSend));
  
  // Set form values
  document.getElementById('recipientName').value = recipientName;
  document.getElementById('recipientEmail').value = recipientEmail;
  document.getElementById('amountToSend').value = amountToSend;
  document.getElementById('country').value = country;
  document.getElementById('expireDate').value = expireDate;
  document.getElementById('referenceNumber').value = refNumber;
  
  // Update header displays
  document.getElementById('amount-display').textContent = formattedAmount;
  document.getElementById('reference-display').textContent = `Reference #: ${refNumber}`;
  document.getElementById('date-display').textContent = new Date().toLocaleDateString();
}

// Function to initialize bank logos
function initializeBankLogos() {
  const bankLogosContainer = document.getElementById('bank-logos');
  
  banks.forEach(bank => {
    const bankDiv = document.createElement('div');
    bankDiv.className = 'col text-center';
    bankDiv.innerHTML = `
      <div class="bank-logo-container p-2 border rounded cursor-pointer" onclick="selectBank('${bank.id}')">
        <img src="src/images/banks/${bank.logo}" alt="${bank.name}" class="img-fluid" 
             onerror="this.src='https://via.placeholder.com/100x40?text=${bank.id.toUpperCase()}'" 
             style="max-height: 80px;">
      </div>
    `;
    bankLogosContainer.appendChild(bankDiv);
  });
}

// Function to initialize dropdowns
function initializeDropdowns() {
  const financialInstitutionSelect = document.getElementById('financialInstitution');
  const provinceSelect = document.getElementById('provinceTerritory');
  const creditUnionSelect = document.getElementById('creditUnion');
  
  // Populate financial institutions
  banks.forEach(bank => {
    const option = document.createElement('option');
    option.value = bank.id;
    option.textContent = bank.name;
    financialInstitutionSelect.appendChild(option);
  });
  
  // Populate provinces
  provinces.forEach(province => {
    const option = document.createElement('option');
    option.value = province.id;
    option.textContent = province.name;
    provinceSelect.appendChild(option);
  });
  
  // Populate credit unions
  creditUnions.forEach(union => {
    const option = document.createElement('option');
    option.value = union.id;
    option.textContent = union.name;
    creditUnionSelect.appendChild(option);
  });
  
  // Add change event listeners
  [financialInstitutionSelect, provinceSelect, creditUnionSelect].forEach(select => {
    select.addEventListener('change', checkFormValidity);
  });
}

// Function to select bank from logo click
window.selectBank = function(bankId) {
  // Remove selected class from all containers
  document.querySelectorAll('.bank-logo-container').forEach(container => {
    container.classList.remove('selected');
  });
  
  // Add selected class to clicked container
  event.currentTarget.classList.add('selected');
  
  // Update the select dropdown
  const select = document.getElementById('financialInstitution');
  select.value = bankId;
  
  // Check form validity after selection
  checkFormValidity();
};

// Function to check if all required fields are filled
function checkFormValidity() {
  const financialInstitution = document.getElementById('financialInstitution').value;
  const provinceTerritory = document.getElementById('provinceTerritory').value;
  const creditUnion = document.getElementById('creditUnion').value;
  
  // Enable the Accept button only if all selections are made
  const acceptBtn = document.getElementById('acceptRequestBtn');
  acceptBtn.disabled = !(financialInstitution && provinceTerritory && creditUnion);
}

// Function to accept the money transfer request
async function acceptRequest(e) {
  e.preventDefault();
  
  try {
    // Show loading state
    const acceptBtn = document.getElementById('acceptRequestBtn');
    acceptBtn.disabled = true;
    acceptBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...';
    
    // Get the reference number from the form
    const referenceNumber = document.getElementById('referenceNumber').value;
    
    // First check if user is admin
    const isAdmin = await UserManagement.isUserAdmin();
    
    // Update the transaction status in Supabase
    const { error } = await supabaseClient
      .from('transactions')
      .update({
        status: 'accepted',
        updated_at: new Date().toISOString(),
        processed_by: isAdmin ? (await UserManagement.getCurrentUser()).id : null
      })
      .eq('reference_number', referenceNumber);
    
    if (error) {
      console.error("Error updating transaction:", error);
      if (error.code === '42501') {
        throw new Error(isAdmin ? "Admin access denied. Please check your permissions." : "Permission denied. Please check your account status.");
      } else if (error.code === '23505') {
        throw new Error("A transaction with this reference number already exists.");
      } else {
        throw error;
      }
    }
    
    // Show success message
    MessageNotification.show('Transaction accepted successfully!', 'success');
    
    // Clear localStorage items
    clearLocalStorageItems();
    
    // Redirect to dashboard after a short delay
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 2000);
    
  } catch (error) {
    console.error('Error accepting transaction:', error);
    MessageNotification.show(`Error accepting transaction: ${error.message}`, 'error');
    
    // Re-enable the button
    const acceptBtn = document.getElementById('acceptRequestBtn');
    acceptBtn.disabled = false;
    acceptBtn.textContent = 'Accept Request';
  }
}

// Function to decline the money transfer request
async function declineRequest(e) {
  e.preventDefault();
  
  try {
    // Show confirmation dialog first
    if (!confirm('Are you sure you want to decline this transfer request?')) {
      return;
    }

    // Show loading state
    const declineBtn = document.getElementById('declineRequestBtn');
    declineBtn.disabled = true;
    declineBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...';
    
    // Get the reference number from the form
    const referenceNumber = document.getElementById('referenceNumber').value;
    
    if (!referenceNumber) {
      throw new Error('Reference number not found');
    }

    // Update the transaction status to 'declined'
    const { error: updateError } = await supabaseClient
      .from('transactions')
      .update({
        status: 'declined',
        updated_at: new Date().toISOString()
      })
      .eq('reference_number', referenceNumber);
    
    if (updateError) {
      throw new Error('Error updating transaction: ' + updateError.message);
    }
    
    // Show success message
    MessageNotification.show('Transaction declined successfully.', 'success');
    
    // Clear localStorage items
    clearLocalStorageItems();
    
    // Redirect to send-money page after a short delay
    setTimeout(() => {
      window.location.href = 'send-money.html';
    }, 2000);
    
  } catch (error) {
    console.error('Error declining transaction:', error);
    MessageNotification.show(`Error declining transaction: ${error.message}`, 'error');
    
    // Re-enable the button
    const declineBtn = document.getElementById('declineRequestBtn');
    declineBtn.disabled = false;
    declineBtn.textContent = 'Decline Request';
  }
}

// Helper function to clear localStorage items
function clearLocalStorageItems() {
  localStorage.removeItem('recipient_name');
  localStorage.removeItem('recipient_email');
  localStorage.removeItem('amount_to_send');
  localStorage.removeItem('country');
  localStorage.removeItem('expire_date');
  localStorage.removeItem('reference_number');
} 