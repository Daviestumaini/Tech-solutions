// ==========================================================
// CHECKOUT.JS
// ==========================================================

let checkoutItems = JSON.parse(

localStorage.getItem("checkout")

) || [];

// ==========================================================
// TOTAL
// ==========================================================

function calculateTotal(){

return checkoutItems.reduce(

(total,item)=>

total+

(item.price*item.quantity),

0

);

}

// ==========================================================
// RENDER ITEMS
// ==========================================================

function renderCheckoutItems(){

const container =

document.getElementById(

"checkoutItems"

);

const total =

document.getElementById(

"checkoutTotal"

);

if(!container) return;

container.innerHTML="";

checkoutItems.forEach(item=>{

container.innerHTML+=`

<div class="checkoutItem">

<img

src="${item.image}"

alt="${item.name}">

<div class="checkoutItemInfo">

<div class="checkoutItemName">

${item.name}

</div>

<div>

Qty:

${item.quantity}

</div>

<div class="checkoutItemPrice">

KES

${formatKES(item.price)}

</div>

</div>

</div>

`;

});

if(total){

total.textContent=

formatKES(

calculateTotal()

);

}

}

// ==========================================================
// GET FORM
// ==========================================================

function getCheckoutData(){

return{

customer_name:

document

.getElementById("customerName")

.value

.trim(),

phone:

document

.getElementById("phone")

.value

.trim(),

county:

document

.getElementById("county")

.value

.trim(),

town:

document

.getElementById("town")

.value

.trim(),

landmark:

document

.getElementById("landmark")

.value

.trim(),

items:

checkoutItems,

total:

calculateTotal()

};

}

// ==========================================================
// VALIDATION
// ==========================================================

function validateCheckout(data){

if(

!data.customer_name||

!data.phone||

!data.county||

!data.town||

!data.landmark

){

showError(

"Please fill in all fields."

);

return false;

}

return true;

}
// ==========================================================
// CONTINUE TO PAYMENT
// ==========================================================

async function continuePayment(){

const data =

getCheckoutData();

if(

!validateCheckout(data)

){

return;

}

try{

showLoader(

"checkoutLoader"

);

// Create order

const order =

await createOrder(

data

);

// Save order

localStorage.setItem(

"currentOrder",

JSON.stringify(order)

);

// Save tracking number

localStorage.setItem(

"trackingNumber",

order.tracking_number

);

// Save payment amount

localStorage.setItem(

"paymentAmount",

data.total

);

hideLoader(

"checkoutLoader"

);

// Go to payment

window.location.href=

"payment.html";

}

catch(error){

hideLoader(

"checkoutLoader"

);

showError(

error.message

);

}

}

// ==========================================================
// RESTORE FORM
// ==========================================================

function restoreCheckout(){

const saved =

JSON.parse(

localStorage.getItem(

"checkoutForm"

)

);

if(!saved) return;

document.getElementById(

"customerName"

).value=

saved.customer_name||"";

document.getElementById(

"phone"

).value=

saved.phone||"";

document.getElementById(

"county"

).value=

saved.county||"";

document.getElementById(

"town"

).value=

saved.town||"";

document.getElementById(

"landmark"

).value=

saved.landmark||"";

}

// ==========================================================
// SAVE FORM
// ==========================================================

function saveCheckoutForm(){

const data =

getCheckoutData();

localStorage.setItem(

"checkoutForm",

JSON.stringify(data)

);

}

// ==========================================================
// PAGE LOAD
// ==========================================================

document.addEventListener(

"DOMContentLoaded",

()=>{

renderCheckoutItems();

restoreCheckout();

const formInputs =

document.querySelectorAll(

"input, textarea, select"

);

formInputs.forEach(input=>{

input.addEventListener(

"input",

saveCheckoutForm

);

});

const paymentBtn =

document.getElementById(

"continuePayment"

);

if(paymentBtn){

paymentBtn.addEventListener(

"click",

continuePayment

);

}

});