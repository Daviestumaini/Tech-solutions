// ==========================================================
// CHECKOUT.JS
// PART 1
// ==========================================================

let checkoutCart = [];
let checkoutData = {};
let isContinuingToPayment = false;

const deliveryZones = {
    "Nairobi": [
        "Westlands", "CBD", "Kilimani", "Karen", "Roysambu",
        "Embakasi", "South B", "South C", "Kasarani", "Ruaka"
    ],
    "Kiambu": [
        "Thika", "Ruiru", "Kiambu Town", "Juja", "Limuru", "Kikuyu"
    ],
    "Nakuru": [
        "Nakuru CBD", "Naivasha", "Molo", "Gilgil"
    ],
    "Mombasa": [
        "Nyali", "Bamburi", "Likoni", "Mtwapa"
    ],
    "Kisumu": [
        "Milimani", "Kondele", "Manyatta"
    ],
    "Machakos": [
        "Machakos Town", "Athi River", "Mlolongo"
    ],
    "Nyeri": [
        "Nyeri Town", "Othaya", "Karatina"
    ],
    "Uasin Gishu": [
        "Eldoret", "Burnt Forest"
    ]
};

// ==========================================================
// DELIVERY FEE
// ==========================================================

function calculateDeliveryFee(county, town = "") {

    if (!county) return 0;

    const fees = {
        "Nairobi": 300,
        "Kiambu": 350,
        "Machakos": 400,
        "Kajiado": 450,
        "Nakuru": 500,
        "Nyeri": 550,
        "Kisumu": 700,
        "Mombasa": 800,
        "Uasin Gishu": 700
    };

    if (county === "Nairobi" && town) {
        return 300;
    }

    return fees[county] || 900;

}

// ==========================================================
// LIVE SUMMARY (recalculates the moment county/town changes)
// ==========================================================

function renderCheckoutSummary() {

    const subtotalEl = document.getElementById("checkoutSubtotal");
    const deliveryEl = document.getElementById("checkoutDelivery");
    const totalEl = document.getElementById("checkoutTotal");
    const countyEl = document.getElementById("county");
    const townEl = document.getElementById("town");

    if (!subtotalEl || !deliveryEl || !totalEl) return;

    const subtotal = checkoutCart.reduce((sum, item) => {
        return sum + (Number(item.price) * item.quantity);
    }, 0);

    const county = countyEl?.value || "";
    const town = townEl?.value || "";
    const deliveryFee = calculateDeliveryFee(county, town);
    const total = subtotal + deliveryFee;

    subtotalEl.textContent = formatKES(subtotal);
    deliveryEl.textContent = formatKES(deliveryFee);
    totalEl.textContent = formatKES(total);

}

// ==========================================================
// LOAD CART
// ==========================================================

function loadCheckoutCart() {

    loadCart();

    checkoutCart = Array.isArray(getCartItems()) ? [...getCartItems()] : [];

    renderCheckoutItems();

}

// ==========================================================
// RENDER ORDER
// ==========================================================

function renderCheckoutItems() {

    const container = document.getElementById("checkoutItems");
    const itemCount = document.getElementById("checkoutItemsCount");
    const subtotalEl = document.getElementById("checkoutSubtotal");
    const totalEl = document.getElementById("checkoutTotal");
    const deliveryEl = document.getElementById("checkoutDelivery");

    if (!container) return;

    container.innerHTML = "";

    if (checkoutCart.length === 0) {

        container.innerHTML = `
        <div class="emptyCheckout">
            <i class="fa-solid fa-cart-shopping"></i>
            <p>Your cart is empty.</p>
        </div>
        `;

        itemCount.textContent = "0";
        subtotalEl.textContent = "0";
        totalEl.textContent = "0";
        if (deliveryEl) deliveryEl.textContent = "0";

        return;

    }

    let totalItems = 0;

    checkoutCart.forEach(item => {

        totalItems += item.quantity;

        container.innerHTML += `
        <div class="checkoutItem">
            <img src="${item.image}" alt="${item.name}" onerror="this.src='assets/images/no-image.png'">
            <div class="checkoutInfo">
                <h3>${item.name}</h3>
                <p>Qty: ${item.quantity}</p>
                <strong>KES ${formatKES(item.price)}</strong>
            </div>
        </div>
        `;

    });

    itemCount.textContent = totalItems;

    renderCheckoutSummary();

}

