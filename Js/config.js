// ==========================================================
// CONFIG.JS - LOCAL ASSETS ROUTING
// Tech Solutions 
// ==========================================================

const API_BASE = "https://tech-solutions-k8ci.onrender.com/api";

const API_URL = API_BASE;

// Supabase Configuration
const SUPABASE_URL = "https://haxftrcqcjovtembjubk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhheGZ0cmNxY2pvdnRlbWJqdWJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwNTc2NzYsImV4cCI6MjA5ODYzMzY3Nn0.rDpiegF-anbolexqvUglfsMXn89rXimupGIFe4t9R8Y";

// Initialize Supabase Client
const _supabase = window.supabase && window.supabase.createClient
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

// Application Constants
const STORAGE = {
    cart: "gf_cart",
    checkout: "gf_checkout",
    checkoutForm: "gf_checkout_form",
    currentOrder: "gf_current_order",
    trackingNumber: "gf_tracking",
    paymentAmount: "gf_payment",
    receiptCode: "gf_receipt"
};

const BUSINESS = {
    name: "Tech Solutions",
    currency: "KES",
    paybill: "247247",
    accountPrefix: "GF"
};

// ==========================================================
// LOCAL STORAGE HELPERS
// ==========================================================
function save(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function load(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}

function remove(key) {
    localStorage.removeItem(key);
}

function clearCheckout() {
    remove(STORAGE.checkout);
    remove(STORAGE.checkoutForm);
    remove(STORAGE.paymentAmount);
    remove(STORAGE.receiptCode);
    remove(STORAGE.currentOrder);
}

// ==========================================================
// FORMATTING HELPERS
// ==========================================================
function formatKES(amount) {
    return Number(amount || 0).toLocaleString(
        "en-KE",
        { minimumFractionDigits: 0, maximumFractionDigits: 0 }
    );
}

function formatCurrency(amount) {
    return `KES ${formatKES(amount)}`;
}

function formatDate(date) {
    return new Date(date).toLocaleDateString(
        "en-KE",
        { year: "numeric", month: "long", day: "numeric" }
    );
}

// ==========================================================
// LOCAL IMAGE RESOLVER (NO BUCKET)
// ==========================================================
function getProductImage(filename) {
    if (!filename) {
        return "assets/images/no-image.png"; 
    }
    
    // If it's already a full link, use it directly
    if (filename.startsWith("http")) {
        return filename;
    }
    
    // Safety Net: Append extension if your database entry is missing it
    let validFilename = filename;
    if (!validFilename.includes(".")) {
        validFilename = `${validFilename}.jpeg`;
    }

    // 🚀 ROUTE TO LOCAL ASSETS FILE PATH
    // Change "assets/images/" to match the exact folder where your images are saved locally
    return `assets/images/${validFilename}`;
}

// ==========================================================
// UI & NOTIFICATION HELPERS
// ==========================================================
function showLoader(id) {
    const loader = document.getElementById(id);
    if (loader) {
        loader.style.display = "flex";
    }
}

function hideLoader(id) {
    const loader = document.getElementById(id);
    if (loader) {
        loader.style.display = "none";
    }
}

function showSuccess(message) {
    alert(message);
}

function showError(message) {
    alert(message);
}

console.log("✅ Config Loaded (Local Assets Strategy)");