// ==========================================================
// INDEX.JS
// ==========================================================

let products = [];
let filteredProducts = [];

// Safely handle missing local images gracefully
window.imageFallback = function(imgElement) {
    imgElement.onerror = null; // Prevents infinite loops if fallback is missing
    imgElement.src = "assets/images/no-image.png"; 
};

async function loadProducts(){
    try {
        showLoader("loadingScreen");
        products = await getProducts();
        filteredProducts = [...products];
        renderProducts();
        hideLoader("loadingScreen");
    }
    catch(error){
        hideLoader("loadingScreen");
        showError(error.message);
    }
}

function renderProducts(){
    const grid = document.getElementById("products");
    if(!grid) return;

    grid.innerHTML = "";

    if(filteredProducts.length === 0){
        grid.innerHTML = `<div class="noProducts"><h2>No products found</h2></div>`;
        return;
    }

    filteredProducts.forEach(product => {
        // Generate our path using the config helper
        const finalImageUrl = getProductImage(product.image);

        grid.innerHTML += `
            <div class="productCard">
                <img src="${finalImageUrl}" alt="${product.name}" class="productImage" onerror="imageFallback(this)">
                <div class="productBody">
                    <h3>${product.name}</h3>
                    <p>${product.description || ""}</p>
                    <div class="price">KES ${formatKES(product.price)}</div>
                    <button onclick="addProductToCart('${product.id}')" class="primaryBtn">Add To Cart</button>
                </div>
            </div>
        `;
    });
}

function addProductToCart(id){
    const product = products.find(p => p.id === id);
    if(!product) return;
    addToCart(product);
    showSuccess(`${product.name} added to cart.`);
    updateCartBadge();
}

function searchProducts(){
    const input = document.getElementById("searchInput");
    if(!input) return;

    const search = input.value.toLowerCase().trim();

    filteredProducts = products.filter(product => {
        return (
            product.name.toLowerCase().includes(search) ||
            (product.description || "").toLowerCase().includes(search) ||
            (product.category || "").toLowerCase().includes(search)
        );
    });

    renderProducts();
}

function filterCategory(category){
    if(category === "All"){
        filteredProducts = [...products];
    }
    else {
        filteredProducts = products.filter(product => product.category === category);
    }
    renderProducts();
}

function refreshCartBadge(){
    loadCart();
    updateCartBadge();
}

function setupCategoryButtons(){
    const buttons = document.querySelectorAll(".category");
    buttons.forEach(button => {
        button.addEventListener("click", () => {
            buttons.forEach(b => b.classList.remove("active"));
            button.classList.add("active");
            filterCategory(button.dataset.category);
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    loadProducts();
    refreshCartBadge();
    setupCategoryButtons();

    const search = document.getElementById("searchInput");
    if(search){
        search.addEventListener("input", searchProducts);
    }
});