// ==========================================================
// POPULATE TOWNS (this is what makes delivery cost live-update)
// ==========================================================

function populateTownDropdown() {

    const county = document.getElementById("county");
    const town = document.getElementById("town");

    if (!county || !town) return;

    county.addEventListener("change", () => {

        town.innerHTML = `<option value="">Select Town</option>`;

        const selected = deliveryZones[county.value];

        if (selected) {
            selected.forEach(location => {
                town.innerHTML += `<option value="${location}">${location}</option>`;
            });
        }

        // Delivery fee updates immediately, even before a town is picked
        renderCheckoutSummary();

    });

    town.addEventListener("change", () => {
        renderCheckoutSummary();
    });

}

// ==========================================================
// EMAIL VALIDATION
// ==========================================================

function validEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ==========================================================
// VALIDATE FORM
// ==========================================================

function validateCheckout() {

    const name = document.getElementById("customerName").value.trim();
    const phone = document.getElementById("customerPhone").value.trim();
    const email = document.getElementById("customerEmail").value.trim();
    const county = document.getElementById("county").value;
    const town = document.getElementById("town").value;

    if (!name) {
        alert("Please enter your full name.");
        return false;
    }

    if (!/^0\d{9}$/.test(phone)) {
        alert("Enter a valid Safaricom phone number.");
        return false;
    }

    // Email is required now — it's how the receipt gets sent after payment
    if (!validEmail(email)) {
        alert("Enter a valid email address — your receipt will be sent there.");
        return false;
    }

    if (!county) {
        alert("Please select your county.");
        return false;
    }

    if (!town) {
        alert("Please select your town.");
        return false;
    }

    return true;

}

// ==========================================================
// SAVE CHECKOUT
// ==========================================================

function saveCheckoutData() {

    const customer = {
        name: document.getElementById("customerName").value.trim(),
        phone: document.getElementById("customerPhone").value.trim(),
        email: document.getElementById("customerEmail").value.trim(),
        county: document.getElementById("county").value,
        town: document.getElementById("town").value,
        address: document.getElementById("address").value.trim(),
        landmark: document.getElementById("landmark").value.trim(),
        notes: document.getElementById("notes").value.trim()
    };

    const subtotal = getCartTotal();
    const deliveryFee = calculateDeliveryFee(customer.county, customer.town);
    const total = subtotal + deliveryFee;

    checkoutData = {
        customer,
        order: checkoutCart,
        cart: checkoutCart,
        items: checkoutCart,
        subtotal,
        deliveryFee,
        total
    };

    // NOTE: trackingId is no longer generated here.
    // It's generated by the backend when the order row is created on the
    // payment page, so it's guaranteed unique against Supabase, not just
    // against Date.now() collisions in the browser.

    localStorage.setItem("checkoutData", JSON.stringify(checkoutData));

}

// ==========================================================
// CONTINUE TO PAYMENT
// ==========================================================

function continueToPayment(event) {

    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    if (isContinuingToPayment) return;

    if (checkoutCart.length === 0) {
        alert("Your cart is empty.");
        window.location.href = "cart.html";
        return;
    }

    if (!validateCheckout()) return;

    isContinuingToPayment = true;

    saveCheckoutData();

    window.location.href = "payment.html";

}

// ==========================================================
// INITIALIZE
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {

    loadCheckoutCart();

    populateTownDropdown();

    const button = document.getElementById("continueToPayment");

    if (button) {
        button.type = "button";
        button.addEventListener("click", continueToPayment);
    }

});