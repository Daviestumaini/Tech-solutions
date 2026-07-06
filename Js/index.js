const supabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

(async()=>{

const {

    data:{
        user
    }

}=await supabase.auth.getUser();

if(user){

await fetch(

`${API_BASE}/auth/google-profile`,

{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

id:user.id,

name:
user.user_metadata.full_name,

email:user.email

})

}

);

localStorage.setItem(

"user_id",

user.id

);

localStorage.setItem(

"name",

user.user_metadata.full_name

);

localStorage.setItem(

"email",

user.email

);

}

})();
const API = `${API_BASE}/products`;

let products = [];
let filteredProducts = [];

let cart =
JSON.parse(localStorage.getItem("cart")) || [];

// ==========================================
// LOAD USER
// ==========================================

const username =
localStorage.getItem("name");

if(username){

document.getElementById("welcomeUser").innerHTML =
`Hi, ${username.split(" ")[0]}`;

}

// ==========================================
// LOAD PRODUCTS
// ==========================================

async function loadProducts(){

try{

document.getElementById("loadingScreen").style.display="flex";

const response =
await fetch(API);

products =
await response.json();

filteredProducts =
products;

renderProducts();

updateCart();

document.getElementById("loadingScreen").style.display="none";

}catch(err){

console.log(err);

document.getElementById("loadingScreen").style.display="none";

alert("Unable to load products.");

}

}

loadProducts();

// ==========================================
// RENDER PRODUCTS
// ==========================================

function renderProducts(){

const container =
document.getElementById("products");

container.innerHTML="";

if(filteredProducts.length===0){

container.innerHTML=`

<div class="emptyProducts">

<h2>No products found.</h2>

</div>

`;

return;

}

filteredProducts.forEach(product=>{

container.innerHTML += `

<div class="productCard">

<img
src="${product.image}"
alt="${product.name}">

<h3>

${product.name}

</h3>

<div class="rating">

⭐ ${product.rating}

</div>

<p class="delivery">

${product.delivery}

</p>

<h2>

KES ${Number(product.price).toLocaleString()}

</h2>

<button
onclick="addToCart('${product.id}')">

Add To Cart

</button>

</div>

`;

});

}

// ==========================================
// SEARCH
// ==========================================

document
.getElementById("searchInput")
.addEventListener("input",e=>{

const value =
e.target.value.toLowerCase();

filteredProducts =
products.filter(product=>

product.name
.toLowerCase()
.includes(value)

);

renderProducts();

});

// ==========================================
// CATEGORIES
// ==========================================

document
.querySelectorAll(".category")
.forEach(button=>{

button.onclick=()=>{

document
.querySelector(".active")
.classList.remove("active");

button.classList.add("active");

const category=
button.dataset.category;

if(category==="All"){

filteredProducts=
products;

}else{

filteredProducts=
products.filter(product=>

product.category===category

);

}

renderProducts();

};

});

// ==========================================
// ADD TO CART
// ==========================================

function addToCart(id){

const product=
products.find(p=>p.id==id);

const existing=
cart.find(item=>item.id==id);

if(existing){

existing.quantity++;

}else{

cart.push({

...product,

quantity:1

});

}

localStorage.setItem(

"cart",

JSON.stringify(cart)

);

updateCart();

showToast();

}
// ==========================================
// UPDATE CART
// ==========================================

function updateCart() {

    localStorage.setItem("cart", JSON.stringify(cart));

    document.getElementById("cartCount").innerHTML = cart.length;

    const cartItems =
        document.getElementById("cartItems");

    cartItems.innerHTML = "";

    let total = 0;

    cart.forEach(item => {

        total += item.price * item.quantity;

        cartItems.innerHTML += `

<div class="cartItem">

<img
src="${item.image}"
alt="${item.name}">

<div class="cartInfo">

<h4>${item.name}</h4>

<p>KES ${Number(item.price).toLocaleString()}</p>

<div class="qtyControls">

<button onclick="decreaseQty('${item.id}')">−</button>

<span>${item.quantity}</span>

<button onclick="increaseQty('${item.id}')">+</button>

</div>

</div>

<button
class="removeBtn"
onclick="removeItem('${item.id}')">

<i class="fa-solid fa-trash"></i>

</button>

</div>

`;

    });

    document.getElementById("totalPrice").innerHTML =
        total.toLocaleString();

}

// ==========================================
// QUANTITY
// ==========================================

function increaseQty(id){

const item=
cart.find(p=>p.id==id);

item.quantity++;

updateCart();

}

function decreaseQty(id){

const item=
cart.find(p=>p.id==id);

item.quantity--;

if(item.quantity<=0){

cart=
cart.filter(p=>p.id!=id);

}

updateCart();

}

function removeItem(id){

cart=
cart.filter(p=>p.id!=id);

updateCart();

}

// ==========================================
// CART DRAWER
// ==========================================

document.getElementById("cartBtn").onclick=()=>{

document
.getElementById("drawer")
.classList.add("open");

};

document.getElementById("mobileCart").onclick=()=>{

document
.getElementById("drawer")
.classList.add("open");

};

document.getElementById("closeCart").onclick=()=>{

document
.getElementById("drawer")
.classList.remove("open");

};

// ==========================================
// CHECKOUT
// ==========================================

document
.getElementById("checkoutBtn")
.onclick=()=>{

if(cart.length===0){

alert("Your cart is empty.");

return;

}

window.location.href=
"checkout.html";

};

// ==========================================
// TOAST
// ==========================================

function showToast(){

const toast=
document.getElementById("toast");

toast.classList.add("show");

setTimeout(()=>{

toast.classList.remove("show");

},2000);

}

// ==========================================
// HERO BUTTON
// ==========================================

document
.getElementById("shopNow")
.onclick=()=>{

document
.getElementById("products")
.scrollIntoView({

behavior:"smooth"

});

};

// ==========================================
// INITIAL CART
// ==========================================

updateCart();
