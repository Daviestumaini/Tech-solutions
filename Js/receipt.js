// ==========================================================
// RECEIPT.JS
// ==========================================================

let currentOrder =

load(STORAGE.currentOrder);

// ==========================================================
// LOAD ORDER DETAILS
// ==========================================================

function loadReceiptPage(){

if(!currentOrder){

window.location.href =

"cart.html";

return;

}

const amount =

document.getElementById(

"receiptAmount"

);

const account =

document.getElementById(

"receiptAccount"

);

if(amount){

amount.textContent =

formatKES(

currentOrder.total

);

}

if(account){

account.textContent =

currentOrder.tracking_number;

}

}

// ==========================================================
// GET FORM DATA
// ==========================================================

function getReceiptData(){

return{

tracking_number:

currentOrder.tracking_number,

receipt:

document

.getElementById(

"receiptCode"

)

.value

.trim()

.toUpperCase(),

phone:

document

.getElementById(

"receiptPhone"

)

.value

.trim()

};

}

// ==========================================================
// VALIDATE
// ==========================================================

function validateReceipt(data){

if(

!data.receipt ||

!data.phone

){

showError(

"Please fill in all fields."

);

return false;

}

return true;

}
// ==========================================================
// SUBMIT RECEIPT
// ==========================================================

async function submitReceipt(){

const data =

getReceiptData();

if(

!validateReceipt(data)

){

return;

}

try{

showLoader(

"receiptLoader"

);

// Verify receipt with backend

const result =

await submitReceipt(

data

);

hideLoader(

"receiptLoader"

);

// Save latest order

save(

STORAGE.currentOrder,

result.order

);

// Save tracking number

save(

STORAGE.trackingNumber,

result.order.tracking_number

);

// Show success

const success =

document.getElementById(

"receiptSuccess"

);

if(success){

success.style.display="block";

}

const form =

document.querySelector(

".receiptContainer"

);

if(form){

form.style.display="none";

}

}
catch(error){

hideLoader(

"receiptLoader"

);

showError(

error.message

);

}

}

// ==========================================================
// TRACK BUTTON
// ==========================================================

function goToTracking(){

window.location.href=

"track.html";

}

// ==========================================================
// PAGE INIT
// ==========================================================

document.addEventListener(

"DOMContentLoaded",

()=>{

loadReceiptPage();

const submitBtn =

document.getElementById(

"submitReceiptBtn"

);

if(submitBtn){

submitBtn.addEventListener(

"click",

submitReceipt

);

}

const trackBtn =

document.getElementById(

"trackOrderBtn"

);

if(trackBtn){

trackBtn.addEventListener(

"click",

goToTracking

);

}

});