# 🍕 TastyTown – Premium Online Food Ordering Platform

TastyTown is a modern, responsive, and visually stunning web application for online food ordering. Designed with a premium dark-light aesthetic, dynamic micro-interactions, and engaging gamified elements like the **Gourmet Wheel of Fortune**, this platform offers customers a seamless and delightful food ordering experience.

Live Demo: **Deployable to Vercel & Netlify out-of-the-box!**

---

## ✨ Features

- **🍔 Interactive Gourmet Wheel (Dish Roulette)**: Can't decide what to eat? Spin the gamified Chef's Choice wheel with realistic LED chasing lights, sound feel, and spring-reveal animations to select a chef's special dish.
- **💬 Chef Gourmet AI Chatbot**: A custom-themed chat assistant that provides smart meal suggestions based on cravings (spicy, sweet, vegetarian, bestsellers) and queries.
- **📱 Fully Mobile Responsive**: Engineered with flexible viewports and custom scale metrics for flawless performance on all mobile screen sizes (including iPhone SE, Galaxy Fold, and tablets).
- **🛒 Dynamic Shopping Cart & Drawer**: Add items, adjust quantities, apply custom coupon codes (`TASTY10` for 10% off), and manage order add-ons with automated subtotals and real-time badge updates.
- **📍 Location Selector & Table Booking**: Pick neighborhood locations (Manhattan, Brooklyn, Queens, etc.) or set custom addresses, and book restaurant dining tables instantly with instant confirmation feedback.
- **🏍️ Real-time Order Tracking**: Follow your delivery rider with a custom animated SVG road map and progress timeline from order confirmation to dispatch.
- **📦 Clean Architecture**: Organized with semantic HTML5, Vanilla JS state management, and modern Tailwind styling.

---

## 📁 Project Structure

```
TastyTown/
├── index.html          # Main landing page (Hero, Categories, Roulette, Offers, CTA)
├── menu.html           # Full menu browsing page with search & category filters
├── product.html        # Product detail page with customization tabs & reviews
├── cart.html           # Full checkout cart & coupon management page
├── checkout.html       # Secure address entry, delivery slot scheduler & payments
├── success.html        # Order confirmation with Canvas Confetti bursts
├── track.html          # SVG live tracker map and rider status timeline
├── about.html          # Team story, executive chefs profiles & timeline
├── contact.html        # Contact form, Google Maps integration & interactive FAQ accordion
├── css/
│   └── style.css       # Custom transitions, animations, modal styles, and mobile scaling rules
├── js/
│   ├── data.js         # Menu database (names, descriptions, pricing, images, categories)
│   └── main.js         # Core state management, cart actions, modals, and Chatbot logic
├── images/
│   └── logo.png        # Brand logo asset
├── vercel.json         # Vercel pretty URLs & Cache-Control headers configuration
├── netlify.toml        # Netlify routing configuration (backup support)
├── _redirects         # Netlify clean URLs configuration (backup support)
└── .gitignore          # Git exclusion rules for OS files and local metadata
```

---

## 🛠️ Technology Stack

- **Frontend Core**: HTML5, Vanilla JavaScript (ES6+ Modules)
- **Styling & Aesthetics**: Tailwind CSS (Utility classes) & Vanilla CSS (Complex keyframe animations, 3D card perspectives, and custom scrollbars)
- **Icons**: RemixIcon (CDN)
- **Fonts**: Google Fonts (Outfit & Playfair Display)
- **Libraries**: Canvas Confetti (dynamic ES import for success pages)

---

## 🚀 How to Run Locally

Since the application uses ES Modules (`import`/`export`), it needs to be served by a local web server (opening the file directly in the browser via `file://` will trigger CORS restrictions).

### Option 1: Live Server (VS Code Extension)
1. Install the **Live Server** extension in VS Code.
2. Click **Go Live** at the bottom right corner of VS Code.

### Option 2: Node.js (npx)
Run the following command in your terminal:
```bash
npx http-server -p 8000
```
Then visit: `http://localhost:8000`

### Option 3: Python Server
```bash
# Python 3
python -m http.server 8000
```
Then visit: `http://localhost:8000`

---

## 🌐 How to Deploy to Vercel

This repository is optimized for Vercel deployment. Vercel automatically detects the HTML configuration and configures pretty URLs based on `vercel.json`.

### Method 1: Git Integration (Recommended)
1. Push your project to a new GitHub repository (see [GitHub Instructions](#-pushing-to-github)).
2. Log in to [Vercel](https://vercel.com).
3. Click **Add New** → **Project**.
4. Import your GitHub repository.
5. Under Build & Development Settings, leave all commands empty (Vercel hosts it as a static site).
6. Click **Deploy**.

### Method 2: Vercel CLI (Command Line)
1. Install the Vercel CLI globally:
   ```bash
   npm install -g vercel
   ```
2. Run the deployment command in the project folder:
   ```bash
   vercel
   ```
3. To deploy to production:
   ```bash
   vercel --prod
   ```

---

## 🐙 Pushing to GitHub

To push this project to your GitHub account, run the following commands in your Git bash or terminal:

```bash
# Initialize git repository
git init

# Add all files to staging (uses the refined .gitignore)
git add .

# Create initial commit
git commit -m "chore: refine folder structure, clean assets, improve mobile responsiveness, and add Vercel config"

# Link your remote GitHub repository (replace with your actual repository URL)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Rename default branch to main
git branch -M main

# Push code to GitHub
git push -u origin main
```

---

## 🎨 Customization Guides

### 1. Primary Colors
You can change the core color accents by updating the Tailwind configuration block at the top of each `.html` file:
```javascript
tailwind.config = {
    theme: {
        extend: {
            colors: {
                primary: '#f97316',    // Edit this hex value to change the theme highlight color
                secondary: '#1f2937',
            }
        }
    }
}
```

### 2. Updating Food Items
To add, edit, or remove food dishes, simply modify the `foodItems` array in `js/data.js`:
```javascript
export const foodItems = [
    {
        id: "p1",
        name: "Chef's Special Pizza",
        category: "Pizza",
        price: 399,
        image: "https://images.unsplash.com/... ",
        description: "Fresh basil, organic mozzarella, and tomatoes.",
        rating: 4.8,
        reviewCount: 124,
        isVeg: true
    },
    // Add new items here
];
```

---

## 📄 License
This project is open-source and free to use for personal and commercial purposes.

*Enjoy your TastyTown dining experience!* 🍕🍔🥤
