import { foodItems } from './data.js';

// --- State Management ---
const state = {
    cart: JSON.parse(localStorage.getItem('tasty_cart')) || [],
    coupon: null
};

// --- Utils ---
export const formatCurrency = (amount) => {
    return `₹${amount.toFixed(0)}`; // Indian Rupee format
};

export const saveCart = () => {
    localStorage.setItem('tasty_cart', JSON.stringify(state.cart));
    updateCartBadge();
    triggerCartBadgeBounce();
    
    // If the cart drawer is open, re-render its contents
    const drawer = document.getElementById('cart-drawer');
    if (drawer && !drawer.classList.contains('hidden')) {
        renderDrawerItems();
    }
    
    window.dispatchEvent(new Event('cartUpdated'));
};

// --- Cart Actions ---
export const addToCart = (product, quantity = 1, addOns = []) => {
    const existingItemIndex = state.cart.findIndex(item => item.id === product.id && JSON.stringify(item.addOns) === JSON.stringify(addOns));

    if (existingItemIndex > -1) {
        state.cart[existingItemIndex].quantity += quantity;
    } else {
        state.cart.push({ ...product, quantity, addOns });
    }

    saveCart();
    showToast(`Added ${product.name} to cart!`, 'success');
    
    // Automatically slide open the drawer to show the item in basket!
    setTimeout(() => {
        openCartDrawer();
    }, 400);
};

export const removeFromCart = (index) => {
    const itemName = state.cart[index].name;
    state.cart.splice(index, 1);
    saveCart();
    showToast(`Removed ${itemName}`, 'info');
};

export const updateQuantity = (index, change) => {
    const item = state.cart[index];
    const newQty = item.quantity + change;

    if (newQty > 0) {
        item.quantity = newQty;
        saveCart();
    } else if (newQty === 0) {
        removeFromCart(index);
    }
};

export const getCartTotal = () => {
    return state.cart.reduce((total, item) => {
        const addOnsTotal = item.addOns ? item.addOns.reduce((sum, addon) => sum + addon.price, 0) : 0;
        return total + ((item.price + addOnsTotal) * item.quantity);
    }, 0);
};

export const getCartCount = () => {
    return state.cart.reduce((total, item) => total + item.quantity, 0);
};

// --- UI Components & Drawer Logic ---

