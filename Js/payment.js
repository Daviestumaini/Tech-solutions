// ==========================================================
// PAYMENT.JS
// PART 1
// ==========================================================

let cart = [];
let checkoutData = {};
let subtotal = 0;
let deliveryFee = 0;
let total = 0;

// ==========================================================
// LOAD DATA
// ==========================================================

function loadData() {

    cart = JSON.parse(
        localStorage.getItem(STORAGE.cart)
    ) || [];

    checkoutData = JSON.parse(
        localStorage.getItem("checkoutData")
    ) || {};

}

// ==========================================================
// DELIVERY COST
// ==========================================================

function calculateDelivery(county) {

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

    return fees[county] || 900;

}

// ==========================================================
// RENDER CUSTOMER
// ==========================================================

function renderCustomer() {

    const customer =
        checkoutData.customer || checkoutData;

    document.getElementById(
        "customerNameDisplay"
    ).textContent =
        customer.name || "-";

    document.getElementById(
        "customerPhoneDisplay"
    ).textContent =
        customer.phone || "-";

    document.getElementById(
        "customerCountyDisplay"
    ).textContent =
        customer.county || "-";

    document.getElementById(
        "customerTownDisplay"
    ).textContent =
        customer.town || "-";

    document.getElementById(
        "paymentPhone"
    ).value =
        customer.phone || "";

}

// ==========================================================
// RENDER ORDER
// ==========================================================

function renderOrder() {

    const container =
        document.getElementById(
            "paymentItems"
        );

    if (!container) return;

    container.innerHTML = "";

    subtotal = 0;

    let itemCount = 0;

    cart.forEach(item => {

        subtotal +=
            item.price * item.quantity;

        itemCount +=
            item.quantity;

        container.innerHTML += `

<div class="paymentItem">

<img
src="${item.image}"
alt="${item.name}"
class="paymentImage">

<div class="paymentInfo">

<h4>${item.name}</h4>

<p>

KES ${formatKES(item.price)}

</p>

<span>

Qty : ${item.quantity}

</span>

</div>

</div>

`;

    });

    const savedDeliveryFee = Number(checkoutData.deliveryFee || 0);

    deliveryFee =
        savedDeliveryFee > 0
            ? savedDeliveryFee
            : calculateDelivery(
                checkoutData.county || checkoutData.customer?.county || ""
            );

    total =
        subtotal +
        deliveryFee;

    document.getElementById(
        "paymentItemsCount"
    ).textContent =
        itemCount;

    document.getElementById(
        "paymentSubtotal"
    ).textContent =
        formatKES(subtotal);

    document.getElementById(
        "deliveryFee"
    ).textContent =
        formatKES(deliveryFee);

    document.getElementById(
        "paymentTotal"
    ).textContent =
        formatKES(total);

}
// ==========================================================
// PAYMENT.JS
// PART 2
// ==========================================================

// ==========================================================
// SHOW STATUS
// ==========================================================

function showStatus(message, success = false) {

    const status =
        document.getElementById(
            "paymentStatus"
        );

    if (!status) return;

    status.textContent = message;

    status.className =
        success
            ? "paymentStatus success"
            : "paymentStatus error";

}

// ==========================================================
// LOADER
// ==========================================================

function toggleLoader(show) {

    const loader =
        document.getElementById(
            "paymentLoader"
        );

    const button =
        document.getElementById(
            "payButton"
        );

    if (!loader || !button) return;

    loader.style.display =
        show
            ? "flex"
            : "none";

    button.disabled = show;

}

// ==========================================================
// PHONE VALIDATION
// ==========================================================

function validPhone(phone) {

    phone = phone.replace(/\s+/g, "");

    return /^(07|01)\d{8}$/.test(phone);

}

// ==========================================================
// STK PUSH
// ==========================================================

