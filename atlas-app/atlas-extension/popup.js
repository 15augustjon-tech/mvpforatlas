// ATLAS Extension Popup Script
const API_URL = "http://localhost:3001"; // Change to your deployed URL

document.addEventListener("DOMContentLoaded", async () => {
  const statusDot = document.getElementById("statusDot");
  const statusText = document.getElementById("statusText");
  const fillBtn = document.getElementById("fillBtn");
  const settingsBtn = document.getElementById("settingsBtn");
  const loading = document.getElementById("loading");
  const result = document.getElementById("result");

  // Check if we have a profile saved
  const profile = await getProfile();

  if (profile && profile.full_name) {
    statusDot.classList.add("connected");
    statusText.textContent = `Ready: ${profile.full_name}`;
    fillBtn.disabled = false;
  } else {
    statusDot.classList.add("disconnected");
    statusText.textContent = "Not connected - Open ATLAS first";
    fillBtn.disabled = true;
  }

  // Fill button click
  fillBtn.addEventListener("click", async () => {
    fillBtn.disabled = true;
    loading.style.display = "flex";
    result.style.display = "none";

    try {
      // Send message to content script to fill the form
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      chrome.tabs.sendMessage(tab.id, {
        action: "AI_FILL_FORM",
        profile: profile,
        apiUrl: API_URL,
      }, (response) => {
        loading.style.display = "none";

        if (response && response.success) {
          result.className = "result success";
          result.textContent = `Filled ${response.fieldsCount} fields with AI!`;
          result.style.display = "block";
        } else {
          result.className = "result error";
          result.textContent = response?.error || "Failed to fill form. Make sure you're on a job application page.";
          result.style.display = "block";
        }

        fillBtn.disabled = false;
      });
    } catch (error) {
      loading.style.display = "none";
      result.className = "result error";
      result.textContent = "Error: " + error.message;
      result.style.display = "block";
      fillBtn.disabled = false;
    }
  });

  // Settings button
  settingsBtn.addEventListener("click", () => {
    chrome.tabs.create({ url: API_URL + "/profile" });
  });
});

// Get profile from storage or fetch from ATLAS
async function getProfile() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["atlasProfile"], async (data) => {
      if (data.atlasProfile) {
        resolve(data.atlasProfile);
      } else {
        // Try to fetch from API
        try {
          const response = await fetch(API_URL + "/api/profile");
          if (response.ok) {
            const profile = await response.json();
            chrome.storage.local.set({ atlasProfile: profile });
            resolve(profile);
          } else {
            resolve(null);
          }
        } catch {
          resolve(null);
        }
      }
    });
  });
}
