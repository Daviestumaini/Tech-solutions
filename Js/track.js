// ==========================================================
// TRACK.JS
// ==========================================================

let trackingNumber =

load(STORAGE.trackingNumber);

// ==========================================================
// LOAD TRACKING
// ==========================================================

async function loadTracking(){

const input =

document.getElementById(

"trackingNumber"

);

let code = "";

if(input){

code =

input.value.trim();

}

if(!code){

code = trackingNumber;

}

if(!code){

showError(

"Enter your tracking number."

);

return;

}

try{

showLoader(

"trackingLoader"

);

const order =

await trackOrder(code);

hideLoader(

"trackingLoader"

);

renderTracking(order);

}

catch(error){

hideLoader(

"trackingLoader"

);

showError(

error.message

);

}

}

// ==========================================================
// RENDER TRACKING
// ==========================================================

function renderTracking(order){

document.getElementById(

"trackingResult"

).style.display="block";

document.getElementById(

"orderNumber"

).textContent=

order.tracking_number;

document.getElementById(

"orderStatus"

).textContent=

order.status;

document.getElementById(

"orderDate"

).textContent=

formatDate(

order.created_at

);

document.getElementById(

"deliveryLocation"

).textContent=

order.town;

renderTimeline(

order.status

);

renderOrderedItems(

order.items

);

}

// ==========================================================
// RENDER ITEMS
// ==========================================================

function renderOrderedItems(items){

const container =

document.getElementById(

"orderedItems"

);

if(!container) return;

container.innerHTML="";

items.forEach(item=>{

container.innerHTML+=`

<div class="orderedItem">

<img

src="${item.image}"

alt="${item.name}">

<div class="orderedItemInfo">

<div class="orderedItemName">

${item.name}

</div>

<div>

Qty: ${item.quantity}

</div>

<div class="orderedItemPrice">

KES ${formatKES(item.price)}

</div>

</div>

</div>

`;

});

}
// ==========================================================
// TIMELINE
// ==========================================================

function renderTimeline(status){

const ordered =

document.getElementById(

"stepOrdered"

);

const paid =

document.getElementById(

"stepPaid"

);

const transit =

document.getElementById(

"stepTransit"

);

const delivered =

document.getElementById(

"stepDelivered"

);

[

ordered,

paid,

transit,

delivered

].forEach(step=>{

if(step){

step.classList.remove(

"active",

"completed"

);

}

});

if(ordered){

ordered.classList.add(

"completed"

);

}

if(status==="Paid"){

paid.classList.add(

"completed"

);

}

if(status==="In Transit"){

paid.classList.add(

"completed"

);

transit.classList.add(

"active"

);

}

if(status==="Delivered"){

paid.classList.add(

"completed"

);

transit.classList.add(

"completed"

);

delivered.classList.add(

"completed"

);

}

}

// ==========================================================
// REFRESH
// ==========================================================

async function refreshTracking(){

await loadTracking();

}

// ==========================================================
// SEARCH BUTTON
// ==========================================================

function searchTracking(){

loadTracking();

}

// ==========================================================
// AUTO REFRESH
// ==========================================================

let refreshInterval = null;

function startAutoRefresh(){

if(refreshInterval){

clearInterval(refreshInterval);

}

refreshInterval = setInterval(

refreshTracking,

30000

);

}

// ==========================================================
// PAGE INIT
// ==========================================================

document.addEventListener(

"DOMContentLoaded",

()=>{

const searchBtn =

document.getElementById(

"trackBtn"

);

if(searchBtn){

searchBtn.addEventListener(

"click",

searchTracking

);

}

const input =

document.getElementById(

"trackingNumber"

);

if(input){

input.addEventListener(

"keypress",

function(e){

if(e.key==="Enter"){

searchTracking();

}

}

);

if(trackingNumber){

input.value =

trackingNumber;

loadTracking();

startAutoRefresh();

}

}

});