// Toast Notification
export const showToast = (message, type = 'success') => {
    const toastContainer = document.getElementById('toast-container') || createToastContainer();

    const toast = document.createElement('div');
    const colors = type === 'success' ? 'bg-green-600' : (type === 'error' ? 'bg-red-600' : 'bg-blue-600');

    toast.className = `${colors} text-white px-6 py-3 rounded-lg shadow-xl transform transition-all duration-300 translate-y-10 opacity-0 flex items-center gap-3 min-w-[300px] z-50 mb-3`;
    toast.innerHTML = `
        <i class="ri-${type === 'success' ? 'checkbox-circle' : 'information'}-line text-xl"></i>
        <span class="font-medium">${message}</span>
    `;

    toastContainer.appendChild(toast);

    // Animate In
    requestAnimationFrame(() => {
        toast.classList.remove('translate-y-10', 'opacity-0');
    });

    // Remove after 3s
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-10');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

const createToastContainer = () => {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed bottom-5 right-5 z-50 flex flex-col items-end';
    document.body.appendChild(container);
    return container;
};

// Update Navbar Cart Badge
const updateCartBadge = () => {
    const badges = document.querySelectorAll('.cart-count');
    const count = getCartCount();
    badges.forEach(badge => {
        badge.textContent = count;
        badge.classList.toggle('hidden', count === 0);
    });
};

// Bounce Animation on Navbar Cart Icon
const triggerCartBadgeBounce = () => {
    const badges = document.querySelectorAll('.cart-count');
    badges.forEach(badge => {
        const cartBtn = badge.closest('a');
        if (cartBtn) {
            cartBtn.classList.remove('animate-cart-bounce');
            void cartBtn.offsetWidth; // Force reflow
            cartBtn.classList.add('animate-cart-bounce');
        }
    });
};

// --- Slide-over Cart Drawer ---
export const injectCartDrawer = () => {
    if (document.getElementById('cart-drawer')) return;

    const drawerHTML = `
        <div id="cart-drawer" class="fixed inset-0 z-50 pointer-events-none hidden">
            <!-- Backdrop -->
            <div id="drawer-backdrop" class="absolute inset-0 bg-black/50 opacity-0 drawer-backdrop pointer-events-auto cursor-pointer"></div>
            <!-- Content -->
            <div id="drawer-content" class="absolute top-0 right-0 h-full w-full sm:w-[440px] bg-white shadow-2xl flex flex-col translate-x-full drawer-content pointer-events-auto border-l border-gray-100">
                <!-- Header -->
                <div class="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <div class="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-primary">
                            <i class="ri-shopping-basket-fill text-xl"></i>
                        </div>
                        <div>
                            <h3 class="font-heading font-bold text-lg text-gray-900">Your Basket</h3>
                            <p class="text-xs text-gray-400" id="drawer-count-sub">0 items selected</p>
                        </div>
                    </div>
                    <button id="close-drawer-btn" class="w-8 h-8 rounded-full hover:bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors">
                        <i class="ri-close-line text-2xl"></i>
                    </button>
                </div>

                <!-- Items List -->
                <div id="drawer-items-list" class="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                    <!-- Dynamically rendered items -->
                </div>

                <!-- Footer Summary -->
                <div class="p-6 border-t border-gray-100 bg-gray-50/50">
                    <div class="flex justify-between items-center mb-1">
                        <span class="text-gray-500 font-medium">Subtotal</span>
                        <span id="drawer-subtotal" class="font-heading font-bold text-xl text-gray-900">₹0</span>
                    </div>
                    <p class="text-xs text-gray-400 mb-6">Taxes, discounts, and delivery calculated at checkout.</p>
                    
                    <div class="flex gap-3">
                        <a href="cart.html" class="flex-1 text-center border border-gray-200 hover:border-gray-300 text-gray-700 font-bold py-3 rounded-xl transition-all text-sm flex items-center justify-center">
                            View Full Cart
                        </a>
                        <a href="checkout.html" class="flex-1 text-center bg-primary hover:bg-orange-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-orange-100 hover:shadow-orange-200 transition-all text-sm flex items-center justify-center gap-1">
                            Checkout <i class="ri-arrow-right-line"></i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;

    const div = document.createElement('div');
    div.innerHTML = drawerHTML.trim();
    document.body.appendChild(div.firstChild);

    // Event listeners to close
    document.getElementById('close-drawer-btn').addEventListener('click', closeCartDrawer);
    document.getElementById('drawer-backdrop').addEventListener('click', closeCartDrawer);
};

export const openCartDrawer = () => {
    const drawer = document.getElementById('cart-drawer');
    const backdrop = document.getElementById('drawer-backdrop');
    const content = document.getElementById('drawer-content');

    if (!drawer || !backdrop || !content) return;

    // Show drawer structure
    drawer.classList.remove('hidden');
    renderDrawerItems();

    // Trigger animations via microtask/repaint
    requestAnimationFrame(() => {
        backdrop.classList.replace('opacity-0', 'opacity-100');
        content.classList.replace('translate-x-full', 'translate-x-0');
    });
};

export const closeCartDrawer = () => {
    const drawer = document.getElementById('cart-drawer');
    const backdrop = document.getElementById('drawer-backdrop');
    const content = document.getElementById('drawer-content');

    if (!drawer || !backdrop || !content) return;

    backdrop.classList.replace('opacity-100', 'opacity-0');
    content.classList.replace('translate-x-0', 'translate-x-full');

    // Wait for transition animation to complete
    setTimeout(() => {
        if (backdrop.classList.contains('opacity-0')) {
            drawer.classList.add('hidden');
        }
    }, 400);
};

export const renderDrawerItems = () => {
    const listContainer = document.getElementById('drawer-items-list');
    const subtotalEl = document.getElementById('drawer-subtotal');
    const countSubEl = document.getElementById('drawer-count-sub');

    if (!listContainer || !subtotalEl || !countSubEl) return;

    const count = getCartCount();
    countSubEl.textContent = `${count} ${count === 1 ? 'item' : 'items'} selected`;

    if (state.cart.length === 0) {
        listContainer.innerHTML = `
            <div class="h-full flex flex-col items-center justify-center text-center py-12">
                <div class="w-24 h-24 rounded-full bg-orange-50 flex items-center justify-center text-primary text-4xl mb-4 opacity-75">
                    <i class="ri-shopping-basket-line"></i>
                </div>
                <h4 class="font-bold text-gray-800 text-base mb-1">Your basket is empty</h4>
                <p class="text-xs text-gray-400 max-w-[200px]">Add delicious dishes from the menu to start ordering!</p>
                <a href="menu.html" class="mt-4 px-6 py-2 bg-orange-50 hover:bg-orange-100 text-primary font-bold rounded-lg text-xs transition-colors">Browse Menu</a>
            </div>
        `;
        subtotalEl.textContent = formatCurrency(0);
        return;
    }

    listContainer.innerHTML = state.cart.map((item, index) => {
        const addOnsTotal = item.addOns ? item.addOns.reduce((sum, a) => sum + a.price, 0) : 0;
        const itemTotal = (item.price + addOnsTotal) * item.quantity;
        const addOnsText = item.addOns && item.addOns.length ? 
            `<span class="text-[10px] bg-gray-50 border border-gray-100 text-gray-500 px-1.5 py-0.5 rounded">${item.addOns.map(a => a.name).join(', ')}</span>` : '';

        return `
            <div class="flex gap-4 items-center bg-white p-3 rounded-xl border border-gray-100 hover:border-orange-100 hover:shadow-sm transition-all duration-300">
                <div class="w-16 h-16 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                    <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover">
                </div>
                <div class="flex-1 min-w-0">
                    <h4 class="font-bold text-sm text-gray-900 truncate">${item.name}</h4>
                    <p class="text-xs text-primary font-semibold mt-0.5">${formatCurrency(item.price)}</p>
                    <div class="mt-1 flex flex-wrap gap-1">${addOnsText}</div>
                </div>
                <div class="flex flex-col items-end gap-2 flex-shrink-0">
                    <button class="text-gray-400 hover:text-red-500 delete-drawer-item transition-colors" data-index="${index}">
                        <i class="ri-delete-bin-line text-sm"></i>
                    </button>
                    <div class="flex items-center bg-gray-50 rounded-lg border border-gray-150 h-7 text-xs">
                        <button class="w-6 h-full flex items-center justify-center text-gray-600 hover:bg-gray-150 rounded-l-lg qty-drawer-btn" data-action="decrease" data-index="${index}">-</button>
                        <span class="w-6 text-center font-bold">${item.quantity}</span>
                        <button class="w-6 h-full flex items-center justify-center text-gray-600 hover:bg-gray-150 rounded-r-lg qty-drawer-btn" data-action="increase" data-index="${index}">+</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    subtotalEl.textContent = formatCurrency(getCartTotal());

    // Bind event listeners dynamically inside the drawer
    listContainer.querySelectorAll('.qty-drawer-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(btn.dataset.index);
            const action = btn.dataset.action;
            updateQuantity(idx, action === 'increase' ? 1 : -1);
        });
    });

    listContainer.querySelectorAll('.delete-drawer-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(btn.dataset.index);
            removeFromCart(idx);
        });
    });
};

