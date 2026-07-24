// ==========================================================
// TRACK.JS
// ==========================================================

function getTrackingCodeFromUrl() {

    const params = new URLSearchParams(window.location.search);

    return params.get("tracking")?.trim() || "";

}

function normalizeStatus(status) {

    const value = (status || "").toLowerCase();

    if (value.includes("deliver")) return "Delivered";
    if (value.includes("transit")) return "In Transit";
    if (value.includes("pack")) return "Packaged";

    return "In Store";

}

async function handleTrackOrder(code = getTrackingCodeFromUrl()) {

    const input = document.getElementById("trackingInput");
    const trackingCode = code || (input ? input.value.trim() : "");

    const fallbackOrder = load("lastOrder") || load(STORAGE.currentOrder || "gf_current_order") || load("checkoutData");
    if (!trackingCode && fallbackOrder) {
        const fallbackCode = fallbackOrder.trackingId || fallbackOrder.orderNumber || fallbackOrder.tracking_id || "";
        if (fallbackCode) {
            if (input) input.value = fallbackCode;
            return handleTrackOrder(fallbackCode);
        }
    }

    if (!trackingCode) {
        showError("Enter your tracking number.");
        return;
    }

    try {

        const response = await trackOrder(trackingCode);
        const order = response?.order || response;
        renderTracking(order);

    }
    catch (error) {

        const storedOrder = load("lastOrder");

        if (storedOrder && String(storedOrder.trackingId || storedOrder.orderNumber) === trackingCode) {
            renderTracking(storedOrder);
            return;
        }

        showError(error.message);

    }

}

function renderTracking(order) {

    const result = document.getElementById("trackingResult");
    const deliveryCard = document.getElementById("deliveryCard");

    if (!result || !deliveryCard) return;

    const customer = order.customer || {};

    result.style.display = "block";
    document.getElementById("trackingNumber").textContent = order.tracking_number || order.trackingId || order.orderNumber || "-";
    document.getElementById("customerName").textContent = order.customer_name || customer.name || "-";
    document.getElementById("orderDate").textContent = formatDate(order.created_at || order.createdAt || new Date());
    document.getElementById("paymentStatus").textContent = order.status || order.shipment_status || "In Store";

    deliveryCard.style.display = "block";
    document.getElementById("deliveryCounty").textContent = order.county || customer.county || "-";
    document.getElementById("deliveryTown").textContent = order.town || customer.town || "-";
    document.getElementById("deliveryLandmark").textContent = order.landmark || customer.landmark || "-";
    document.getElementById("estimatedDelivery").textContent = order.estimated_delivery || "2-3 business days";

    renderTimeline(order.status || order.shipment_status || "In Store");
    renderOrderedItems(order.items || order.cart || []);

}

function renderOrderedItems(items) {

    const container = document.getElementById("orderedItems");
    if (!container) return;

    container.innerHTML = "";

    items.forEach(item => {
        container.innerHTML += `
<div class="orderedItem">
<img src="${item.image}" alt="${item.name}" onerror="imageFallback(this)">
<div class="orderedItemInfo">
<div class="orderedItemName">${item.name}</div>
<div>Qty: ${item.quantity}</div>
<div class="orderedItemPrice">KES ${formatKES(item.price)}</div>
</div>
</div>
`;
    });

}

function renderTimeline(status) {

    const normalizedStatus = normalizeStatus(status);
    const steps = ["step1", "step2", "step3", "step4"];
    const order = ["In Store", "Packaged", "In Transit", "Delivered"];
    const currentIndex = Math.max(0, order.indexOf(normalizedStatus));

    steps.forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.remove("active", "completed");
        }
    });

    if (typeof window !== "undefined") {
        if (window.__trackingTimelineTimers) {
            window.__trackingTimelineTimers.forEach(timer => clearTimeout(timer));
        }
        window.__trackingTimelineTimers = [];
    }

    steps.forEach((id, i) => {
        const el = document.getElementById(id);
        if (!el) return;

        const timer = setTimeout(() => {
            if (!el.isConnected) return;
            if (i < currentIndex) {
                el.classList.add("completed");
            }
            if (i === currentIndex) {
                el.classList.add("active");
            }
        }, i * 450);

        if (typeof window !== "undefined") {
            window.__trackingTimelineTimers.push(timer);
        }
    });

}

document.addEventListener("DOMContentLoaded", () => {

    const trackBtn = document.getElementById("trackBtn");
    if (trackBtn) {
        trackBtn.addEventListener("click", () => handleTrackOrder());
    }

    const input = document.getElementById("trackingInput");
    if (input) {
        input.addEventListener("keypress", function (e) {
            if (e.key === "Enter") {
                handleTrackOrder();
            }
        });
    }

    const urlTracking = getTrackingCodeFromUrl();
    if (urlTracking && input) {
        input.value = urlTracking;
        handleTrackOrder(urlTracking);
        return;
    }

    const storageKey = (window.STORAGE && window.STORAGE.trackingNumber) || "gf_tracking";
    const saved = load(storageKey);
    if (saved && input) {
        input.value = saved;
        handleTrackOrder(saved);
    }

    const lastOrder = load("lastOrder") || load(STORAGE.currentOrder || "gf_current_order") || load("checkoutData");
    if (lastOrder && !saved && input) {
        input.value = lastOrder.trackingId || lastOrder.orderNumber || lastOrder.tracking_id || "";
        handleTrackOrder(lastOrder.trackingId || lastOrder.orderNumber || lastOrder.tracking_id || "");
    }

});