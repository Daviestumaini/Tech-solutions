// ==========================================================
// CONFIG.JS
// Gadget Finds
// ==========================================================

// ----------------------------------------------------------
// BACKEND API
// ----------------------------------------------------------

const API_BASE =

location.hostname === "localhost"

? "http://localhost:5000/api"

: "https://tech-solutions-k8ci.onrender.com/api";


// ----------------------------------------------------------
// SUPABASE
// ----------------------------------------------------------

const SUPABASE_URL =

"https://haxftrcqcjovtembjubk.supabase.co";

const SUPABASE_ANON_KEY =

"YOUR_SUPABASE_ANON_KEY";

const supabase =

window.supabase.createClient(

SUPABASE_URL,

SUPABASE_ANON_KEY

);


// ----------------------------------------------------------
// STORAGE KEYS
// ----------------------------------------------------------

const STORAGE = {

cart: "cart",

checkout: "checkout",

checkoutForm: "checkoutForm",

currentOrder: "currentOrder",

trackingNumber: "trackingNumber",

paymentAmount: "paymentAmount"

};


// ----------------------------------------------------------
// BUSINESS DETAILS
// ----------------------------------------------------------

const BUSINESS = {

name: "Gadget Finds",

paybill: "247247",

accountPrefix: "GF",

currency: "KES"

};


// ----------------------------------------------------------
// HELPERS
// ----------------------------------------------------------

function save(key, value){

localStorage.setItem(

key,

JSON.stringify(value)

);

}

function load(key){

const value =

localStorage.getItem(key);

return value

? JSON.parse(value)

: null;

}

function remove(key){

localStorage.removeItem(key);

}

function clearCheckout(){

remove(STORAGE.checkout);

remove(STORAGE.checkoutForm);

remove(STORAGE.currentOrder);

remove(STORAGE.paymentAmount);

}

function formatCurrency(amount){

return Number(amount)

.toLocaleString(

"en-KE",

{

style:"currency",

currency:"KES",

minimumFractionDigits:0

}

);

}

function generateOrderNumber(){

return (

BUSINESS.accountPrefix +

"-" +

Date.now()

);

}