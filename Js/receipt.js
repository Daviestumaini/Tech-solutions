// ==========================================================
// RECEIPT.JS
// ==========================================================

let order = null;

// ==========================================================
// LOAD ORDER
// ==========================================================

function loadReceipt() {

    const savedOrder = localStorage.getItem("lastOrder") || localStorage.getItem(STORAGE.currentOrder || "gf_current_order") || localStorage.getItem("checkoutData");

    if (!savedOrder) {

        alert("No completed order found.");

        window.location.href = "index.html";

        return;

    }

    order = JSON.parse(savedOrder);

    if (!order.customer && order.customer_name) {
        order.customer = {
            name: order.customer_name,
            phone: order.customer_phone,
            email: order.customer_email,
            county: order.county,
            town: order.town
        };
    }

    if (!order.cart && Array.isArray(order.order)) {
        order.cart = order.order;
    }

    renderReceipt();

}

// ==========================================================
// RENDER RECEIPT
// ==========================================================

function renderReceipt() {

    const customer = order.customer || {};

    document.getElementById("orderNumber").textContent =
        order.orderNumber || order.trackingId || "-";

    document.getElementById("mpesaReceipt").textContent =
        order.mpesaReceipt || "-";

    document.getElementById("customerName").textContent =
        customer.name || "-";

    document.getElementById("customerPhone").textContent =
        customer.phone || "-";

    document.getElementById("customerEmail").textContent =
        customer.email || order.customer?.email || "-";

    document.getElementById("customerCounty").textContent =
        customer.county || "-";

    document.getElementById("customerTown").textContent =
        customer.town || "-";

    document.getElementById("subtotal").textContent =
        formatKES(order.subtotal || 0);

    document.getElementById("delivery").textContent =
        formatKES(order.deliveryFee || order.delivery || 0);

    document.getElementById("total").textContent =
        formatKES(order.total || 0);

    renderItems();

}

// ==========================================================
// ITEMS
// ==========================================================

function renderItems() {

    const container =
        document.getElementById("receiptItems");

    container.innerHTML = "";

    order.cart.forEach(item => {

        container.innerHTML += `

<div class="receiptItem">

<img
src="${item.image}"
alt="${item.name}"
class="receiptImage">

<div class="receiptInfo">

<h4>${item.name}</h4>

<p>

KES ${formatKES(item.price)}

</p>

<span>

Quantity : ${item.quantity}

</span>

</div>

</div>

`;

    });

}

// ==========================================================
// BUTTONS
// ==========================================================

function trackOrder() {

    const trackingId =
        order?.trackingId ||
        order?.orderNumber ||
        "";

    const target = trackingId
        ? `track.html?tracking=${encodeURIComponent(trackingId)}`
        : "track.html";

    window.location.href = target;

}

function continueShopping() {

    window.location.href = "index.html";

}

// ==========================================================
// INIT
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {

    loadReceipt();

    document
        .getElementById("trackOrder")
        .addEventListener(
            "click",
            trackOrder
        );

    document
        .getElementById("continueShopping")
        .addEventListener(
            "click",
            continueShopping
        );

});