// Setup Interceptors for Navbar Cart Icon to trigger Drawer
const setupCartDrawerInterceptors = () => {
    document.querySelectorAll('a[href="cart.html"]').forEach(btn => {
        const path = window.location.pathname;
        // Don't intercept if we are already on cart.html or checkout.html
        if (!path.includes('cart.html') && !path.includes('checkout.html')) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                openCartDrawer();
            });
        }
    });
};

// --- Autocomplete Global Search ---
export const initGlobalSearchAutocomplete = () => {
    const searchInputs = document.querySelectorAll('.nav-search-input');
    
    searchInputs.forEach(input => {
        const wrapper = input.parentElement;
        if (!wrapper) return;
        
        // Ensure input parent has relative positioning
        wrapper.style.position = 'relative';
        
        // Create dropdown menu element
        const dropdown = document.createElement('div');
        dropdown.className = 'search-dropdown';
        wrapper.appendChild(dropdown);
        
        input.addEventListener('input', (e) => {
            const query = e.target.value.trim().toLowerCase();
            if (!query) {
                dropdown.style.display = 'none';
                return;
            }
            
            // Search items
            const matches = foodItems.filter(item => 
                item.name.toLowerCase().includes(query) || 
                item.category.toLowerCase().includes(query) ||
                item.description.toLowerCase().includes(query)
            ).slice(0, 5); // Max 5 items
            
            if (matches.length === 0) {
                dropdown.innerHTML = `
                    <div class="p-4 text-center text-sm text-gray-400 font-medium">
                        No dishes found for "${e.target.value}" 🔍
                    </div>
                `;
            } else {
                dropdown.innerHTML = matches.map(item => `
                    <div class="search-dropdown-item" data-id="${item.id}">
                        <img src="${item.image}" class="w-10 h-10 object-cover rounded-lg flex-shrink-0">
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-1.5">
                                <span class="w-2 h-2 rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}"></span>
                                <h4 class="font-bold text-sm text-gray-800 truncate">${item.name}</h4>
                            </div>
                            <p class="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mt-0.5">${item.category}</p>
                        </div>
                        <div class="text-right flex-shrink-0">
                            <span class="font-bold text-sm text-primary">${formatCurrency(item.price)}</span>
                            <p class="text-[10px] text-yellow-500 font-bold flex items-center justify-end gap-0.5 mt-0.5">
                                <i class="ri-star-fill"></i> ${item.rating}
                            </p>
                        </div>
                    </div>
                `).join('') + `
                    <div class="p-3 bg-gray-50 border-t border-gray-100 text-center text-xs font-bold text-primary hover:bg-orange-50 cursor-pointer search-view-all">
                        See all results for "${e.target.value}" ➔
                    </div>
                `;
            }
            
            dropdown.style.display = 'block';
            
            // Event delegation on items click
            dropdown.querySelectorAll('.search-dropdown-item').forEach(itemBtn => {
                itemBtn.addEventListener('click', () => {
                    window.location.href = `product.html?id=${itemBtn.dataset.id}`;
                });
            });
            
            // See all results link click
            const viewAllBtn = dropdown.querySelector('.search-view-all');
            if (viewAllBtn) {
                viewAllBtn.addEventListener('click', () => {
                    window.location.href = `menu.html?search=${encodeURIComponent(e.target.value)}`;
                });
            }
        });
        
        // Enter triggers redirect to menu with search pre-filled
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const query = input.value.trim();
                if (query) {
                    window.location.href = `menu.html?search=${encodeURIComponent(query)}`;
                }
            }
        });
        
        // Close on blur / click outside
        document.addEventListener('click', (e) => {
            if (!wrapper.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        });
        
        // Focus opens if value is present
        input.addEventListener('focus', () => {
            if (input.value.trim()) {
                dropdown.style.display = 'block';
            }
        });
    });
};

