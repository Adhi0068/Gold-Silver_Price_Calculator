/* Static GitHub Pages implementation: no Spring Boot API required. */
const modes = ["purple", "dark", "light"];
let modeIndex = 0;
let currentMetal = "silver";
let currentGoldPrice = 0;
let currentGoldRate = 0;
const $ = (id) => document.getElementById(id);

const DEFAULT_SILVER_PRICE = 200;
const DEFAULT_SILVER_UPDATED = "2026-03-02T02:36:58.867";
const DEFAULT_GOLD_PRICE = 23566.0;
const DEFAULT_GOLD_RATE = 354.0;
const DEFAULT_GOLD_UPDATED = "2026-04-02T13:59:40.121373";

const KEYS = {
  theme: "metalCalculator.theme",
  silverPrice: "silverCalculator.price",
  silverUpdated: "silverCalculator.lastUpdated",
  goldPrice: "goldCalculator.price",
  goldRate: "goldCalculator.rate",
  goldUpdated: "goldCalculator.lastUpdated"
};

function formatINR(value) {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: Number(value) % 1 !== 0 ? 2 : 0,
    maximumFractionDigits: 2
  }).format(Number(value));
}

function applyTheme(mode) {
  document.body.classList.remove("dark", "light");
  if (mode === "dark") document.body.classList.add("dark");
  if (mode === "light") document.body.classList.add("light");
  try { localStorage.setItem(KEYS.theme, mode); } catch (_) {}
}
function loadTheme() {
  let saved = "purple";
  try { saved = localStorage.getItem(KEYS.theme) || "purple"; } catch (_) {}
  modeIndex = Math.max(0, modes.indexOf(saved));
  applyTheme(saved);
}
function toggleTheme() {
  modeIndex = (modeIndex + 1) % modes.length;
  applyTheme(modes[modeIndex]);
}
function sanitizeInput(input) {
  if (Number(input.value) < 0) input.value = "";
}
function showStatus(message, isError = false) {
  let status = $("statusMessage");
  if (!status) {
    status = document.createElement("p");
    status.id = "statusMessage";
    status.className = "status-message";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    $("weight").closest(".row").after(status);
  }
  status.textContent = message;
  status.style.color = isError ? "#ffb4b4" : "var(--text)";
}
function showUpdated(value) {
  if (!value) {
    $("lastUpdatedTag").style.display = "none";
    return;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    $("lastUpdatedTag").style.display = "none";
    return;
  }
  $("updatedText").textContent = "Updated on " +
    date.toLocaleDateString("en-IN") + " at " +
    date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  $("lastUpdatedTag").style.display = "inline-flex";
}
function loadSilver() {
  let price = DEFAULT_SILVER_PRICE;
  let updated = DEFAULT_SILVER_UPDATED;
  try {
    const saved = Number(localStorage.getItem(KEYS.silverPrice));
    if (saved > 0) price = saved;
    updated = localStorage.getItem(KEYS.silverUpdated) || updated;
  } catch (_) {}
  $("currentPriceText").textContent = "₹ " + formatINR(price) + " / gram";
  showUpdated(updated);
}
function loadGold() {
  currentGoldPrice = DEFAULT_GOLD_PRICE;
  currentGoldRate = DEFAULT_GOLD_RATE;
  let updated = DEFAULT_GOLD_UPDATED;
  try {
    const price = Number(localStorage.getItem(KEYS.goldPrice));
    const rate = localStorage.getItem(KEYS.goldRate);
    if (price > 0) currentGoldPrice = price;
    if (rate !== null && Number(rate) >= 0) currentGoldRate = Number(rate);
    updated = localStorage.getItem(KEYS.goldUpdated) || updated;
  } catch (_) {}
  $("currentPriceText").textContent = "₹ " + formatINR(currentGoldPrice) +
    " / gram at " + formatINR(currentGoldRate) + "%";
  showUpdated(updated);
}
function switchMetal(metal) {
  currentMetal = metal;
  $("result").style.display = "none";
  const slider = document.querySelector(".metal-slider");
  slider.classList.remove("bounce");
  void slider.offsetWidth;
  slider.classList.add("bounce");
  slider.style.transform = metal === "gold" ? "translateX(100%)" : "translateX(0)";
  $("silverPriceRow").style.display = metal === "silver" ? "block" : "none";
  $("goldGrid").style.display = metal === "gold" ? "grid" : "none";
  $("topMetalTitle").textContent = metal === "gold" ? "Gold" : "Silver";
  $("priceLabel").textContent = "Currently Set " + (metal === "gold" ? "Gold" : "Silver") + " Price";
  $("updateLabel").textContent = metal === "gold" ? "Update Gold Price & Rate" : "Update Silver Price";
  document.body.classList.toggle("gold-mode", metal === "gold");
  showStatus("");
  if (metal === "gold") loadGold(); else loadSilver();
}
function saveTimestamp() { return new Date().toISOString(); }
function pulsePrice() {
  $("currentPriceText").classList.add("pulse");
  $("lastUpdatedTag").classList.add("glow");
  setTimeout(() => {
    $("currentPriceText").classList.remove("pulse");
    $("lastUpdatedTag").classList.remove("glow");
  }, 800);
}
function updatePriceOnly() {
  const price = Number($("silverPriceInput").value);
  if (!Number.isFinite(price) || price <= 0) {
    showStatus("Enter a silver price greater than zero.", true);
    return;
  }
  const updated = saveTimestamp();
  try {
    localStorage.setItem(KEYS.silverPrice, String(price));
    localStorage.setItem(KEYS.silverUpdated, updated);
  } catch (_) {
    showStatus("Could not save the silver price in this browser.", true);
    return;
  }
  $("silverPriceInput").value = "";
  loadSilver();
  showStatus("Silver price updated and saved in this browser.");
  pulsePrice();
  if (Number($("weight").value) > 0) calculate(false);
}
function persistGold() {
  const updated = saveTimestamp();
  try {
    localStorage.setItem(KEYS.goldPrice, String(currentGoldPrice));
    localStorage.setItem(KEYS.goldRate, String(currentGoldRate));
    localStorage.setItem(KEYS.goldUpdated, updated);
  } catch (_) {
    showStatus("Could not save the gold settings in this browser.", true);
    return false;
  }
  loadGold();
  showStatus("Gold settings updated and saved in this browser.");
  pulsePrice();
  if (Number($("weight").value) > 0) calculate(false);
  return true;
}
function updateGoldPrice() {
  const price = Number($("goldPriceInput").value);
  if (!Number.isFinite(price) || price <= 0) {
    showStatus("Enter a gold price greater than zero.", true);
    return;
  }
  currentGoldPrice = price;
  if (persistGold()) $("goldPriceInput").value = "";
}
function updateGoldRate() {
  const rate = Number($("goldRateInput").value);
  if (!Number.isFinite(rate) || rate < 0 || $("goldRateInput").value === "") {
    showStatus("Enter a valid rate of zero or more.", true);
    return;
  }
  currentGoldRate = rate;
  if (persistGold()) $("goldRateInput").value = "";
}
function autoCalculate() {
  const weight = Number($("weight").value);
  if (!Number.isFinite(weight) || weight <= 0) {
    $("result").style.display = "none";
    return;
  }
  calculate(false);
}
function calculate(shouldScroll = true) {
  const weight = Number($("weight").value);
  if (!Number.isFinite(weight) || weight <= 0) {
    $("result").style.display = "none";
    showStatus("Enter a weight greater than zero.", true);
    return;
  }
  let base;
  let making;
  let final;
  if (currentMetal === "gold") {
    if (!(currentGoldPrice > 0)) {
      showStatus("Please set the gold price first.", true);
      return;
    }
    base = currentGoldPrice * weight;
    making = base * (currentGoldRate / 100);
    final = base + making;
    $("baseLabel").textContent = "Gold Base";
    $("makingLabel").textContent = "Rate Amount";
    $("makingCharge").textContent = formatINR(making) + " (" + formatINR(currentGoldRate) + "%)";
  } else {
    const pricePerGram = Number($("currentPriceText").textContent.replace(/[^\d.]/g, ""));
    if (!(pricePerGram > 0)) {
      showStatus("Please set the silver price first.", true);
      return;
    }
    base = pricePerGram * weight;
    let minMaking;
    let maxMaking;
    if (weight < 8) minMaking = maxMaking = 65;
    else if (weight < 10) minMaking = maxMaking = 25;
    else if (weight >= 10 && weight <= 29) { minMaking = 500; maxMaking = 600; }
    else if (weight < 30) minMaking = maxMaking = 500;
    else if (weight < 40) minMaking = maxMaking = weight * 20;
    else if (weight < 50) minMaking = maxMaking = weight * 18;
    else if (weight < 70) minMaking = maxMaking = weight * 15;
    else minMaking = maxMaking = weight * 12;
    $("baseLabel").textContent = "Base Price";
    $("makingLabel").textContent = "Making Charges";
    making = minMaking;
    final = base + making;
    $("makingCharge").textContent = minMaking === maxMaking
      ? formatINR(minMaking)
      : formatINR(minMaking) + " – " + formatINR(maxMaking);
    $("finalAmount").textContent = minMaking === maxMaking
      ? formatINR(final)
      : formatINR(base + minMaking) + " – " + formatINR(base + maxMaking);
  }
  $("result").style.display = "block";
  $("totalText").textContent = "Breakdown";
  $("basePrice").textContent = formatINR(base);
  if (currentMetal === "gold") $("finalAmount").textContent = formatINR(final);
  showStatus("");
  if (shouldScroll) $("result").scrollIntoView({ behavior: "smooth", block: "center" });
}
document.querySelectorAll("input").forEach(input => {
  input.addEventListener("focus", () => document.body.classList.add("keyboard-open"));
  input.addEventListener("blur", () => document.body.classList.remove("keyboard-open"));
});
loadTheme();
switchMetal("silver");
