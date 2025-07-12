const API_BASE_URL = "https://glossier-backend-production.up.railway.app";

async function getProductsByCategory(category) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/products/${category}`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const products = await response.json();
        console.log(`Fetched products for category ${category}:`, products);
        return products;
    } catch (error) {
        console.error(`Error fetching products for category ${category}:`, error);
        const container = document.getElementById('product-grid');
        if (container) {
            container.innerHTML = '<p class="text-[#5C4033] text-center">Failed to load products. Please try again later.</p>';
        }
        return [];
    }
}

async function getAllProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/products`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        console.log('Fetched all products:', data);
        return data;
    } catch (error) {
        console.error('Error fetching all products:', error);
        const container = document.getElementById('product-list');
        if (container) {
            container.innerHTML = '<p class="text-[#5C4033] text-center">Failed to load products. Please try again later.</p>';
        }
        return [];
    }
}

function sortProducts(products, sortOption) {
    const sortedProducts = [...products]; // Create a copy to avoid mutating the original array
    switch (sortOption) {
        case 'price-asc':
            return sortedProducts.sort((a, b) => a.price - b.price);
        case 'price-desc':
            return sortedProducts.sort((a, b) => b.price - a.price);
        case 'name-asc':
            return sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
        case 'default':
        default:
            return sortedProducts; // Return unsorted (original order)
    }
}

async function renderProductGrid(category, containerId, products = null, sortOption = 'default') {
    const finalProducts = products || (await getProductsByCategory(category));
    const sortedProducts = sortProducts(finalProducts, sortOption);
    const container = document.getElementById(containerId);
    const productCount = document.getElementById('product-count');

    if (!container) {
        console.error(`Container ${containerId} not found`);
        return;
    }

    if (productCount) {
        productCount.textContent = `${sortedProducts.length} products`;
    }

    container.innerHTML = sortedProducts.length === 0
        ? '<p class="text-[#5C4033] text-center">No products found in this category.</p>'
        : sortedProducts.map(product => `
            <div class="product-card bg-white rounded-lg p-4 shadow-sm transition transform hover:scale-[1.02]">
                <img src="${product.image}" alt="${product.name}" class="w-full max-h-48 object-contain mb-4">
                <h3 class="text-[#5C4033] font-bold mb-2">${product.name}</h3>
                <p class="text-[#5C4033] mb-2">${product.description}</p>
                <div class="flex justify-between items-center">
                    <span class="text-[#5C4033]">KES ${product.price}</span>
                    <a href="/product-detail.html?id=${product.id}" class="bg-[#5C4033] text-white px-3 py-1 rounded-full text-sm hover:bg-opacity-90">View</a>
                </div>
            </div>
        `).join('');
}

async function renderProductList(containerId) {
    const products = await getAllProducts();
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container ${containerId} not found`);
        return;
    }
    container.innerHTML = products.length === 0
        ? '<p class="text-[#5C4033] text-center">No products found.</p>'
        : products.map(product => `
            <div class="product-card bg-white rounded-lg p-4 shadow-sm transition transform hover:scale-[1.02]">
                <img src="${product.image}" alt="${product.name}" class="w-full h-48 object-contain mb-4">
                <h3 class="text-[#5C4033] font-bold mb-2">${product.name}</h3>
                <p class="text-[#5C4033] mb-2">${product.description}</p>
                <div class="flex justify-between items-center">
                    <span class="text-[#5C4033]">KES ${product.price}</span>
                    <a href="/product-detail.html?id=${product.id}" class="bg-[#5C4033] text-white px-3 py-1 rounded-full text-sm hover:bg-opacity-90">View</a>
                </div>
            </div>
        `).join('');
}

// Initialize based on page
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    const category = path.split('/').pop().replace('.html', '');
    const validCategories = ['skincare', 'makeup', 'wigs', 'handbags', 'perfumes', 'lingeries'];

    if (validCategories.includes(category)) {
        console.log(`Rendering category page for: ${category}`);
        // Fetch products and store them for sorting
        let currentProducts = [];
        getProductsByCategory(category).then(products => {
            currentProducts = products;
            renderProductGrid(category, 'product-grid', currentProducts, 'default');
        });

        // Add event listener for sort dropdown
        const sortSelect = document.getElementById('sort');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                const sortOption = e.target.value;
                console.log(`Sorting products by: ${sortOption}`);
                renderProductGrid(category, 'product-grid', currentProducts, sortOption);
            });
        } else {
            console.error('Sort dropdown (#sort) not found');
        }
    } else if (category === 'products') {
        console.log('Rendering all products');
        renderProductList('product-list');
    }
});