// --- Location Selector Modal ---
export const initLocationPicker = () => {
    const savedLocation = localStorage.getItem('tasty_location') || 'Manhattan, NY';
    
    const updateLocationDisplays = (loc) => {
        document.querySelectorAll('.nav-location-name').forEach(el => {
            el.textContent = loc;
        });
    };
    
    updateLocationDisplays(savedLocation);
    
    // Inject Location Modal if missing
    if (!document.getElementById('location-modal')) {
        const modalHTML = `
            <div id="location-modal" class="modal-overlay-wrapper hidden">
                <div class="modal-overlay"></div>
                <div class="modal-container p-6">
                    <div class="flex items-center justify-between border-b border-gray-150 pb-4 mb-4">
                        <h3 class="font-heading font-bold text-lg text-gray-900">Select Location</h3>
                        <button id="close-location-btn" class="w-8 h-8 rounded-full hover:bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors">
                            <i class="ri-close-line text-2xl"></i>
                        </button>
                    </div>
                    <p class="text-xs text-gray-400 mb-3 uppercase tracking-wider font-bold">Popular Locations</p>
                    <div class="space-y-2 mb-6">
                        <button class="w-full text-left p-3.5 border border-gray-250 hover:border-primary hover:bg-orange-50/50 rounded-xl font-medium text-sm text-gray-700 transition-all flex items-center gap-2 loc-option-btn" data-loc="Manhattan, NY">
                            <i class="ri-map-pin-2-fill text-primary text-base"></i> Manhattan, New York, NY
                        </button>
                        <button class="w-full text-left p-3.5 border border-gray-250 hover:border-primary hover:bg-orange-50/50 rounded-xl font-medium text-sm text-gray-700 transition-all flex items-center gap-2 loc-option-btn" data-loc="Brooklyn, NY">
                            <i class="ri-map-pin-2-fill text-primary text-base"></i> Brooklyn, New York, NY
                        </button>
                        <button class="w-full text-left p-3.5 border border-gray-250 hover:border-primary hover:bg-orange-50/50 rounded-xl font-medium text-sm text-gray-700 transition-all flex items-center gap-2 loc-option-btn" data-loc="Queens, NY">
                            <i class="ri-map-pin-2-fill text-primary text-base"></i> Queens, New York, NY
                        </button>
                        <button class="w-full text-left p-3.5 border border-gray-250 hover:border-primary hover:bg-orange-50/50 rounded-xl font-medium text-sm text-gray-700 transition-all flex items-center gap-2 loc-option-btn" data-loc="Hoboken, NJ">
                            <i class="ri-map-pin-2-fill text-primary text-base"></i> Hoboken, New Jersey, NJ
                        </button>
                    </div>
                    
                    <div class="flex gap-2">
                        <input type="text" id="custom-location-input" placeholder="Type neighborhood or address..." class="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 text-sm">
                        <button id="save-custom-loc-btn" class="bg-primary hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-md shadow-orange-100">Save</button>
                    </div>
                </div>
            </div>
        `;
        const div = document.createElement('div');
        div.innerHTML = modalHTML.trim();
        document.body.appendChild(div.firstChild);
    }
    
    const modalWrapper = document.getElementById('location-modal');
    const overlay = modalWrapper.querySelector('.modal-overlay');
    const closeBtn = document.getElementById('close-location-btn');
    const customInput = document.getElementById('custom-location-input');
    const customSaveBtn = document.getElementById('save-custom-loc-btn');
    
    const openModal = () => {
        modalWrapper.classList.remove('hidden');
        document.body.classList.add('modal-open');
        requestAnimationFrame(() => {
            modalWrapper.classList.add('show-modal');
        });
    };
    
    const closeModal = () => {
        modalWrapper.classList.remove('show-modal');
        document.body.classList.remove('modal-open');
        setTimeout(() => {
            if (!modalWrapper.classList.contains('show-modal')) {
                modalWrapper.classList.add('hidden');
            }
        }, 250);
    };
    
    // Bind location button trigger
    document.querySelectorAll('.nav-location-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal();
        });
    });
    
    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);
    
    // Location selections options list
    modalWrapper.querySelectorAll('.loc-option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const loc = btn.dataset.loc;
            localStorage.setItem('tasty_location', loc);
            updateLocationDisplays(loc);
            showToast(`Delivery location set to ${loc}`, 'success');
            closeModal();
        });
    });
    
    // Custom location inputs
    customSaveBtn.addEventListener('click', () => {
        const val = customInput.value.trim();
        if (val) {
            localStorage.setItem('tasty_location', val);
            updateLocationDisplays(val);
            showToast(`Delivery location set to ${val}`, 'success');
            closeModal();
        } else {
            showToast('Please type an address', 'error');
        }
    });
};

