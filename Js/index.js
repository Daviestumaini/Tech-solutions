// ==========================================================
// INDEX.JS
// ==========================================================

let products = [];

let filteredProducts = [];

// ==========================================================
// LOAD PRODUCTS
// ==========================================================

async function loadProducts(){

try{

showLoader("pageLoader");

products = await getProducts();

filteredProducts = [...products];

renderProducts();

hideLoader("pageLoader");

}

catch(error){

hideLoader("pageLoader");

showError(error.message);

}

}

// ==========================================================
// RENDER PRODUCTS
// ==========================================================

function renderProducts(){

const grid =

document.getElementById(

"productGrid"

);

if(!grid) return;

grid.innerHTML="";

if(filteredProducts.length===0){

grid.innerHTML=`

<div class="noProducts">

<h2>

No products found

</h2>

</div>

`;

return;

}

filteredProducts.forEach(product=>{

grid.innerHTML+=`

<div class="productCard">

<img

src="${product.image}"

alt="${product.name}"

class="productImage">

<div class="productBody">

<h3>

${product.name}

</h3>

<p>

${product.description || ""}

</p>

<div class="price">

KES ${formatKES(product.price)}

</div>

<button

onclick="addProductToCart('${product.id}')"

class="primaryBtn">

Add To Cart

</button>

</div>

</div>

`;

});

}

// ==========================================================
// ADD PRODUCT
// ==========================================================

function addProductToCart(id){

const product =

products.find(

p=>p.id===id

);

if(!product){

return;

}

addToCart(product);

showSuccess(

`${product.name} added to cart.`

);

updateCartBadge();

}
// ==========================================================
// SEARCH
// ==========================================================

function searchProducts(){

const input =

document.getElementById(

"searchInput"

);

if(!input) return;

const search =

input.value

.toLowerCase()

.trim();

filteredProducts =

products.filter(product=>{

return(

product.name

.toLowerCase()

.includes(search)

||

(product.description||"")

.toLowerCase()

.includes(search)

||

(product.category||"")

.toLowerCase()

.includes(search)

);

});

renderProducts();

}

// ==========================================================
// CATEGORY FILTER
// ==========================================================

function filterCategory(category){

if(

category==="All"

){

filteredProducts=[...products];

}

else{

filteredProducts=

products.filter(

product=>

product.category===category

);

}

renderProducts();

}

// ==========================================================
// CART BADGE
// ==========================================================

function refreshCartBadge(){

const badge =

document.getElementById(

"cartBadge"

);

if(!badge) return;

const cart =

load(STORAGE.cart)

|| [];

const totalItems =

cart.reduce(

(total,item)=>

total+

item.quantity,

0

);

badge.textContent=

totalItems;

badge.style.display=

totalItems>0

? "flex"

: "none";

}

// ==========================================================
// CATEGORY BUTTONS
// ==========================================================

function setupCategoryButtons(){

const buttons =

document.querySelectorAll(

".categoryBtn"

);

buttons.forEach(button=>{

button.addEventListener(

"click",

()=>{

buttons.forEach(

b=>b.classList.remove("active")

);

button.classList.add(

"active"

);

filterCategory(

button.dataset.category

);

}

);

});

}

// ==========================================================
// PAGE INIT
// ==========================================================

document.addEventListener(

"DOMContentLoaded",

()=>{

loadProducts();

refreshCartBadge();

setupCategoryButtons();

const search =

document.getElementById(

"searchInput"

);

if(search){

search.addEventListener(

"input",

searchProducts

);

}

});