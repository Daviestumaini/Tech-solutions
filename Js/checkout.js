// ==========================================================
// CHECKOUT.JS
// ==========================================================

let checkoutItems = JSON.parse(localStorage.getItem(STORAGE.cart)) || [];

function calculateTotal(){
return checkoutItems.reduce((total,item)=> total + (item.price*item.quantity), 0);
}

function renderCheckoutItems(){
const container = document.getElementById("checkoutItems");
const total = document.getElementById("checkoutTotal");
const count = document.getElementById("checkoutItemsCount");
const subtotal = document.getElementById("checkoutSubtotal");

if(!container) return;

container.innerHTML="";

checkoutItems.forEach(item=>{
container.innerHTML+=`
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

if(total) total.textContent = formatKES(calculateTotal());
if(subtotal) subtotal.textContent = formatKES(calculateTotal());
if(count) count.textContent = checkoutItems.reduce((t,i)=>t+i.quantity,0);
}

function getCheckoutData(){
return{
customer_name: document.getElementById("customerName").value.trim(),
phone: document.getElementById("customerPhone").value.trim(),
county: document.getElementById("county").value.trim(),
town: document.getElementById("town").value.trim(),
landmark: document.getElementById("landmark").value.trim(),
items: checkoutItems,
total: calculateTotal()
};
}

function validateCheckout(data){
if(!data.customer_name || !data.phone || !data.county || !data.town || !data.landmark){
showError("Please fill in all fields.");
return false;
}
return true;
}

async function continuePayment(){
const data = getCheckoutData();

if(!validateCheckout(data)) return;

try{
showLoader("checkoutLoader");

const order = await createOrder(data);

localStorage.setItem(STORAGE.currentOrder, JSON.stringify(order));
localStorage.setItem(STORAGE.trackingNumber, order.tracking_number);
localStorage.setItem(STORAGE.paymentAmount, data.total);

hideLoader("checkoutLoader");

window.location.href="payment.html";

}
catch(error){
hideLoader("checkoutLoader");
showError(error.message);
}
}

function restoreCheckout(){
const saved = JSON.parse(localStorage.getItem(STORAGE.checkoutForm));
if(!saved) return;

document.getElementById("customerName").value = saved.customer_name || "";
document.getElementById("customerPhone").value = saved.phone || "";
document.getElementById("county").value = saved.county || "";
document.getElementById("town").value = saved.town || "";
document.getElementById("landmark").value = saved.landmark || "";
}

function saveCheckoutForm(){
const data = getCheckoutData();
localStorage.setItem(STORAGE.checkoutForm, JSON.stringify(data));
}

document.addEventListener("DOMContentLoaded", ()=>{
renderCheckoutItems();
restoreCheckout();

const formInputs = document.querySelectorAll("input, textarea, select");
formInputs.forEach(input=>{
input.addEventListener("input", saveCheckoutForm);
});

const paymentBtn = document.getElementById("continuePayment");
if(paymentBtn){
paymentBtn.addEventListener("click", continuePayment);
}
});