# 🍔 CRAVIT — Smart Food Ordering & Delivery Platform

## 📌 Project Overview
CRAVIT is a web-based food ordering and delivery platform that allows users to browse restaurants, order food online, and track deliveries in real time.

The system connects customers, restaurant owners, delivery partners, and admin in one platform. It replaces manual food ordering with a fast, digital, and user-friendly system.

---

## 🎯 Objectives
- Make food ordering simple and fast  
- Provide real-time order tracking  
- Help restaurants manage orders digitally  
- Enable delivery partners to manage deliveries efficiently  
- Allow admin to monitor and control the system  

---

## 👥 Users in the System
1. Unregistered User – Browse restaurants and menus  
2. Customer – Order food and track delivery  
3. Restaurant Owner – Manage menu and orders  
4. Delivery Partner – Deliver orders and update status  
5. Admin – Manage users and monitor system  

---

## ⚙️ Features

### 👤 Customer
- Register / Login  
- Browse restaurants & menus  
- Add to cart & modify cart  
- Place order  
- Online payment / Cash on Delivery  
- Live order tracking (GPS)  
- Give feedback and ratings  
- View order history & reorder  

### 🏪 Restaurant Owner
- Register restaurant  
- Manage menu (add/update/remove items)  
- Accept / Reject orders  
- Update order status (preparing, ready)  
- Manage availability  

### 🚚 Delivery Partner
- Login  
- View assigned deliveries  
- Accept delivery requests  
- Update delivery status  
- Share live location  

### 🛠️ Admin
- Manage users (customers, restaurants, delivery partners)  
- Approve/reject restaurants  
- Monitor all orders  
- Handle complaints  
- View system reports  

---

## 🏗️ System Modules
- User & Account Management  
- Restaurant Management  
- Menu Management  
- Food Search & Discovery  
- Cart & Order Placement  
- Payment Management  
- Order Processing  
- Delivery Management  
- Tracking & Notifications  
- Feedback & Complaint  
- Admin Management  
- Order History & Reports  

---

## 🧱 Tech Stack
- **Frontend:** React.js (TypeScript), Tailwind CSS, Vite  
- **Backend:** Firebase  
- **Database:** Cloud Firestore  
- **Authentication:** Firebase Auth  
- **State Management:** React Context API  
- **Tools:** GitHub, VS Code  

---
## 4. System Architecture Diagram

            +----------------------------+
            |        CLIENT LAYER        |
            +----------------------------+
            |  Customer Web App          |
            |  Restaurant Dashboard      |
            |  Delivery Dashboard        |
            |  Admin Panel               |
            +-------------+--------------+
                          |
                          v
            +----------------------------+
            |     FRONTEND (React)       |
            |  UI + Components + State   |
            +-------------+--------------+
                          |
                          v
            +----------------------------+
            |   APPLICATION / API LAYER  |
            |   Business Logic Handling  |
            +------+------+------+-------+
                   |      |      | 
                   v      v      v
        +-----------+ +-----------+ +----------------+
        | Firebase  | | Firestore | | Payment Gateway|
        | Auth      | | Database  | | Transactions   |
        +-----------+ +-----------+ +----------------+

                   |
                   v
            +--------------------+
            |   GPS / Maps API   |
            |   Live Tracking    |
            +--------------------+

---
## 🔄 System Workflow
1. User browses restaurants and menu  
2. Customer logs in and adds items to cart  
3. Customer places order and selects payment method  
4. System processes payment  
5. Restaurant accepts and prepares order  
6. Delivery partner is assigned  
7. Order is delivered to customer  
8. Customer tracks order and gives feedback  

---

## 📊 UML Diagrams Included
- Use Case Diagram (for all 5 users)  
- Class Diagram  
- Sequence Diagram  
- Activity Diagram  

---

## 🚧 Current Status
- Frontend completed  
- Firebase integration live  
- Order tracking implemented  
- Some backend APIs in progress  
- Payment integration planned  

---

## 🔮 Future Enhancements
- Mobile application  
- AI-based food recommendations  
- Smart delivery routing  
- Discount & offer system  
- Instamart (quick commerce module)  

---

## 👨‍💻 Team Members

- Diya Jain – Documentation + Frontend  
- Divyesh Dandwani – Frontend + Integration  
- Yash Gangwani – Backend + Database  
- Aman Rohera – Backend + Firebase  

---

## 📅 Timeline
- Jan – Proposal & Planning  
- Feb – SRS & UI Design  
- Mar – DFD, UML, Firebase Integration  
- Apr – Backend APIs & Testing  
- May – Final Submission  

---

## ✅ Conclusion
CRAVIT provides a complete solution for online food ordering with real-time tracking and multi-user interaction. It improves efficiency, user experience, and system management for all stakeholders.
