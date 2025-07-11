class Cart {
    constructor() {
        this.items = this.loadCart();
        this.updateCartCount();
    }
    
    loadCart() {
        const cart = localStorage.getItem('cart');
        return cart ? JSON.parse(cart) : [];
    }
    
    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
        this.updateCartCount();
    }
    
    addItem(product) {
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
                image: product.image
            });
        }
        
        this.saveCart();
    }
    
    removeItem(id) {
        this.items = this.items.filter(item => item.id !== id);
        this.saveCart();
    }
    
    updateQuantity(id, quantity) {
        const item = this.items.find(item => item.id === id);
        
        if (item) {
            if (quantity <= 0) {
                this.removeItem(id);
            } else {
                item.quantity = quantity;
                this.saveCart();
            }
        }
    }
    
    getTotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
    
    getItemCount() {
        return this.items.reduce((count, item) => count + item.quantity, 0);
    }
    
    updateCartCount() {
        const countElement = document.getElementById('cart-count');
        if (countElement) {
            countElement.textContent = this.getItemCount();
        }
    }
    
renderCart() {
    const cartItemsElement = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');

    if (!cartItemsElement || !cartTotalElement) return;

    if (this.items.length === 0) {
        cartItemsElement.innerHTML = '<p class="text-[#5C4033] text-center">Your cart is empty</p>';
        cartTotalElement.textContent = 'KES 0';
        return;
    }

    cartItemsElement.innerHTML = this.items.map(item => `
        <div class="cart-item flex items-start justify-between gap-4 mb-4 pb-4 border-b border-[#5C4033] border-opacity-20">
            <div class="flex gap-4 items-start flex-1">
                <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-contain rounded flex-shrink-0" style="max-width:64px; max-height:64px;">
                <div class="text-[#5C4033] max-w-[150px]">
                    <h3 class="font-medium text-sm leading-snug truncate">${item.name}</h3>
                    <p class="text-sm">KES ${item.price}</p>
                </div>
            </div>
            <div class="flex items-center gap-3">
                <button class="quantity-btn decrease bg-[#5C4033] bg-opacity-20 text-white w-6 h-6 rounded-full flex items-center justify-center" data-id="${item.id}">-</button>
                <span class="text-[#5C4033]">${item.quantity}</span>
                <button class="quantity-btn increase bg-[#5C4033] bg-opacity-20 text-white w-6 h-6 rounded-full flex items-center justify-center" data-id="${item.id}">+</button>
                <button class="remove-btn text-[#5C4033] hover:text-opacity-70 ml-3 text-xl" data-id="${item.id}">×</button>
            </div>
        </div>
    `).join('');

    cartTotalElement.textContent = `KES ${this.getTotal()}`;
}


checkout() {
    if (this.items.length === 0) {
        alert('Your cart is empty. Please add items before checking out.');
        return;
    }

    const phoneNumber = '+254797661210';
    const message = `Hello! I would like to place an order from Luné Seduire. Here are my cart details:\n\n` +
                   this.items.map(item => `${item.name} - Quantity: ${item.quantity} - Price: KES ${item.price * item.quantity}`).join('\n') +
                   `\n\nTotal: KES ${this.getTotal()}\nPlease confirm my order.`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    try {
        window.open(whatsappURL, '_blank');
    } catch (error) {
        console.error('Failed to open WhatsApp:', error);
        alert('Unable to open WhatsApp. Please try again or contact support.');
    }
}
    
    
}

// Initialize cart
const cart = new Cart();

// Event delegation for cart interactions
document.addEventListener('click', function(e) {
    // Add to cart buttons
    if (e.target.classList.contains('add-to-cart')) {
        const product = {
            id: parseInt(e.target.dataset.id),
            name: e.target.dataset.name,
            price: parseInt(e.target.dataset.price),
            image: e.target.closest('.product-card').querySelector('img').src
        };
        
        cart.addItem(product);
        
        // Show feedback
        const feedback = document.createElement('div');
        feedback.textContent = 'Added to cart!';
        feedback.className = 'fixed bottom-4 right-4 bg-[#5C4033] text-white px-4 py-2 rounded-full animate-fadeOut';
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            feedback.remove();
        }, 2000);
    }
    
    // Quantity buttons in cart
    if (e.target.classList.contains('quantity-btn')) {
        const id = parseInt(e.target.dataset.id);
        const isIncrease = e.target.classList.contains('increase');
        
        const item = cart.items.find(item => item.id === id);
        if (item) {
            const newQuantity = isIncrease ? item.quantity + 1 : item.quantity - 1;
            cart.updateQuantity(id, newQuantity);
            cart.renderCart();
        }
    }
    
    // Remove buttons in cart
    if (e.target.classList.contains('remove-btn') || e.target.closest('.remove-btn')) {
        const btn = e.target.classList.contains('remove-btn') ? e.target : e.target.closest('.remove-btn');
        const id = parseInt(btn.dataset.id);
        cart.removeItem(id);
        cart.renderCart();
    }
    
    // Checkout button
    if (e.target.id === 'checkout-btn') {
        cart.checkout();
    }
});