async function payNow() {

    const phone =
        document
            .getElementById("paymentPhone")
            .value
            .trim();

    if (!validPhone(phone)) {

        showStatus(
            "Enter a valid Safaricom phone number."
        );

        return;

    }

    toggleLoader(true);

    showStatus("");

    try {

        const response =
            await fetch(
                `${API_URL}/payments/stkpush`,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        phone,

                        amount: total,

                        cart,

                        customer: checkoutData

                    })

                }
            );

        const result =
            await response.json();

        if (!response.ok) {

            throw new Error(
                result.message ||
                "Payment failed."
            );

        }

        showStatus(
            "STK Push sent. Check your phone.",
            true
        );

        // ==================================================
        // SAVE ORDER
        // ==================================================

        await saveOrder(result);

    }

    catch (error) {

        console.error(error);

        showStatus(
            error.message
        );

    }

    finally {

        toggleLoader(false);

    }

}

// ==========================================================
// SAVE ORDER
// ==========================================================

async function saveOrder(paymentData) {

    let orderRecord = null;

    try {

        const customer =
            checkoutData.customer || checkoutData;

        const trackingId = `TS-${Date.now()}-${String(customer.phone || "0000").slice(-4)}`;

        const response = await fetch(

            `${API_URL}/orders/create`,

            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body: JSON.stringify({

                    customer,

                    trackingId,

                    cart,

                    subtotal: checkoutData.subtotal || subtotal,

                    deliveryFee: checkoutData.deliveryFee || deliveryFee,

                    total: checkoutData.total || total,

                    payment: paymentData

                })

            }

        );

        const result = await response.json();

        orderRecord = {

            orderNumber:
                result?.order?.tracking_id ||
                result?.order?.orderNumber ||
                trackingId,

            trackingId:
                result?.order?.tracking_id ||
                result?.order?.orderNumber ||
                trackingId,

            mpesaReceipt:
                paymentData?.receipt ||
                paymentData?.transactionId ||
                paymentData?.MerchantRequestID ||
                "Pending",

            customer,

            cart,

            subtotal,

            deliveryFee,

            total,

            status: result?.order?.status || "In Store",

            shipmentStatus: result?.order?.shipment_status || "In Store",

            trackUrl:
                result?.order?.trackUrl ||
                "",

            createdAt: new Date().toISOString()

        };

        localStorage.setItem(
            "lastOrder",
            JSON.stringify(orderRecord)
        );

        localStorage.setItem(
            STORAGE.trackingNumber,
            orderRecord.trackingId
        );

    }

    catch (error) {

        console.error(
            "Order Save Error:",
            error
        );

        orderRecord = {

            orderNumber: `TS-${Date.now()}-${String((checkoutData.customer || checkoutData).phone || "0000").slice(-4)}`,

            trackingId: `TS-${Date.now()}-${String((checkoutData.customer || checkoutData).phone || "0000").slice(-4)}`,

            mpesaReceipt:
                paymentData?.receipt ||
                paymentData?.transactionId ||
                paymentData?.MerchantRequestID ||
                "Pending",

            customer: checkoutData.customer || checkoutData,

            cart,

            subtotal,

            deliveryFee,

            total,

            status: "In Store",

            shipmentStatus: "In Store",

            createdAt: new Date().toISOString()

        };

        localStorage.setItem(
            "lastOrder",
            JSON.stringify(orderRecord)
        );

        localStorage.setItem(
            STORAGE.trackingNumber,
            orderRecord.trackingId
        );

    }

    // ==================================================
    // CLEAR CART
    // ==================================================

    localStorage.removeItem(
        STORAGE.cart
    );

    localStorage.removeItem(
        "checkoutData"
    );

    // ==================================================
    // REDIRECT
    // ==================================================

    window.location.href =
        "receipt.html";

}

// ==========================================================
// INITIALIZE
// ==========================================================

document.addEventListener(

    "DOMContentLoaded",

    () => {

        loadData();

        renderCustomer();

        renderOrder();

        document
            .getElementById(
                "payButton"
            )
            .addEventListener(

                "click",

                payNow

            );

    }

);