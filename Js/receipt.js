// ==========================================================
// RECEIPT.JS
// ==========================================================

let currentOrder = load(STORAGE.currentOrder);

function loadReceiptPage(){
if(!currentOrder){
window.location.href = "cart.html";
return;
}

const amount = document.getElementById("receiptAmount");
const account = document.getElementById("receiptAccount");

if(amount) amount.textContent = formatKES(currentOrder.total);
if(account) account.textContent = currentOrder.tracking_number;
}

function getReceiptData(){
return{
tracking_number: currentOrder.tracking_number,
receipt: document.getElementById("receiptCode").value.trim().toUpperCase(),
phone: document.getElementById("receiptPhone").value.trim()
};
}

function validateReceipt(data){
if(!data.receipt || !data.phone){
showError("Please fill in all fields.");
return false;
}
return true;
}

async function handleReceiptSubmit(){
const data = getReceiptData();

if(!validateReceipt(data)) return;

try{
showLoader("receiptLoader");

const result = await submitReceiptApi(data);

hideLoader("receiptLoader");

save(STORAGE.currentOrder, result.order);
save(STORAGE.trackingNumber, result.order.tracking_number);

const success = document.getElementById("receiptSuccess");
if(success) success.style.display="block";

const form = document.querySelector(".receiptContainer");
if(form) form.style.display="none";
}
catch(error){
hideLoader("receiptLoader");
showError(error.message);
}
}

function goToTracking(){
window.location.href = "track.html";
}

document.addEventListener("DOMContentLoaded", ()=>{
loadReceiptPage();

const submitBtn = document.getElementById("submitReceiptBtn");
if(submitBtn){
submitBtn.addEventListener("click", handleReceiptSubmit);
}

const trackBtn = document.getElementById("trackOrderBtn");
if(trackBtn){
trackBtn.addEventListener("click", goToTracking);
}
});