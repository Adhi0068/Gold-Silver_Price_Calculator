const API = "/api/v1";
const modes = ["purple","dark","light"];
let modeIndex = 0;
let currentMetal = "silver";
let currentGoldPrice = 0;
let currentGoldRate = 0;
let lastRequestId = 0;

/* THEME */

function applyTheme(mode){
    document.body.classList.remove("dark","light");
    if(mode==="dark") document.body.classList.add("dark");
    if(mode==="light") document.body.classList.add("light");
    localStorage.setItem("theme",mode);
}

function loadTheme(){
    const saved=localStorage.getItem("theme")||"purple";
    modeIndex=modes.indexOf(saved);
    if(modeIndex===-1) modeIndex=0;
    applyTheme(saved);
}
loadTheme();

function toggleTheme(){
    modeIndex=(modeIndex+1)%modes.length;
    applyTheme(modes[modeIndex]);
}

function formatINR(num){
    const value = Number(num);
    return new Intl.NumberFormat("en-IN", {
        minimumFractionDigits: value % 1 !== 0 ? 2 : 0,
        maximumFractionDigits: 2
    }).format(value);
}

function sanitizeInput(input){
    if(input.value < 0) input.value="";
}

/* METAL SWITCH */

function switchMetal(metal){

    lastUpdatedTag.style.display="none";
    currentMetal = metal;
    const slider = document.querySelector(".metal-slider");

    slider.classList.remove("bounce");
    void slider.offsetWidth;
    slider.classList.add("bounce");
    slider.classList.add("animate");

    setTimeout(()=>{

        if(metal === "gold"){
            slider.style.transform = "translateX(130%)";
        }else{
            slider.style.transform = "translateX(0)";
        }

        slider.classList.remove("animate");

    },80);

    const silverRow = document.getElementById("silverPriceRow");
    const goldGrid = document.getElementById("goldGrid");

    if(metal === "gold"){
        silverRow.style.display="none";
        goldGrid.style.display="grid";
        document.getElementById("topMetalTitle").innerText="Gold";
        document.getElementById("priceLabel").innerText="Currently Set Gold Price";
        document.getElementById("updateLabel").innerText="Update Gold Price & Rate";
        document.body.classList.add("gold-mode");
        loadGold();
    } else {
        silverRow.style.display="block";
        goldGrid.style.display="none";
        document.getElementById("topMetalTitle").innerText="Silver";
        document.getElementById("priceLabel").innerText="Currently Set Silver Price";
        document.getElementById("updateLabel").innerText="Update Silver Price";
        document.body.classList.remove("gold-mode");
        loadSilver();
    }

    document.getElementById("result").style.display="none";
}

switchMetal("silver");

/* LOAD SILVER */

function loadSilver(){

    fetch(API+"/currentprice")
    .then(r=>r.json())
    .then(data=>{

        if(data.price > 0){
            currentPriceText.innerText =
                "₹ " + formatINR(data.price) + " / gram";
        }

        if(data.lastUpdated){

            const d = new Date(data.lastUpdated);

            updatedText.innerText =
                "Updated on " +
                d.toLocaleDateString("en-IN") +
                " at " +
                d.toLocaleTimeString("en-IN",{
                    hour:'2-digit',
                    minute:'2-digit'
                });

            lastUpdatedTag.style.display="inline-flex";
        }

    });
}

/* LOAD GOLD */

function loadGold(){

    fetch(API+"/gold/current")
    .then(r=>r.json())
    .then(data=>{

        if(data.price > 0){

            currentGoldPrice = Number(data.price);
            currentGoldRate  = Number(data.rate || 0);

            currentPriceText.innerText =
                "₹ " + formatINR(currentGoldPrice) +
                " / gram at " + currentGoldRate + "%";
        }

        if(data.lastUpdated){

            const d = new Date(data.lastUpdated);

            updatedText.innerText =
                "Updated on " +
                d.toLocaleDateString("en-IN") +
                " at " +
                d.toLocaleTimeString("en-IN",{
                    hour:'2-digit',
                    minute:'2-digit'
                });

            lastUpdatedTag.style.display="inline-flex";
        }

    });
}