// --- Table Booking Modal ---
export const initTableBooking = () => {
    const bookTableCard = document.getElementById('book-table-card');
    if (!bookTableCard) return;
    
    // Inject booking modal if missing
    if (!document.getElementById('booking-modal')) {
        const bookingModalHTML = `
            <div id="booking-modal" class="modal-overlay-wrapper hidden">
                <div class="modal-overlay"></div>
                <div class="modal-container p-6">
                    <div class="flex items-center justify-between border-b border-gray-150 pb-4 mb-4">
                        <div class="flex items-center gap-2">
                            <div class="w-8 h-8 rounded-lg bg-orange-100 text-primary flex items-center justify-center">
                                <i class="ri-calendar-event-fill text-base"></i>
                            </div>
                            <h3 class="font-heading font-bold text-lg text-gray-900">Book Dining Table</h3>
                        </div>
                        <button id="close-booking-btn" class="w-8 h-8 rounded-full hover:bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors">
                            <i class="ri-close-line text-2xl"></i>
                        </button>
                    </div>
                    <form id="table-booking-form" class="space-y-4">
                        <div>
                            <label class="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
                            <input type="text" required placeholder="John Doe" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20">
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-bold text-gray-700 mb-1">Date</label>
                                <input type="date" required class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20">
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-gray-700 mb-1">Time Slot</label>
                                <select required class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20">
                                    <option value="12:00 PM">12:00 PM (Lunch)</option>
                                    <option value="1:30 PM">1:30 PM</option>
                                    <option value="7:00 PM" selected>7:00 PM (Dinner)</option>
                                    <option value="8:30 PM">8:30 PM</option>
                                    <option value="10:00 PM">10:00 PM</option>
                                </select>
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-bold text-gray-700 mb-1">Guests</label>
                                <select required class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20">
                                    <option value="2">2 People</option>
                                    <option value="3">3 People</option>
                                    <option value="4" selected>4 People</option>
                                    <option value="6">6 People</option>
                                    <option value="8">8+ People</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-gray-700 mb-1">Occasion</label>
                                <select class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20">
                                    <option value="none">None</option>
                                    <option value="birthday">Birthday</option>
                                    <option value="anniversary">Anniversary</option>
                                    <option value="business">Business Dinner</option>
                                </select>
                            </div>
                        </div>
                        <button type="submit" class="w-full bg-primary hover:bg-orange-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-orange-100 hover:shadow-orange-200 transition-all text-sm mt-2 flex items-center justify-center gap-1.5">
                            Confirm Reservation <i class="ri-checkbox-circle-line"></i>
                        </button>
                    </form>
                </div>
            </div>
        `;
        const div = document.createElement('div');
        div.innerHTML = bookingModalHTML.trim();
        document.body.appendChild(div.firstChild);
    }
    
    const bookingWrapper = document.getElementById('booking-modal');
    const overlay = bookingWrapper.querySelector('.modal-overlay');
    const closeBtn = document.getElementById('close-booking-btn');
    const bookingForm = document.getElementById('table-booking-form');
    
    const openBooking = () => {
        bookingWrapper.classList.remove('hidden');
        document.body.classList.add('modal-open');
        requestAnimationFrame(() => {
            bookingWrapper.classList.add('show-modal');
        });
    };
    
    const closeBooking = () => {
        bookingWrapper.classList.remove('show-modal');
        document.body.classList.remove('modal-open');
        setTimeout(() => {
            if (!bookingWrapper.classList.contains('show-modal')) {
                bookingWrapper.classList.add('hidden');
            }
        }, 250);
    };
    
    bookTableCard.addEventListener('click', (e) => {
        e.preventDefault();
        openBooking();
    });
    
    closeBtn.addEventListener('click', closeBooking);
    overlay.addEventListener('click', closeBooking);
    
    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        showToast('Table reserved successfully! Confirmation SMS sent.', 'success');
        bookingForm.reset();
        closeBooking();
    });
};

