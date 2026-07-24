// ==========================================================
// PAYMENT.JS
// PART 1 — STATE + DATA LOADING
// ==========================================================

let cart = [];
let checkoutData = {};
let subtotal = 0;
let deliveryFee = 0;
let total = 0;

let currentOrderId = null;     // Supabase orders.id (uuid)
let currentTrackingId = null;  // human-facing tracking id, e.g. TS-...
let checkoutRequestId = null;  // Daraja's CheckoutRequestID for this attempt

let isCreatingOrder = false;
let isPaying = false;
let pollTimer = null;
let pollAttempts = 0;

const POLL_INTERVAL_MS = 3000;
const MAX_POLL_ATTEMPTS = 20; // ~60 seconds, matches the STK Push PIN-entry window

// ==========================================================
// LOAD DATA (from checkout.html's handoff)
// ==========================================================

function loadData() {

    try {

        const savedCheckout = JSON.parse(localStorage.getItem("checkoutData")) || {};

        checkoutData = savedCheckout;
        cart = Array.isArray(savedCheckout.cart) ? savedCheckout.cart : [];

        if (!checkoutData.customer) {
            // Defensive fallback in case older checkoutData shape sneaks in
            checkoutData.customer = {
                name: savedCheckout.name || "",
                phone: savedCheckout.phone || "",
                email: savedCheckout.email || "",
                county: savedCheckout.county || "",
                town: savedCheckout.town || ""
            };
        }

    } catch (error) {
        console.error("Payment loadData error:", error);
        cart = [];
        checkoutData = {};
    }

}

// ==========================================================
// RENDER CUSTOMER
// ==========================================================

function renderCustomer() {

    const customer = checkoutData.customer || {};

    document.getElementById("customerNameDisplay").textContent = customer.name || "-";
    document.getElementById("customerPhoneDisplay").textContent = customer.phone || "-";
    document.getElementById("customerCountyDisplay").textContent = customer.county || "-";
    document.getElementById("customerTownDisplay").textContent = customer.town || "-";

    document.getElementById("paymentPhone").value =
        customer.phone || "";

}

// ==========================================================
// RENDER ORDER
// ==========================================================

function renderOrder() {

    const container = document.getElementById("paymentItems");

    if (!container) return;

    container.innerHTML = "";

    subtotal = 0;
    let itemCount = 0;

    cart.forEach(item => {

        const unitPrice = Number(item.price || 0);
        const quantity = Number(item.quantity || 1);

        subtotal += unitPrice * quantity;
        itemCount += quantity;

        container.innerHTML += `
        <div class="paymentItem">
            <img src="${item.image || ''}" alt="${item.name || 'Product'}" class="paymentImage">
            <div class="paymentInfo">
                <h4>${item.name || 'Product'}</h4>
                <p>KES ${formatKES(unitPrice)}</p>
                <span>Qty : ${quantity}</span>
            </div>
        </div>
        `;

    });

    deliveryFee = Number(checkoutData.deliveryFee || 0);
    total = subtotal + deliveryFee;

    document.getElementById("paymentItemsCount").textContent = itemCount;
    document.getElementById("paymentSubtotal").textContent = formatKES(subtotal);
    document.getElementById("deliveryFee").textContent = formatKES(deliveryFee);
    document.getElementById("paymentTotal").textContent = formatKES(total);

}
// ==========================================================
// PAYMENT.JS
// PART 2 — ORDER CREATION (happens BEFORE payment, not after)
// ==========================================================

// Creating the order first means the tracking ID is real and unique
// (checked against Supabase) before Daraja is ever contacted, and the
// order exists in "Pending Payment" state even if the user abandons
// the STK prompt.

async function createPendingOrder() {

    if (isCreatingOrder || currentOrderId) return;

    if (cart.length === 0) {
        showStatus("Your cart is empty.");
        window.location.href = "cart.html";
        return;
    }

    isCreatingOrder = true;

    try {

        const response = await fetch(`${API_URL}/orders/create`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                customer: checkoutData.customer,
                cart,
                subtotal,
                deliveryFee,
                total
            })
        });

        const result = await response.json();

        if (!response.ok || !result.order) {
            throw new Error(result.message || "Could not start your order. Please try again.");
        }

        currentOrderId = result.order.id;
        currentTrackingId = result.order.trackingId;

        const refDisplay = document.getElementById("orderRefDisplay");
        if (refDisplay) refDisplay.textContent = currentTrackingId;

        document.getElementById("payButton").disabled = false;

    } catch (error) {
        console.error("Order creation error:", error);
        showStatus(error.message || "Could not start your order. Refresh and try again.");
    } finally {
        isCreatingOrder = false;
    }

}

// ==========================================================
// SHOW STATUS / LOADER
// ==========================================================

