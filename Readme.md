# 🍕 CRAVIT — Smart Food Ordering & Delivery Platform

> A full-stack web application for food ordering, real-time delivery tracking, restaurant management, and quick commerce — built as part of Software Engineering (IT632) at Dhirubhai Ambani University.

---

## 📌 Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [System Roles](#system-roles)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Modules Overview](#modules-overview)
- [Roadmap](#roadmap)
- [Team](#team)

---

## 🧠 About the Project

**CRAVIT** is a web-based Smart Food Ordering and Delivery Platform inspired by platforms like Swiggy and Zomato. It supports the full food delivery lifecycle — from browsing restaurants and placing orders to real-time GPS tracking, payment processing, and admin oversight.

The platform also includes an **Instamart-style quick commerce module** for instant grocery and essentials delivery.

Built with a multi-role architecture, CRAVIT serves:
- **Customers** — browse, order, track, and reorder food
- **Restaurant Owners** — manage menus, accept orders, and view analytics
- **Delivery Partners** — pick up and deliver orders with live GPS
- **Admins** — oversee the entire platform, approve restaurants, handle complaints

---

## ✨ Features

### 👤 Customer
- Register / Login with role-based access
- Browse restaurants by cuisine, rating, cost, and availability
- Search food items and restaurants
- Add to cart, apply coupons, and place orders
- Multiple payment modes — UPI, Credit/Debit Card, Cash on Delivery
- Real-time order status tracking
- Live GPS delivery partner tracking
- Order history with one-click reorder
- Submit ratings, reviews, and complaints

### 🏪 Restaurant Owner
- Register restaurant (pending admin approval)
- Manage menu — add, edit, remove items with pricing
- Accept or reject incoming orders
- Update preparation status in real time
- View revenue analytics and top-selling items
- Read customer reviews

### 🚴 Delivery Partner
- View and accept assigned delivery orders
- Navigate to restaurant and customer locations
- Share live GPS location during delivery
- Mark orders as picked up / delivered
- View earnings breakdown (daily, weekly, monthly)

### 🛡️ Admin
- Approve or reject restaurant registrations
- Manage users and delivery partners
- Monitor all active and past orders
- Handle customer complaints
- View platform-wide analytics and revenue reports

### 🛒 Instamart Module
- Inventory management for grocery/essentials
- Quick commerce order processing
- Revenue and top-category analytics

---

## 👥 System Roles

| Role | Access |
|------|--------|
| Guest (Unregistered) | Browse restaurants, view menus, add to cart (login required to place order) |
| Customer | Full ordering flow, tracking, history, feedback |
| Restaurant Owner | Menu & order management, analytics |
| Delivery Partner | Order pickup, delivery, GPS sharing, earnings |
| Administrator | Full platform control, approvals, monitoring |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js / React.js |
| Backend | Node.js |
| Backend Services | Firebase (Realtime DB, Cloud Functions) |
| Database | Firebase Firestore |
| Authentication | Firebase Authentication |
| GPS Tracking | OpenMaps API / MapMyIndia API |
| Image Storage | ImageKit / Cloudinary |
| Hosting | Cloud Hosting (Firebase Hosting / Vercel) |
| Project Management | Jira, GitHub |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│                  Next.js Frontend                │
│   (Customer / Restaurant / Delivery / Admin UI)  │
└────────────────────┬────────────────────────────┘
                     │ REST API / Firebase SDK
┌────────────────────▼────────────────────────────┐
│              Node.js Backend + Firebase           │
│   Auth │ Orders │ Payments │ Notifications │ GPS  │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│              Firebase Firestore (DB)             │
│   Users │ Restaurants │ Menus │ Orders │ Reviews │
└─────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.x
- npm or yarn
- Firebase project set up
- Git

### Installation

```bash
# Clone the repo
git clone https://github.com/your-username/cravit.git
cd cravit

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in your Firebase config and API keys

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_MAPS_API_KEY=
```

---

## 📁 Project Structure

```
cravit/
├── app/                    # Next.js app directory
│   ├── (customer)/         # Customer-facing pages
│   ├── (restaurant)/       # Restaurant dashboard
│   ├── (delivery)/         # Delivery partner panel
│   ├── (admin)/            # Admin panel
│   └── (instamart)/        # Instamart module
├── components/             # Reusable UI components
├── lib/                    # Firebase config, utilities
├── hooks/                  # Custom React hooks
├── public/                 # Static assets
├── styles/                 # Global styles
└── README.md
```

---

## 📦 Modules Overview

| Module | Description |
|--------|-------------|
| `User & Account Management` | Registration, login, password reset, role-based access |
| `Restaurant Management` | Registration, approval, listing, availability toggle |
| `Menu Management` | Add/edit/remove items, pricing, availability |
| `Food Search & Discovery` | Search by name/cuisine, filter by rating/cost/veg |
| `Cart & Order Placement` | Add to cart, modify, place immediate or scheduled orders |
| `Payment Management` | UPI, Card, COD, payment confirmation & failure handling |
| `Order Processing` | Restaurant order notifications, accept/reject, prep status |
| `Delivery Management` | Assignment, acceptance, pickup, delivery completion |
| `Tracking & Notifications` | Order status tracking, live GPS, push notifications |
| `Feedback & Complaints` | Ratings, reviews, complaint submission & resolution |
| `Admin Management` | User/restaurant/order oversight, analytics dashboard |
| `Order History & Reports` | Stored history, reorder feature |
| `Instamart` | Grocery inventory, quick commerce orders, analytics |

---

## 🗺️ Roadmap

- [x] SRS Documentation (v1.0)
- [x] UI/UX Design & Wireframes
- [ ] Backend API Development (Week 5–7)
- [ ] Frontend Development (Week 8–9)
- [ ] Testing & QA (Week 10)
- [ ] Deployment (Week 11)
- [ ] Final Submission (Week 12)

### 🔮 Future Enhancements
- 📱 Mobile application (iOS & Android)
- 🤖 AI-based food recommendations
- 🏷️ Dynamic discount and loyalty system
- 🗺️ Smart delivery route optimization
- ⚡ Expanded Instamart quick commerce

---

## 👨‍💻 Team

**Group 5 — DAU Software Engineering (IT632), Winter 2026**

| Name | Student ID |
|------|-----------|
| Diya Jain | 202512014 |
| Divyesh Dandwani | 202512043 |
| Yash Gangwani | 202512048 |
| Aman Rohera | 202512049 |

**Course Instructor:** Prof. Jayprakash Lalchandani

---

> *"From your favourite restaurants, delivered to your door in minutes."*