// Setup Mobile Menu
export const setupMobileMenu = () => {
    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    const icon = btn ? btn.querySelector('i') : null;

    if (btn && menu && icon) {
        const openMenu = () => {
            menu.classList.remove('hidden');
            menu.classList.add('animate-fade-in');
            menu.classList.remove('animate-fade-out');

            icon.classList.remove('ri-menu-4-line');
            icon.classList.add('ri-close-line');
        };

        const closeMenu = () => {
            menu.classList.remove('animate-fade-in');
            menu.classList.add('animate-fade-out');

            icon.classList.remove('ri-close-line');
            icon.classList.add('ri-menu-4-line');

            // Wait for animation to finish before hiding
            setTimeout(() => {
                if (menu.classList.contains('animate-fade-out')) {
                    menu.classList.add('hidden');
                    menu.classList.remove('animate-fade-out');
                }
            }, 300);
        };

        btn.addEventListener('click', () => {
            const isHidden = menu.classList.contains('hidden');
            if (isHidden) {
                openMenu();
            } else {
                closeMenu();
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!menu.contains(e.target) && !btn.contains(e.target) && !menu.classList.contains('hidden')) {
                closeMenu();
            }
        });

        // Close menu on link click
        menu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMenu);
        });
    }
};



// --- Scroll Reveal triggering better movements ---
const initScrollReveal = () => {
    const revealElements = document.querySelectorAll('.scroll-reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Unobserve once animated
            }
        });
    }, {
        threshold: 0.08,
        rootMargin: '0px 0px -30px 0px'
    });
    
    revealElements.forEach(el => observer.observe(el));
};

