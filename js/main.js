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

// --- Audio Feedback ---
export const playAddCartSound = () => {
    try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;
        const ctx = new AudioContextClass();
        
        // Simple double chime: pleasant ascending notes
        const now = ctx.currentTime;
        
        // Chime 1 (D5 to A5)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(587.33, now); // D5
        osc1.frequency.exponentialRampToValueAtTime(880.00, now + 0.15); // A5
        
        gain1.gain.setValueAtTime(0.15, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.3);
        
        // Chime 2 (A5 to D6)
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(880.00, now + 0.08); // A5
        osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.25); // D6
        
        gain2.gain.setValueAtTime(0.12, now + 0.08);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.08);
        osc2.stop(now + 0.4);
    } catch (e) {
        console.warn('Web Audio API not supported or blocked:', e);
    }
};

// --- Cart Actions ---
export const addToCart = (product, quantity = 1, addOns = []) => {
    playAddCartSound();
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
    const saveLocationAction = () => {
        const val = customInput.value.trim();
        const addressRegex = /[a-zA-Z]/;
        if (val.length >= 4 && addressRegex.test(val)) {
            localStorage.setItem('tasty_location', val);
            updateLocationDisplays(val);
            showToast(`Delivery location set to ${val}`, 'success');
            closeModal();
        } else {
            showToast('Please enter a valid address (at least 4 characters containing letters)', 'error');
        }
    };

    customSaveBtn.addEventListener('click', saveLocationAction);
    customInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveLocationAction();
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
    if (btn && btn.dataset.menuInitialized) return;

    const menu = document.getElementById('mobile-menu');
    const icon = btn ? btn.querySelector('i') : null;

    if (btn && menu && icon) {
        btn.dataset.menuInitialized = "true";
        const closeBtn = menu.querySelector('#mobile-menu-close-btn');
        const backdrop = menu.querySelector('.mobile-menu-backdrop');
        const drawerSearch = menu.querySelector('.mobile-drawer-search');
        const bookTableBtn = menu.querySelector('.mobile-book-table-btn');

        const openMenu = () => {
            menu.classList.remove('hidden');
            menu.classList.add('animate-fade-in');
            menu.classList.remove('animate-fade-out');

            icon.classList.remove('ri-menu-4-line');
            icon.classList.add('ri-close-line');
            document.body.classList.add('menu-open');
            btn.setAttribute('aria-expanded', 'true');
        };

        const closeMenu = () => {
            menu.classList.remove('animate-fade-in');
            menu.classList.add('animate-fade-out');

            icon.classList.remove('ri-close-line');
            icon.classList.add('ri-menu-4-line');
            document.body.classList.remove('menu-open');
            btn.setAttribute('aria-expanded', 'false');

            // Wait for animation to finish before hiding
            setTimeout(() => {
                if (menu.classList.contains('animate-fade-out')) {
                    menu.classList.add('hidden');
                    menu.classList.remove('animate-fade-out');
                }
            }, 300);
        };

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isHidden = menu.classList.contains('hidden');
            if (isHidden) {
                openMenu();
            } else {
                closeMenu();
            }
        });

        // Close on close button click
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                closeMenu();
            });
        }

        // Close on backdrop click
        if (backdrop) {
            backdrop.addEventListener('click', (e) => {
                e.stopPropagation();
                closeMenu();
            });
        }

        // Close menu on link click
        menu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                if (link.classList.contains('mobile-drawer-cart-link')) {
                    const path = window.location.pathname;
                    if (!path.includes('cart.html') && !path.includes('checkout.html')) {
                        e.preventDefault();
                        closeMenu();
                        setTimeout(() => {
                            openCartDrawer();
                        }, 350);
                        return;
                    }
                }
                closeMenu();
            });
        });

        // Search redirect inside mobile menu drawer
        if (drawerSearch) {
            drawerSearch.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const query = drawerSearch.value.trim();
                    if (query) {
                        closeMenu();
                        window.location.href = `menu.html?search=${encodeURIComponent(query)}`;
                    }
                }
            });
        }

        // Book table connection in drawer
        if (bookTableBtn) {
            bookTableBtn.addEventListener('click', (e) => {
                e.preventDefault();
                closeMenu();
                // Trigger table booking modal
                const bookTableCard = document.getElementById('book-table-card') || document.querySelector('[href="#book-table"]');
                if (bookTableCard) {
                    bookTableCard.click();
                } else {
                    const bookingWrapper = document.getElementById('booking-modal');
                    if (bookingWrapper) {
                        bookingWrapper.classList.remove('hidden');
                        document.body.classList.add('modal-open');
                        requestAnimationFrame(() => {
                            bookingWrapper.classList.add('show-modal');
                        });
                    } else {
                        window.location.href = 'index.html#dish-roulette-sec';
                    }
                }
            });
        }
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
            <!-- Premium FAB Bubble -->
            <div id="chef-ai-fab" class="chef-ai-fab">
                <span class="fab-badge"></span>
                <span class="fab-icon">
                    <i class="ri-chat-smile-3-line"></i>
                </span>
            </div>
            
            <!-- Premium Chat Drawer Panel -->
            <div id="chef-ai-chatbox" class="chef-ai-chatbox">
                <!-- Glassmorphic Header -->
                <div class="chef-ai-header">
                    <div class="flex items-center gap-3">
                        <div class="chef-avatar">👨‍🍳</div>
                        <div>
                            <h4 style="font-weight:800; font-size:14px; letter-spacing:0.3px; margin:0;">Chef Gourmet AI</h4>
                            <p style="font-size:10px; display:flex; align-items:center; gap:5px; margin:2px 0 0 0; opacity:0.9;">
                                <span class="status-dot"></span> Online — Ready to help
                            </p>
                        </div>
                    </div>
                    <button id="close-chef-ai" class="close-btn" aria-label="Close chat">
                        <i class="ri-close-line"></i>
                    </button>
                </div>
                
                <!-- Message Area -->
                <div id="chef-ai-messages" class="chef-ai-messages no-scrollbar">
                    <div class="chef-msg-bot">
                        <div class="msg-avatar">👨‍🍳</div>
                        <div>
                            <div class="msg-bubble">
                                <p style="margin:0; font-weight:500;">Hello food lover! 👋 I'm your <strong>AI Chef Assistant</strong>. Let me help you discover the perfect dish today! What are you craving?</p>
                            </div>
                            <div class="msg-time">Just now</div>
                        </div>
                    </div>
                </div>
                
                <!-- Quick Reply Buttons -->
                <div id="chef-ai-quick-replies" class="chef-quick-replies">
                    <button class="chef-reply-btn" data-query="spicy">🔥 Spicy Dishes</button>
                    <button class="chef-reply-btn" data-query="veg">🥗 Vegetarian</button>
                    <button class="chef-reply-btn" data-query="sweet">🍦 Desserts</button>
                    <button class="chef-reply-btn" data-query="bestseller">⭐ Bestsellers</button>
                </div>
                
                <!-- Premium Input Area -->
                <div class="chef-input-area">
                    <div class="chef-input-wrapper">
                        <input type="text" id="chef-ai-input" placeholder="Ask for suggestions or ingredients..." autocomplete="off">
                    </div>
                    <button id="chef-ai-send" class="chef-send-btn" aria-label="Send message">
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
    
    const fabIcon = fab.querySelector('.fab-icon i');
    const fabBadge = fab.querySelector('.fab-badge');
    
    const openChat = () => {
        chatbox.classList.add('open');
        fab.classList.add('active');
        fabIcon.className = 'ri-close-line';
        if (fabBadge) fabBadge.style.display = 'none';
        setTimeout(() => input.focus(), 400);
    };
    
    const closeChat = () => {
        chatbox.classList.remove('open');
        fab.classList.remove('active');
        fabIcon.className = 'ri-chat-smile-3-line';
    };
    
    fab.addEventListener('click', () => {
        if (chatbox.classList.contains('open')) {
            closeChat();
        } else {
            openChat();
        }
    });
    
    closeBtn.addEventListener('click', closeChat);
    
    // Send with ripple effect
    const triggerSend = () => {
        const text = input.value.trim();
        if (!text) return;
        sendBtn.classList.remove('ripple');
        void sendBtn.offsetWidth; // force reflow
        sendBtn.classList.add('ripple');
        handleUserMessage(text);
        setTimeout(() => sendBtn.classList.remove('ripple'), 500);
    };
    
    sendBtn.addEventListener('click', triggerSend);
    
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            triggerSend();
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
    
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    if (sender === 'user') {
        msg.className = 'chef-msg-user';
        msg.innerHTML = `
            <div>
                <div class="msg-bubble"><p style="margin:0">${text}</p></div>
                <div class="msg-time">${timeStr}</div>
            </div>
        `;
    } else {
        msg.className = 'chef-msg-bot';
        msg.innerHTML = `
            <div class="msg-avatar">👨‍🍳</div>
            <div>
                <div class="msg-bubble"><p style="margin:0">${text}</p></div>
                <div class="msg-time">${timeStr}</div>
            </div>
        `;
    }
    container.appendChild(msg);
};

