// ==========================================================
// API.JS
// Tech Solutions 
// ==========================================================

// Helper function to normalize Supabase row objects consistently
function _normalizeProduct(product) {
    if (!product) return null;
    return {
        id: String(product.id || product.ID || product.Id),
        name: product.name || product.Name || "",
        price: Number(product.price || product.Price || 0),
        description: product.description || product.Description || "",
        category: product.category || product.Category || "All",
        // Returns raw string filename (e.g., 'iPhone14Pro.jpeg') so index.js can process it
        image: product.image || product.Image || "" 
    };
}

// Base Fetch Wrapper
async function apiRequest(endpoint, method = "GET", data = null){
    const options = {
        method,
        headers: { "Content-Type": "application/json" }
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Server Error");
    }

    return result;
}

// ==========================================================
// SUPABASE PRODUCTS ENDPOINTS
// ==========================================================
async function getProducts(){
    const { data, error } = await _supabase
        .from("Products") 
        .select("*")
        .order("name", { ascending: true });

    if (error) throw error;

    return data.map(_normalizeProduct);
}

async function getProduct(id){
    const { data, error } = await _supabase
        .from("Products")
        .select("*")
        .eq("id", id)
        .single();

    if (error) throw error;

    return _normalizeProduct(data);
}

async function searchProductsRemote(search){
    const { data, error } = await _supabase
        .from("Products")
        .select("*")
        .ilike("name", `%${search}%`);

    if (error) throw error;

    return data.map(_normalizeProduct);
}

async function getProductsByCategory(category){
    const { data, error } = await _supabase
        .from("Products")
        .select("*")
        .eq("category", category)
        .order("name", { ascending: true });

    if (error) throw error;

    return data.map(_normalizeProduct);
}

// ==========================================================
// ORDERS & CHECKOUT ENDPOINTS
// ==========================================================
async function createOrder(order){
    return await apiRequest("/orders", "POST", order);
}

async function getOrder(trackingNumber){
    return await apiRequest(`/orders/${trackingNumber}`);
}

async function updateOrder(trackingNumber, data){
    return await apiRequest(`/orders/${trackingNumber}`, "PUT", data);
}

async function verifyReceipt(receiptCode, phone){
    return await apiRequest("/payments/verify", "POST", { receipt: receiptCode, phone });
}

async function submitReceiptApi(data){
    return await apiRequest("/receipt", "POST", data);
}

async function trackOrder(trackingNumber){
    return await apiRequest(`/orders/${trackingNumber}`);
}

async function getDeliveryStatus(trackingNumber){
    return await apiRequest(`/delivery/${trackingNumber}`);
}

async function pingServer(){
    try {
        await apiRequest("/ping");
        return true;
    }
    catch {
        return false;
    }
}

// ==========================================================
// UTIL CALCULATIONS
// ==========================================================
function calculateCartTotal(cart){
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function calculateCartItems(cart){
    return cart.reduce((total, item) => total + item.quantity, 0);
}

console.log("✅ API Loaded");