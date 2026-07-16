// ==========================================================
// CART.JS
// ==========================================================

let cart = [];

function loadCart() {
try {
const stored = localStorage.getItem(STORAGE.cart);
if (!stored) {
cart = [];
return;
}
const parsed = JSON.parse(stored);
cart = Array.isArray(parsed) ? parsed : [];
}
catch (err) {
console.error("Cart Load Error:", err);
cart = [];
localStorage.removeItem(STORAGE.cart);
}
}

function saveCart() {
localStorage.setItem(STORAGE.cart, JSON.stringify(cart));
}

function updateCartBadge() {
const badge = document.getElementById("cartBadge") || document.getElementById("cartCount");
if (!badge) return;
const total = cart.reduce((sum, item) => sum + item.quantity, 0);
badge.textContent = total;
if (badge.id === "cartBadge") {
badge.style.display = total > 0 ? "flex" : "none";
}
}

function getTotalItems() {
return cart.reduce((sum, item) => sum + item.quantity, 0);
}

function getCartTotal() {
return cart.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
}

function getCartItems() {
return cart;
}

function addToCart(product) {
if (!product) return;
const existing = cart.find(item => item.id === product.id);
if (existing) {
existing.quantity++;
}
else {
cart.push({
id: product.id,
name: product.name,
description: product.description || "",
image: product.image || "",
price: Number(product.price),
quantity: 1
});
}
saveCart();
updateCartBadge();
}

function removeFromCart(id) {
cart = cart.filter(item => item.id !== id);
saveCart();
renderCart();
updateCartBadge();
}

function increaseQuantity(id) {
const item = cart.find(p => p.id === id);
if (!item) return;
item.quantity++;
saveCart();
renderCart();
updateCartBadge();
}

function decreaseQuantity(id) {
const item = cart.find(p => p.id === id);
if (!item) return;
item.quantity--;
if (item.quantity <= 0) {
removeFromCart(id);
return;
}
saveCart();
renderCart();
updateCartBadge();
}

function clearCart() {
cart = [];
saveCart();
renderCart();
updateCartBadge();
}

function imageFallback(img) {
img.onerror = null;
img.src = "assets/images/no-image.png";
}

function renderCart() {
const cartContainer = document.getElementById("cartItems");
const emptyCart = document.getElementById("emptyCart");
const subtotal = document.getElementById("subtotal");
const grandTotal = document.getElementById("grandTotal");
const totalItems = document.getElementById("totalItems");

if (!cartContainer) return;

cartContainer.innerHTML = "";

if (cart.length === 0) {
cartContainer.style.display = "none";
if (emptyCart) emptyCart.style.display = "flex";
if (subtotal) subtotal.textContent = "0";
if (grandTotal) grandTotal.textContent = "0";
if (totalItems) totalItems.textContent = "0";
return;
}

cartContainer.style.display = "grid";
if (emptyCart) emptyCart.style.display = "none";

cart.forEach(item => {
const card = document.createElement("div");
card.className = "cartItem";
card.innerHTML = `
<img src="${item.image}" alt="${item.name}" onerror="imageFallback(this)">
<div class="itemInfo">
<h3>${item.name}</h3>
<p>${item.description || ""}</p>
<div class="itemPrice">KES ${formatKES(item.price)}</div>
<div class="quantityBox">
<button class="quantityBtn" data-action="decrease" data-id="${item.id}">-</button>
<span class="quantity">${item.quantity}</span>
<button class="quantityBtn" data-action="increase" data-id="${item.id}">+</button>
</div>
<button class="removeBtn" data-action="remove" data-id="${item.id}">Remove</button>
</div>
`;
cartContainer.appendChild(card);
});

if (subtotal) subtotal.textContent = formatKES(getCartTotal());
if (grandTotal) grandTotal.textContent = formatKES(getCartTotal());
if (totalItems) totalItems.textContent = getTotalItems();
}

document.addEventListener("click", (e) => {
const button = e.target.closest("[data-action]");
if (!button) return;
const action = button.dataset.action;
const id = button.dataset.id;
switch (action) {
case "increase": increaseQuantity(id); break;
case "decrease": decreaseQuantity(id); break;
case "remove": removeFromCart(id); break;
}
});
function updateCartUI(items) {
  const cartContainer = document.querySelector('.cartContainer');
  const emptyCartSection = document.getElementById('emptyCart');

  if (!items || items.length === 0) {
    // Hide order grid, show empty messaging
    cartContainer.style.display = 'none';
    emptyCartSection.style.display = 'flex';
  } else {
    // Show order grid, hide empty messaging
    cartContainer.style.display = 'grid';
    emptyCartSection.style.display = 'none';
    
    // ... rest of your code rendering items into #cartItems
  }
}
function proceedToCheckout() {
if (cart.length === 0) {
alert("Your cart is empty.");
return;
}
saveCart();
window.location.href = "checkout.html";
}

function continueShopping() {
window.location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", () => {
loadCart();
renderCart();
updateCartBadge();

const checkoutBtn = document.getElementById("checkoutBtn");
if (checkoutBtn) checkoutBtn.addEventListener("click", proceedToCheckout);

const continueBtn = document.getElementById("continueShopping");
if (continueBtn) continueBtn.addEventListener("click", continueShopping);

const shopNowBtn = document.getElementById("shopNowBtn");
if (shopNowBtn) shopNowBtn.addEventListener("click", continueShopping);
});