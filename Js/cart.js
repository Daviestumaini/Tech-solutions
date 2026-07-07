// ==========================================================
// CART
// ==========================================================

let cart = JSON.parse(

localStorage.getItem("cart")

) || [];

// ==========================================================
// SAVE
// ==========================================================

function saveCart(){

localStorage.setItem(

"cart",

JSON.stringify(cart)

);

}

// ==========================================================
// ADD ITEM
// ==========================================================

function addToCart(product){

const existing = cart.find(

item => item.id === product.id

);

if(existing){

existing.quantity++;

}

else{

cart.push({

...product,

quantity:1

});

}

saveCart();

updateCartBadge();

}

// ==========================================================
// REMOVE ITEM
// ==========================================================

function removeFromCart(id){

cart = cart.filter(

item => item.id !== id

);

saveCart();

renderCart();

updateCartBadge();

}

// ==========================================================
// UPDATE QUANTITY
// ==========================================================

function increaseQuantity(id){

const item = cart.find(

p=>p.id===id

);

if(item){

item.quantity++;

}

saveCart();

renderCart();

}

function decreaseQuantity(id){

const item = cart.find(

p=>p.id===id

);

if(!item) return;

item.quantity--;

if(item.quantity<=0){

removeFromCart(id);

return;

}

saveCart();

renderCart();

}

// ==========================================================
// TOTAL
// ==========================================================

function getCartTotal(){

return cart.reduce(

(total,item)=>

total+

(item.price*item.quantity),

0

);

}
// ==========================================================
// RENDER CART
// ==========================================================

function renderCart(){

const cartContainer =

document.getElementById("cartItems");

const emptyCart =

document.getElementById("emptyCart");

const totalElement =

document.getElementById("cartTotal");

if(!cartContainer) return;

cartContainer.innerHTML = "";

if(cart.length===0){

cartContainer.style.display="none";

if(emptyCart){

emptyCart.style.display="flex";

}

if(totalElement){

totalElement.textContent="0";

}

return;

}

if(emptyCart){

emptyCart.style.display="none";

}

cartContainer.style.display="flex";

cart.forEach(item=>{

cartContainer.innerHTML +=

`

<div class="cartItem">

<img src="${item.image}" alt="${item.name}">

<div class="itemInfo">

<div class="itemTitle">

${item.name}

</div>

<div class="itemDescription">

${item.description || ""}

</div>

<div class="itemPrice">

KES ${formatKES(item.price)}

</div>

<div class="quantityBox">

<button

class="quantityBtn"

onclick="decreaseQuantity('${item.id}')">

-

</button>

<div class="quantity">

${item.quantity}

</div>

<button

class="quantityBtn"

onclick="increaseQuantity('${item.id}')">

+

</button>

</div>

<button

class="removeBtn"

onclick="removeFromCart('${item.id}')">

Remove

</button>

</div>

</div>

`;

});

if(totalElement){

totalElement.textContent =

formatKES(getCartTotal());

}

}

// ==========================================================
// CART BADGE
// ==========================================================

function updateCartBadge(){

const badge =

document.getElementById("cartBadge");

if(!badge) return;

const totalItems =

cart.reduce(

(sum,item)=>

sum + item.quantity,

0

);

badge.textContent = totalItems;

badge.style.display =

totalItems > 0

? "flex"

: "none";

}

// ==========================================================
// CHECKOUT
// ==========================================================

function proceedToCheckout(){

if(cart.length===0){

alert(

"Your cart is empty."

);

return;

}

localStorage.setItem(

"checkout",

JSON.stringify(cart)

);

window.location.href =

"checkout.html";

}

// ==========================================================
// PAGE INIT
// ==========================================================

document.addEventListener(

"DOMContentLoaded",

()=>{

renderCart();

updateCartBadge();

const checkoutBtn =

document.getElementById("checkoutBtn");

if(checkoutBtn){

checkoutBtn.addEventListener(

"click",

proceedToCheckout

);

}

}
);