// --- Chef Gourmet AI Chatbot ---
const injectChefAI = () => {
    if (document.getElementById('chef-ai-container')) return;
    
    const chatbotHTML = `
        <div id="chef-ai-container">
            <!-- FAB Bubble -->
            <div id="chef-ai-fab" class="chef-ai-fab">
                <i class="ri-chat-smile-3-line"></i>
            </div>
            
            <!-- Chat Drawer Panel -->
            <div id="chef-ai-chatbox" class="chef-ai-chatbox">
                <!-- Header -->
                <div class="p-4 bg-gradient-to-r from-orange-500 to-red-500 text-white flex items-center justify-between shadow-md">
                    <div class="flex items-center gap-2.5">
                        <div class="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-lg">
                            👨‍🍳
                        </div>
                        <div>
                            <h4 class="font-heading font-bold text-sm">Chef Gourmet AI</h4>
                            <p class="text-[9px] text-orange-100 flex items-center gap-1">
                                <span class="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping"></span> Online
                            </p>
                        </div>
                    </div>
                    <button id="close-chef-ai" class="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center text-white transition-colors">
                        <i class="ri-close-line text-xl"></i>
                    </button>
                </div>
                
                <!-- Chat History -->
                <div id="chef-ai-messages" class="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50 dark:bg-slate-900/50 no-scrollbar">
                    <div class="flex gap-2">
                        <div class="w-7 h-7 rounded-full bg-orange-100 dark:bg-orange-950/40 flex items-center justify-center text-xs flex-shrink-0">👨‍🍳</div>
                        <div class="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700/80 p-3 rounded-2xl rounded-tl-none max-w-[80%] text-xs shadow-sm">
                            <p class="text-gray-800 dark:text-gray-100 font-medium">Hello food lover! I am your AI Chef Assistant. Let me help you find the perfect dish today! What are you craving?</p>
                        </div>
                    </div>
                </div>
                
                <!-- Quick Suggestion Buttons -->
                <div id="chef-ai-quick-replies" class="p-2.5 border-t border-gray-150/80 dark:border-slate-700 bg-white dark:bg-slate-800 flex gap-1.5 overflow-x-auto no-scrollbar">
                    <button class="chef-reply-btn flex-shrink-0 bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/20 dark:hover:bg-orange-950/40 text-primary border border-orange-100 dark:border-orange-950/40 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all" data-query="spicy">🔥 Spicy Dishes</button>
                    <button class="chef-reply-btn flex-shrink-0 bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/20 dark:hover:bg-orange-950/40 text-primary border border-orange-100 dark:border-orange-950/40 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all" data-query="veg">🥗 Vegetarian Specialties</button>
                    <button class="chef-reply-btn flex-shrink-0 bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/20 dark:hover:bg-orange-950/40 text-primary border border-orange-100 dark:border-orange-950/40 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all" data-query="sweet">🍦 Something Sweet</button>
                    <button class="chef-reply-btn flex-shrink-0 bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/20 dark:hover:bg-orange-950/40 text-primary border border-orange-100 dark:border-orange-950/40 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all" data-query="bestseller">⭐ Bestseller picks</button>
                </div>
                
                <!-- Message Input -->
                <div class="p-3 border-t border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 flex gap-2">
                    <input type="text" id="chef-ai-input" placeholder="Ask for suggestions or ingredients..." class="flex-1 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary text-gray-800 dark:text-gray-100">
                    <button id="chef-ai-send" class="w-8 h-8 bg-primary hover:bg-orange-600 text-white rounded-xl flex items-center justify-center transition-colors flex-shrink-0">
                        <i class="ri-send-plane-fill"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    const div = document.createElement('div');
    div.innerHTML = chatbotHTML.trim();
    document.body.appendChild(div.firstChild);
    
    const fab = document.getElementById('chef-ai-fab');
    const chatbox = document.getElementById('chef-ai-chatbox');
    const closeBtn = document.getElementById('close-chef-ai');
    const input = document.getElementById('chef-ai-input');
    const sendBtn = document.getElementById('chef-ai-send');
    const messages = document.getElementById('chef-ai-messages');
    
    fab.addEventListener('click', () => {
        chatbox.classList.toggle('open');
    });
    
    closeBtn.addEventListener('click', () => {
        chatbox.classList.remove('open');
    });
    
    sendBtn.addEventListener('click', () => {
        handleUserMessage(input.value.trim());
    });
    
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            handleUserMessage(input.value.trim());
        }
    });
    
    // Bind quick replies
    document.querySelectorAll('.chef-reply-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            handleUserMessage(btn.textContent.slice(2).trim(), btn.dataset.query);
        });
    });
};

const handleUserMessage = (text, categoryKey = null) => {
    if (!text) return;
    
    const messagesContainer = document.getElementById('chef-ai-messages');
    const input = document.getElementById('chef-ai-input');
    
    input.value = '';
    appendMessage('user', text);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    showTypingIndicator();
    
    setTimeout(() => {
        hideTypingIndicator();
        
        let responseText = '';
        let matchedItems = [];
        const cleanText = text.toLowerCase();
        
        if (categoryKey === 'spicy' || cleanText.includes('spicy') || cleanText.includes('hot') || cleanText.includes('pepper') || cleanText.includes('chilli')) {
            matchedItems = foodItems.filter(i => i.description.toLowerCase().includes('spicy') || i.name.toLowerCase().includes('spicy') || i.description.toLowerCase().includes('chilli') || i.description.toLowerCase().includes('tandoori')).slice(0, 2);
            responseText = "Here are some of our delicious hot & spicy recommendations that will spice up your day! 🌶️";
        } else if (categoryKey === 'veg' || cleanText.includes('veg') || cleanText.includes('vegan') || cleanText.includes('paneer') || cleanText.includes('vegetarian')) {
            matchedItems = foodItems.filter(i => i.isVeg).slice(0, 2);
            responseText = "Here are some of our finest garden-fresh vegetarian specialties. Pure, nutritious, and incredibly tasty! 🥗";
        } else if (categoryKey === 'sweet' || cleanText.includes('sweet') || cleanText.includes('dessert') || cleanText.includes('cake') || cleanText.includes('waffle') || cleanText.includes('chocolate')) {
            matchedItems = foodItems.filter(i => i.category === 'Desserts').slice(0, 2);
            responseText = "Indulge your sweet tooth with these exquisite, premium chef's special desserts! 🍰";
        } else if (categoryKey === 'bestseller' || cleanText.includes('best') || cleanText.includes('popular') || cleanText.includes('combo') || cleanText.includes('deal')) {
            matchedItems = foodItems.filter(i => i.bestseller).slice(0, 2);
            responseText = "Check out our premium bestselling combos and items that customers are absolutely loving right now! 🔥";
        } else {
            // General query search in foodItems
            matchedItems = foodItems.filter(i => i.name.toLowerCase().includes(cleanText) || i.description.toLowerCase().includes(cleanText) || i.category.toLowerCase().includes(cleanText)).slice(0, 2);
            if (matchedItems.length > 0) {
                responseText = `I searched our kitchen and found these gourmet matches for "${text}"! Check them out:`;
            } else {
                matchedItems = foodItems.filter(i => i.bestseller).slice(0, 1);
                responseText = `I couldn't find an exact match for "${text}", but I highly recommend trying our Signature bestseller:`;
            }
        }
        
        appendMessage('bot', responseText);
        
        if (matchedItems.length > 0) {
            matchedItems.forEach(item => {
                appendItemCard(item);
            });
        }
        
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 1000);
};