function showStatus(message, success = false) {

    const status = document.getElementById("paymentStatus");

    if (!status) return;

    status.textContent = message;
    status.className = success ? "paymentStatus success" : "paymentStatus error";

}

function toggleLoader(show, label) {

    const loader = document.getElementById("paymentLoader");
    const loaderText = loader ? loader.querySelector("span") : null;
    const button = document.getElementById("payButton");

    if (!loader || !button) return;

    loader.style.display = show ? "flex" : "none";
    button.disabled = show;

    if (loaderText && label) loaderText.textContent = label;

}

function validPhone(phone) {
    phone = phone.replace(/\s+/g, "");
    return /^(07|01)\d{8}$/.test(phone);
}

// ==========================================================
// STK PUSH
// ==========================================================

async function payNow() {

    if (isPaying) return; // double-click protection

    if (!currentOrderId) {
        showStatus("Your order isn't ready yet — give it a second and try again.");
        return;
    }

    const phone = document.getElementById("paymentPhone").value.trim();

    if (!validPhone(phone)) {
        showStatus("Enter a valid Safaricom phone number.");
        return;
    }

    isPaying = true;
    showStatus("");
    toggleLoader(true, "Sending payment request to your phone...");

    try {

        const response = await fetch(`${API_URL}/payments/stkpush`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                orderId: currentOrderId,
                phone,
                amount: total
            })
        });

        const result = await response.json();

        if (!response.ok || !result.checkoutRequestId) {
            throw new Error(result.message || "Could not start the M-Pesa payment.");
        }

        checkoutRequestId = result.checkoutRequestId;

        showStatus(result.customerMessage || "Enter your M-Pesa PIN on your phone to complete payment.", true);
        toggleLoader(true, "Waiting for M-Pesa confirmation...");

        pollAttempts = 0;
        pollPaymentStatus();

    } catch (error) {
        console.error(error);
        showStatus(error.message);
        toggleLoader(false);
        isPaying = false;
    }

}

// ==========================================================
// POLL FOR PAYMENT RESULT
// ==========================================================

function pollPaymentStatus() {

    clearTimeout(pollTimer);

    pollTimer = setTimeout(async () => {

        pollAttempts++;

        try {

            const response = await fetch(
                `${API_URL}/payments/status/${checkoutRequestId}`
            );

            const result = await response.json();

            if (result.status === "completed") {

                toggleLoader(false);
                showStatus("Payment confirmed! Redirecting...", true);
                finishOrder(result);
                return;

            }

            if (result.status === "failed" || result.status === "cancelled") {

                toggleLoader(false);
                isPaying = false;
                showStatus(
                    result.message ||
                    "Payment was not completed. You can try again."
                );
                return;

            }

            // still pending
            if (pollAttempts >= MAX_POLL_ATTEMPTS) {

                toggleLoader(false);
                isPaying = false;
                showStatus(
                    "This is taking longer than expected. If you completed the M-Pesa prompt, " +
                    "your order will still confirm automatically and a receipt will be emailed to you. " +
                    "You can also check its status on the Track Order page."
                );
                return;

            }

            pollPaymentStatus();

        } catch (error) {
            console.error("Status poll error:", error);
            // network hiccup — keep trying up to the cap rather than failing immediately
            if (pollAttempts >= MAX_POLL_ATTEMPTS) {
                toggleLoader(false);
                isPaying = false;
                showStatus("Couldn't confirm payment status. Check the Track Order page shortly.");
                return;
            }
            pollPaymentStatus();
        }

    }, POLL_INTERVAL_MS);

}

// ==========================================================
// FINISH — payment confirmed, hand off to receipt page
// ==========================================================

function finishOrder(statusResult) {

    const orderRecord = {
        orderNumber: currentTrackingId,
        trackingId: currentTrackingId,
        mpesaReceipt: statusResult.mpesaReceipt || "Pending",
        customer: checkoutData.customer,
        cart,
        subtotal,
        deliveryFee,
        total,
        status: "Paid",
        shipmentStatus: "In Store",
        createdAt: new Date().toISOString()
    };

    localStorage.setItem("lastOrder", JSON.stringify(orderRecord));
    localStorage.removeItem(STORAGE.cart);
    localStorage.removeItem("checkoutData");

    window.location.href = `receipt.html?tracking=${encodeURIComponent(currentTrackingId)}`;

}

// ==========================================================
// INITIALIZE
// ==========================================================

function initPaymentPage() {

    loadData();
    renderCustomer();
    renderOrder();

    const payButton = document.getElementById("payButton");

    if (payButton) {
        payButton.disabled = true; // enabled once the order exists
        payButton.addEventListener("click", payNow);
    }

    createPendingOrder();

}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPaymentPage);
} else {
    initPaymentPage();
}