const appendItemCard = (item) => {
    const container = document.getElementById('chef-ai-messages');
    const card = document.createElement('div');
    card.className = 'chef-item-card';
    const stars = '★'.repeat(Math.min(5, Math.floor(3.5 + Math.random() * 1.5))) + '☆'.repeat(Math.max(0, 5 - Math.floor(3.5 + Math.random() * 1.5)));
    card.innerHTML = `
        <img src="${item.image}" alt="${item.name}">
        <div class="item-info" style="flex:1; min-width:0;">
            <h5 style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${item.name}</h5>
            <div class="item-price">₹${item.price}</div>
            <div class="item-rating">${stars}</div>
        </div>
        <button class="add-cart-btn" data-id="${item.id}" aria-label="Add to cart">
            <i class="ri-add-line"></i>
        </button>
    `;
    
    const addBtn = card.querySelector('.add-cart-btn');
    addBtn.addEventListener('click', () => {
        addToCart(item);
        addBtn.classList.add('added');
        addBtn.innerHTML = '<i class="ri-check-line"></i>';
        setTimeout(() => {
            addBtn.classList.remove('added');
            addBtn.innerHTML = '<i class="ri-add-line"></i>';
        }, 1500);
    });
    
    container.appendChild(card);
};

const showTypingIndicator = () => {
    const container = document.getElementById('chef-ai-messages');
    const indicator = document.createElement('div');
    indicator.id = 'chef-typing-indicator-bubble';
    indicator.className = 'chef-typing-wrap';
    indicator.innerHTML = `
        <div class="msg-avatar">👨‍🍳</div>
        <div class="typing-indicator">
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
            <div class="typing-label">Chef is cooking up a response…</div>
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
const initAll = () => {
    updateCartBadge();
    setupMobileMenu();
    injectCartDrawer();
    setupCartDrawerInterceptors();
    initGlobalSearchAutocomplete();
    initLocationPicker();
    initTableBooking();
    initScrollReveal();
    injectChefAI();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
} else {
    initAll();
}

// Export state for debugging
window.tastyState = state;
