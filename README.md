# DERA ZONE — E-Commerce Platform

> **Shop Smart. Live Better.**
> Pakistan's premier modern e-commerce destination for gadgets, accessories, and lifestyle essentials.

---

## 🚀 Overview

DERA ZONE is a full-stack e-commerce web platform featuring a responsive frontend storefront, comprehensive administrative dashboard, order management, invoice generation, customer messaging, and dynamic product catalogs.

---

## 🛠️ Tech Stack

- **Frontend:** Vanilla JavaScript, Modern CSS3 (Variables, Responsive Grid/Flexbox), HTML5
- **Backend:** Node.js, Express.js
- **Database / Storage:** Firebase Firestore / Local JSON store fallback
- **Authentication:** Admin JWT & Secure Session handling
- **Invoice & Email Engine:** PDFKit, Nodemailer

---

## 📂 Project Structure

```text
├── css/
│   ├── style.css             # Core design system & global styles
│   └── pages.css             # Page-specific extended layouts
├── js/
│   ├── api.js                # Frontend API client
│   ├── main.js               # Global UI components & interactions
│   ├── products-render.js    # Dynamic product & category rendering
│   ├── checkout.js           # Checkout & order placement logic
│   └── whatsapp-config.js    # Contact & WhatsApp store configuration
├── backend/
│   ├── server.js             # Express application entry point
│   ├── routes/               # API routes (products, orders, invoices, admin)
│   ├── admin/                # Admin Panel SPA interface
│   └── utils/                # PDF generation, email templates, database helpers
├── images/                   # Brand logos and static assets
├── index.html                # Homepage
├── shop.html                 # Shop & catalog exploration
├── product.html              # Product details view
├── checkout.html             # Multi-step checkout
├── account.html              # Customer order tracking & dashboard
├── about.html                # Brand story & identity
├── contact.html              # Customer support & inquiries
└── policy.html               # Policies & terms
```

---

## 💻 How to Run Locally

### 1. Install Dependencies
```bash
cd backend
npm install
cd ..
```

### 2. Start the Server
```bash
node backend/server.js
```

### 3. Open in Browser
- Storefront: `http://localhost:3001`
- Admin Dashboard: `http://localhost:3001/admin`

---

## 📜 License
© 2026 DERA ZONE. All rights reserved.
