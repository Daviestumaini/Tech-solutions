// ==========================================================
// TRACK.JS
// ==========================================================

async function handleTrackOrder(){

const input = document.getElementById("trackingInput");
const code = input ? input.value.trim() : "";

if(!code){
showError("Enter your tracking number.");
return;
}

try{
const order = await trackOrder(code);
renderTracking(order);
}
catch(error){
showError(error.message);
}

}

function renderTracking(order){

document.getElementById("trackingResult").style.display = "block";
document.getElementById("trackingNumber").textContent = order.tracking_number;
document.getElementById("customerName").textContent = order.customer_name || "-";
document.getElementById("orderDate").textContent = formatDate(order.created_at);
document.getElementById("paymentStatus").textContent = order.status;

document.getElementById("deliveryCard").style.display = "block";
document.getElementById("deliveryCounty").textContent = order.county || "-";
document.getElementById("deliveryTown").textContent = order.town || "-";
document.getElementById("deliveryLandmark").textContent = order.landmark || "-";
document.getElementById("estimatedDelivery").textContent = order.estimated_delivery || "-";

renderTimeline(order.status);
renderOrderedItems(order.items || []);

}

function renderOrderedItems(items){

const container = document.getElementById("orderedItems");
if(!container) return;

container.innerHTML = "";

items.forEach(item=>{
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

function renderTimeline(status){

const steps = ["step1","step2","step3","step4","step5"];
const order = ["Paid","Preparing","In Transit","Out For Delivery","Delivered"];

const currentIndex = order.indexOf(status);

steps.forEach((id, i)=>{
const el = document.getElementById(id);
if(!el) return;
el.classList.remove("active","completed");
if(i < currentIndex) el.classList.add("completed");
if(i === currentIndex) el.classList.add("active");
});

}

document.addEventListener("DOMContentLoaded", ()=>{

const trackBtn = document.getElementById("trackBtn");
if(trackBtn){
trackBtn.addEventListener("click", handleTrackOrder);
}

const input = document.getElementById("trackingInput");
if(input){
input.addEventListener("keypress", function(e){
if(e.key==="Enter"){
handleTrackOrder();
}
});
}

const saved = load(STORAGE.trackingNumber);
if(saved && input){
input.value = saved;
handleTrackOrder();
}

});