const appendMessage = (sender, text) => {
    const container = document.getElementById('chef-ai-messages');
    const msg = document.createElement('div');
    msg.className = 'flex gap-2 ' + (sender === 'user' ? 'justify-end' : '');
    
    if (sender === 'user') {
        msg.innerHTML = `
            <div class="bg-primary text-white p-3 rounded-2xl rounded-tr-none max-w-[80%] text-xs shadow-sm shadow-orange-100">
                <p>${text}</p>
            </div>
        `;
    } else {
        msg.innerHTML = `
            <div class="w-7 h-7 rounded-full bg-orange-100 dark:bg-orange-950/40 flex items-center justify-center text-xs flex-shrink-0">👨‍🍳</div>
            <div class="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700/80 p-3 rounded-2xl rounded-tl-none max-w-[80%] text-xs shadow-sm">
                <p class="text-gray-800 dark:text-gray-100">${text}</p>
            </div>
        `;
    }
    container.appendChild(msg);
};

const appendItemCard = (item) => {
    const container = document.getElementById('chef-ai-messages');
    const card = document.createElement('div');
    card.className = 'ml-9 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700/85 p-3 rounded-xl shadow-sm flex gap-3 items-center max-w-[80%] animate-fade-in';
    card.innerHTML = `
        <img src="${item.image}" class="w-11 h-11 object-cover rounded-lg flex-shrink-0">
        <div class="flex-1 min-w-0">
            <h5 class="font-bold text-[11px] text-gray-900 dark:text-gray-100 truncate">${item.name}</h5>
            <p class="text-[10px] text-primary font-bold mt-0.5">₹${item.price}</p>
        </div>
        <button class="chef-ai-add-cart w-7 h-7 bg-orange-50 hover:bg-primary text-primary hover:text-white rounded-lg flex items-center justify-center transition-colors flex-shrink-0" data-id="${item.id}">
            <i class="ri-add-line text-sm"></i>
        </button>
    `;
    
    card.querySelector('.chef-ai-add-cart').addEventListener('click', () => {
        addToCart(item);
    });
    
    container.appendChild(card);
};

const showTypingIndicator = () => {
    const container = document.getElementById('chef-ai-messages');
    const indicator = document.createElement('div');
    indicator.id = 'chef-typing-indicator-bubble';
    indicator.className = 'flex gap-2';
    indicator.innerHTML = `
        <div class="w-7 h-7 rounded-full bg-orange-100 dark:bg-orange-950/40 flex items-center justify-center text-xs flex-shrink-0">👨‍🍳</div>
        <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;
    container.appendChild(indicator);
    container.scrollTop = container.scrollHeight;
};

const hideTypingIndicator = () => {
    const el = document.getElementById('chef-typing-indicator-bubble');
    if (el) el.remove();
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
    setupMobileMenu();
    injectCartDrawer();
    setupCartDrawerInterceptors();
    initGlobalSearchAutocomplete();
    initLocationPicker();
    initTableBooking();
    initScrollReveal();
    injectChefAI();
});

// Export state for debugging
window.tastyState = state;
