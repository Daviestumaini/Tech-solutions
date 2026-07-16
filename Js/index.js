// ==========================================================
// INDEX.JS
// PART 1
// ==========================================================

let products = [];
let filteredProducts = [];

// ==========================================================
// IMAGE FALLBACK
// ==========================================================

window.imageFallback = function (img) {

    img.onerror = null;

    img.src = "assets/images/no-image.png";

};

// ==========================================================
// LOAD PRODUCTS
// ==========================================================

async function loadProducts() {

    try {

        showLoader("loadingScreen");

        const response = await getProducts();

        products = Array.isArray(response)
            ? response
            : [];

        filteredProducts = [...products];

        renderProducts();

    }

    catch (error) {

        console.error(error);

        showError(

            error.message ||

            "Unable to load products."

        );

    }

    finally {

        hideLoader("loadingScreen");

    }

}

// ==========================================================
// RENDER PRODUCTS
// ==========================================================

function renderProducts() {

    const grid =

        document.getElementById("products");

    if (!grid) return;

    grid.innerHTML = "";

    if (filteredProducts.length === 0) {

        grid.innerHTML = `

        <div class="noProducts">

            <h2>

                No products found

            </h2>

        </div>

        `;

        return;

    }

    const fragment =

        document.createDocumentFragment();

    filteredProducts.forEach(product => {

        const card =

            document.createElement("div");

        card.className = "productCard";

        card.innerHTML = `

            <img

                src="${getProductImage(product.image)}"

                alt="${product.name}"

                class="productImage"

                onerror="imageFallback(this)"

            >

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

                    class="primaryBtn"

                    data-id="${product.id}"

                >

                    Add To Cart

                </button>

            </div>

        `;

        fragment.appendChild(card);

    });

    grid.appendChild(fragment);

}

// ==========================================================
// ADD PRODUCT TO CART
// ==========================================================

function addProductToCart(id) {

    const product =

        products.find(

            p => p.id === id

        );

    if (!product) return;

    addToCart(product);

    updateCartBadge();

    showSuccess(

        `${product.name} added to cart.`

    );

}

// ==========================================================
// SEARCH
// ==========================================================

function searchProducts() {

    const input =

        document.getElementById("searchInput");

    if (!input) return;

    const query =

        input.value

        .trim()

        .toLowerCase();

    filteredProducts =

        products.filter(product => {

            return (

                product.name

                    .toLowerCase()

                    .includes(query)

                ||

                (product.description || "")

                    .toLowerCase()

                    .includes(query)

                ||

                (product.category || "")

                    .toLowerCase()

                    .includes(query)

            );

        });

    renderProducts();

}
// ==========================================================
// CATEGORY FILTER
// ==========================================================

function filterCategory(category) {

    if (category === "All") {

        filteredProducts = [...products];

    }

    else {

        filteredProducts = products.filter(product =>

            (product.category || "").toLowerCase() ===

            category.toLowerCase()

        );

    }

    renderProducts();

}

// ==========================================================
// CART BADGE
// ==========================================================

function updateCartBadge() {

    const badge =

        document.getElementById("cartCount");

    if (!badge) return;

    loadCart();

    const totalItems =

        getTotalItems();

    badge.textContent = totalItems;

}

// ==========================================================
// CATEGORY BUTTONS
// ==========================================================

function setupCategoryButtons() {

    const buttons =

        document.querySelectorAll(".category");

    buttons.forEach(button => {

        button.addEventListener(

            "click",

            () => {

                buttons.forEach(btn =>

                    btn.classList.remove("active")

                );

                button.classList.add("active");

                filterCategory(

                    button.dataset.category

                );

            }

        );

    });

}

// ==========================================================
// PRODUCT BUTTON EVENTS
// ==========================================================

function setupProductEvents() {

    const grid =

        document.getElementById("products");

    if (!grid) return;

    grid.addEventListener("click", event => {

        const button =

            event.target.closest(".primaryBtn");

        if (!button) return;

        addProductToCart(

            button.dataset.id

        );

    });

}

// ==========================================================
// SEARCH EVENTS
// ==========================================================

function setupSearch() {

    const search =

        document.getElementById(

            "searchInput"

        );

    if (!search) return;

    search.addEventListener(

        "input",

        searchProducts

    );

}

// ==========================================================
// SHOP NOW
// ==========================================================

function setupHeroButton() {

    const shopNow =

        document.getElementById(

            "shopNow"

        );

    if (!shopNow) return;

    shopNow.addEventListener(

        "click",

        () => {

            document

                .getElementById("products")

                .scrollIntoView({

                    behavior: "smooth",

                    block: "start"

                });

        }

    );

}

// ==========================================================
// PAGE INIT
// ==========================================================

document.addEventListener(

    "DOMContentLoaded",

    async () => {

        await loadProducts();

        updateCartBadge();

        setupSearch();

        setupCategoryButtons();

        setupProductEvents();

        setupHeroButton();

    }

);