/* UPDATE FUNCTIONS */

function updatePriceOnly(){

    const price = parseFloat(silverPriceInput.value);
    if(!price || price <= 0) return;

    fetch(`${API}/setprice?price=${price}`,{method:"POST"})
        .then(()=>loadSilver());

    silverPriceInput.value="";
}


function updateGoldPrice(){
    const price=parseFloat(goldPriceInput.value);
    if(!price||price<=0)return;
    fetch(`${API}/gold/set?price=${price}&rate=${currentGoldRate}`,{method:"POST"})
    .then(()=>loadGold());
    goldPriceInput.value="";
}

function updateGoldRate(){
    const rate=parseFloat(goldRateInput.value);
    if(rate<0)return;
    fetch(`${API}/gold/set?price=${currentGoldPrice}&rate=${rate}`,{method:"POST"})
    .then(()=>loadGold());
    goldRateInput.value="";
}

/* CALCULATE */

function autoCalculate(){
    if(!weight.value||weight.value<=0){
        result.style.display="none";
        return;
    }
    calculate();
}
function calculate(){

    const w = parseFloat(weight.value);
    if(!w || w <= 0) return;

    result.style.display = "block";
    result.scrollIntoView({ behavior: "smooth", block: "center" });

    /* ================= GOLD ================= */
    if(currentMetal === "gold"){

        if(!currentGoldPrice || currentGoldPrice <= 0){
            alert("Please set Gold price first");
            return;
        }

        const base = currentGoldPrice * w;
        const rateAmount = base * (currentGoldRate / 100);
        const final = base + rateAmount;

        totalText.innerText = "Breakdown";

        baseLabel.innerText = "Gold Base";
        makingLabel.innerText = "Rate Amount";

        basePrice.innerText = formatINR(base);

        makingCharge.innerText =
            formatINR(rateAmount) +
            " (" + currentGoldRate + "%)";

        finalAmount.innerText = formatINR(final);

        return;
    }

    /* ================= SILVER ================= */

    lastRequestId++;

    const pricePerGram = parseFloat(
        currentPriceText.innerText.replace(/[^\d.]/g,"")
    );

    if(!pricePerGram) return;

    const base = pricePerGram * w;

    baseLabel.innerText = "Base Price";
    makingLabel.innerText = "Making Charges";

    /* ===== RANGE LOGIC 10–29 ===== */
    if(w >= 10 && w <= 29){

        const minMaking = 500;
        const maxMaking = 600;

        const minTotal = base + minMaking;
        const maxTotal = base + maxMaking;

        totalText.innerText = "Breakdown";

        basePrice.innerText = formatINR(base);

        makingCharge.innerText =
            formatINR(minMaking) + " – " + formatINR(maxMaking);

        finalAmount.innerText =
            formatINR(minTotal) + " – " + formatINR(maxTotal);

        return;
    }

    /* ===== NORMAL BACKEND LOGIC ===== */
    const requestId = lastRequestId;

    fetch(API + "/calculate?weight=" + w)
    .then(r => r.text())
    .then(total => {

        if(requestId !== lastRequestId) return;

        const totalNum = parseFloat(total);
        const making = totalNum - base;

        totalText.innerText = "Breakdown";

        basePrice.innerText = formatINR(base);
        makingCharge.innerText = formatINR(making);
        finalAmount.innerText = formatINR(totalNum);
    });
}

/* HIDE METAL SWITCH WHEN KEYBOARD OPENS */

document.querySelectorAll("input").forEach(input => {

    input.addEventListener("focus", () => {
        document.body.classList.add("keyboard-open");
    });

    input.addEventListener("blur", () => {
        document.body.classList.remove("keyboard-open");
    });


});

    /* Detect keyboard open on mobile */
document.querySelectorAll("input").forEach(el => {

    el.addEventListener("focus", () => {
        document.body.classList.add("keyboard-open");
    });

    el.addEventListener("blur", () => {
        document.body.classList.remove("keyboard-open");
    });

});
