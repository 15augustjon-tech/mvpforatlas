// Profile fields to save
const FIELDS = ['firstName', 'lastName', 'email', 'phone', 'linkedin', 'university', 'major', 'gradYear', 'gpa'];

// Load saved profile on popup open
document.addEventListener('DOMContentLoaded', async () => {
  const data = await chrome.storage.local.get('atlasProfile');

  if (data.atlasProfile) {
    // Fill in saved values
    FIELDS.forEach(field => {
      const input = document.getElementById(field);
      if (input && data.atlasProfile[field]) {
        input.value = data.atlasProfile[field];
      }
    });

    // Update status
    updateStatus(true);
  }
});

// Save profile
document.getElementById('saveBtn').addEventListener('click', async () => {
  const profile = {};

  FIELDS.forEach(field => {
    const input = document.getElementById(field);
    if (input) {
      profile[field] = input.value.trim();
    }
  });

  // Validate required fields
  if (!profile.firstName || !profile.email) {
    showToast('Please enter at least your name and email');
    return;
  }

  // Save to Chrome storage
  await chrome.storage.local.set({ atlasProfile: profile });

  updateStatus(true);
  showToast('Profile saved! Ready to auto-fill.');
});

// Auto-fill current page
document.getElementById('fillBtn').addEventListener('click', async () => {
  const data = await chrome.storage.local.get('atlasProfile');

  if (!data.atlasProfile) {
    showToast('Please save your profile first');
    return;
  }

  // Get current tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab.id) {
    showToast('Cannot access this page');
    return;
  }

  // Send message to content script to fill the form
  try {
    await chrome.tabs.sendMessage(tab.id, {
      action: 'fillForm',
      profile: data.atlasProfile
    });

    showToast('Form filled! Review and submit.');

    // Close popup after a short delay
    setTimeout(() => window.close(), 1500);
  } catch (error) {
    console.error('Fill error:', error);
    showToast('Could not fill this page. Try refreshing.');
  }
});

// Update connection status UI
function updateStatus(connected) {
  const dot = document.getElementById('statusDot');
  const text = document.getElementById('statusText');
  const badge = document.getElementById('savedBadge');

  if (connected) {
    dot.classList.add('connected');
    text.textContent = 'Profile ready';
    badge.style.display = 'block';
  } else {
    dot.classList.remove('connected');
    text.textContent = 'Not configured';
    badge.style.display = 'none';
  }
}

// Show toast notification
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}
