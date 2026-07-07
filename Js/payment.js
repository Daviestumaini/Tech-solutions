// ==========================================================
// PAYMENT.JS
// ==========================================================

let currentOrder = load(STORAGE.currentOrder);

function loadPaymentPage(){

if(!currentOrder){
window.location.href = "cart.html";
return;
}

document.getElementById("accountNumber").textContent = currentOrder.tracking_number;
document.getElementById("paymentAmount").textContent = formatKES(currentOrder.total);
document.getElementById("paybillNumber").textContent = BUSINESS.paybill;

renderPaymentItems();

}

function renderPaymentItems(){

const container = document.getElementById("paymentItems");
const count = document.getElementById("paymentItemsCount");
const total = document.getElementById("paymentTotal");

if(!container) return;

container.innerHTML = "";

(currentOrder.items || []).forEach(item=>{
container.innerHTML += `
<div class="checkoutItem">
<img src="${item.image}" alt="${item.name}">
<div class="checkoutItemInfo">
<div class="checkoutItemName">${item.name}</div>
<div>Qty: ${item.quantity}</div>
<div class="checkoutItemPrice">KES ${formatKES(item.price)}</div>
</div>
</div>
`;
});

if(count) count.textContent = (currentOrder.items || []).reduce((t,i)=>t+i.quantity,0);
if(total) total.textContent = formatKES(currentOrder.total);

}

async function verifyPayment(){

const code = document.getElementById("receiptCode").value.trim().toUpperCase();

if(!code){
showError("Please enter your M-Pesa confirmation code.");
return;
}

try{

showLoader("paymentLoader");

const result = await apiRequest("/payments/verify", "POST", {
tracking_number: currentOrder.tracking_number,
receipt: code
});

hideLoader("paymentLoader");

save(STORAGE.currentOrder, result.order || currentOrder);
save(STORAGE.trackingNumber, currentOrder.tracking_number);

document.getElementById("paymentSuccess").style.display = "block";
document.querySelector(".paymentContainer").style.display = "none";

}
catch(error){
hideLoader("paymentLoader");
showError(error.message);
}

}

document.addEventListener("DOMContentLoaded", ()=>{

loadPaymentPage();

const verifyBtn = document.getElementById("verifyPaymentBtn");
if(verifyBtn){
verifyBtn.addEventListener("click", verifyPayment);
}

const trackBtn = document.getElementById("trackOrderBtn");
if(trackBtn){
trackBtn.addEventListener("click", ()=>{
window.location.href = "track.html";
});
}

});