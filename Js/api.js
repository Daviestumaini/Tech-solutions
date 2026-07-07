// ==========================================================
// API.JS
// Central API Helper
// ==========================================================

// ------------------------------------
// Generic Request
// ------------------------------------

async function apiRequest(

endpoint,

method = "GET",

data = null

){

const options = {

method,

headers:{

"Content-Type":"application/json"

}

};

if(data){

options.body = JSON.stringify(data);

}

const response = await fetch(

`${API_BASE}${endpoint}`,

options

);

const result = await response.json();

if(!response.ok){

throw new Error(

result.message ||

"Server Error"

);

}

return result;

}

// ==========================================================
// PRODUCTS
// ==========================================================

async function getProducts(){

return await apiRequest(

"/products"

);

}

async function getProduct(

id

){

return await apiRequest(

`/products/${id}`

);

}

// ==========================================================
// ORDERS
// ==========================================================

async function createOrder(

orderData

){

return await apiRequest(

"/orders",

"POST",

orderData

);

}

async function getOrder(

trackingNumber

){

return await apiRequest(

`/orders/${trackingNumber}`

);

}

async function updateOrder(

trackingNumber,

data

){

return await apiRequest(

`/orders/${trackingNumber}`,

"PUT",

data

);

}

// ==========================================================
// PAYMENT
// ==========================================================

async function verifyReceipt(

receipt,

phone

){

return await apiRequest(

"/payments/verify",

"POST",

{

receipt,

phone

}

);

}
// ==========================================================
// TRACK ORDER
// ==========================================================

async function trackOrder(

trackingCode

){

return await apiRequest(

`/track/${trackingCode}`

);

}

// ==========================================================
// RECEIPT
// ==========================================================

async function submitReceipt(

receiptData

){

return await apiRequest(

"/receipt",

"POST",

receiptData

);

}

// ==========================================================
// DELIVERY
// ==========================================================

async function getDeliveryStatus(

trackingCode

){

return await apiRequest(

`/delivery/${trackingCode}`

);

}

// ==========================================================
// SEARCH
// ==========================================================

async function searchProducts(

query

){

return await apiRequest(

`/products/search?q=${encodeURIComponent(query)}`

);

}

// ==========================================================
// CONNECTION CHECK
// ==========================================================

async function pingServer(){

try{

await apiRequest(

"/ping"

);

return true;

}

catch{

return false;

}

}

// ==========================================================
// LOADER
// ==========================================================

function showLoader(

loaderId

){

const loader =

document.getElementById(loaderId);

if(loader){

loader.style.display="flex";

}

}

function hideLoader(

loaderId

){

const loader =

document.getElementById(loaderId);

if(loader){

loader.style.display="none";

}

}

// ==========================================================
// ALERT HELPERS
// ==========================================================

function showSuccess(

message

){

alert(message);

}

function showError(

message

){

alert(message);

}

// ==========================================================
// FORMAT CURRENCY
// ==========================================================

function formatKES(

amount

){

return Number(amount).toLocaleString(

"en-KE",

{

minimumFractionDigits:0

}

);

}

// ==========================================================
// FORMAT DATE
// ==========================================================

function formatDate(

date

){

return new Date(date)

.toLocaleDateString(

"en-KE",

{

year:"numeric",

month:"long",

day:"numeric"

}

);

}