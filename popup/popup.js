const toggle = document.getElementById("toggle");
const status = document.getElementById("status");

toggle.addEventListener("change", () => {
  status.textContent = toggle.checked ? "ON" : "OFF";
  chrome.storage.local.set({ active: toggle.checked });
});
