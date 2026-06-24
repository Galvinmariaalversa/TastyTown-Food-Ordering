export const categories = [
    { id: 'cat1', name: 'Pizza', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=80', icon: '🍕' },
    { id: 'cat2', name: 'Burger', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80', icon: '🍔' },
    { id: 'cat3', name: 'Biryani', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=500&q=80', icon: '🍚' },
    { id: 'cat4', name: 'Desserts', image: 'https://images.unsplash.com/photo-1563729784474-d779b95f3ea5?auto=format&fit=crop&w=500&q=80', icon: '🍦' },
    { id: 'cat5', name: 'Drinks', image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=500&q=80', icon: '🥤' },
];

export const foodItems = [
    {
        id: '1',
        name: 'Margherita Zeal Pizza',
        price: 249,
        category: 'Pizza',
        rating: 4.5,
        reviewCount: 120,
        image: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?auto=format&fit=crop&w=500&q=80',
        description: 'Classic delight with 100% real mozzarella cheese.',
        isVeg: true,
        bestseller: true
    },
    {
        id: '2',
        name: 'Farmhouse Pizza',
        price: 399,
        category: 'Pizza',
        rating: 4.7,
        reviewCount: 85,
        image: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=500&q=80',
        description: 'Delightful combination of onion, capsicum, tomato & grilled mushroom.',
        isVeg: true,
        bestseller: false
    },
    {
        id: '3',
        name: 'Crispy Veg Burger',
        price: 129,
        category: 'Burger',
        rating: 4.2,
        reviewCount: 200,
        image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=500&q=80',
        description: 'Crispy vegetable patty with fresh lettuce and tangy mayo.',
        isVeg: true,
        bestseller: true
    },
    {
        id: '4',
        name: 'Chicken Mahogany Burger',
        price: 199,
        category: 'Burger',
        rating: 4.8,
        reviewCount: 340,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80',
        description: 'Juicy chicken patty with premium cheese and special sauce.',
        isVeg: false,
        bestseller: true
    },
    {
        id: '5',
        name: 'Hyderabadi Chicken Biryani',
        price: 349,
        category: 'Biryani',
        rating: 4.9,
        reviewCount: 950,
        image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=500&q=80',
        description: 'Authentic Hyderabadi biryani with aromatic basmati rice and tender chicken.',
        isVeg: false,
        bestseller: true
    },
    {
        id: '6',
        name: 'Paneer 65 Biryani',
        price: 289,
        category: 'Biryani',
        rating: 4.4,
        reviewCount: 150,
        image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=500&q=80',
        description: 'Flavorful biryani served with spicy Paneer 65.',
        isVeg: true,
        bestseller: false
    },
    {
        id: '7',
        name: 'Chocolate Lava Cake',
        price: 99,
        category: 'Desserts',
        rating: 4.9,
        reviewCount: 500,
        image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=500&q=80',
        description: 'Molten chocolate cake with a gooey center.',
        isVeg: true,
        bestseller: true
    },
    {
        id: '8',
        name: 'Blueberry Cheesecake',
        price: 189,
        category: 'Desserts',
        rating: 4.6,
        reviewCount: 120,
        image: 'https://images.unsplash.com/photo-1524351199679-46cddf530c04?auto=format&fit=crop&w=500&q=80',
        description: 'Classic cheesecake topped with blueberry compost.',
        isVeg: false,
        bestseller: false
    },
    {
        id: '9',
        name: 'Classic Coke',
        price: 59,
        category: 'Drinks',
        rating: 4.5,
        reviewCount: 1000,
        image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=500&q=80',
        description: 'Chilled Coca-Cola.',
        isVeg: true,
        bestseller: true
    },
    {
        id: '10',
        name: 'Mango Lassi',
        price: 79,
        category: 'Drinks',
        rating: 4.8,
        reviewCount: 430,
        image: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=500&q=80',
        description: 'Thick creamy yoghurt drink with mango pulp.',
        isVeg: true,
        bestseller: false
    },
    {
        id: '11',
        name: 'Tandoori Paneer Pizza',
        price: 349,
        category: 'Pizza',
        rating: 4.7,
        reviewCount: 185,
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=80',
        description: 'Spiced paneer chunks, onions, green chillies & capsicum with tandoori sauce.',
        isVeg: true,
        bestseller: true
    },
    {
        id: '12',
        name: 'Garlic Breadsticks',
        price: 149,
        category: 'Pizza',
        rating: 4.6,
        reviewCount: 290,
        image: 'https://images.unsplash.com/photo-1573145959290-782c98ab64de?auto=format&fit=crop&w=500&q=80',
        description: 'Baked garlic breadsticks served with creamy cheese dip.',
        isVeg: true,
        bestseller: false
    },
    {
        id: '13',
        name: 'Double Cheese Burger',
        price: 229,
        category: 'Burger',
        rating: 4.8,
        reviewCount: 410,
        image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=500&q=80',
        description: 'Double grilled flame patty, extra cheddar cheese, pickles and special sauce.',
        isVeg: false,
        bestseller: true
    },
    {
        id: '14',
        name: 'Butter Chicken Biryani Combo',
        price: 389,
        category: 'Biryani',
        rating: 4.9,
        reviewCount: 820,
        image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=500&q=80',
        description: 'A rich mixture of fragrant Basmati biryani rice served with creamy Butter Chicken.',
        isVeg: false,
        bestseller: true
    },
    {
        id: '15',
        name: 'Chicken Tikka Platter',
        price: 319,
        category: 'Biryani',
        rating: 4.7,
        reviewCount: 230,
        image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=500&q=80',
        description: 'Juicy tandoori chicken tikka pieces served on hot clay with mint chutney.',
        isVeg: false,
        bestseller: false
    },
    {
        id: '16',
        name: 'Red Velvet Waffle',
        price: 179,
        category: 'Desserts',
        rating: 4.8,
        reviewCount: 195,
        image: 'https://images.unsplash.com/photo-1563729784474-d779b95f3ea5?auto=format&fit=crop&w=500&q=80',
        description: 'Fresh baked red velvet waffle with white chocolate drizzle and cream cheese ice cream.',
        isVeg: true,
        bestseller: true
    },
    {
        id: '17',
        name: 'Oreo Milkshake',
        price: 129,
        category: 'Drinks',
        rating: 4.6,
        reviewCount: 380,
        image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=500&q=80',
        description: 'Creamy vanilla milkshake blended with Oreo cookies and topped with chocolate syrup.',
        isVeg: true,
        bestseller: false
    },
    {
        id: '18',
        name: 'Virgin Mint Mojito',
        price: 119,
        category: 'Drinks',
        rating: 4.7,
        reviewCount: 150,
        image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=500&q=80',
        description: 'Refreshing carbonated lime drink with fresh mint leaves and sugar syrup.',
        isVeg: true,
        bestseller: false
    }
];

// Dynamically optimize Unsplash images to WebP format
const optimizeImageUrl = (item) => {
    if (item.image && item.image.includes('unsplash.com')) {
        item.image = item.image.replace('auto=format', 'fm=webp');
        if (!item.image.includes('fm=webp')) {
            item.image += '&fm=webp';
        }
    }
    return item;
};
categories.forEach(optimizeImageUrl);
foodItems.forEach(optimizeImageUrl);
