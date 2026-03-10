# 💊 CareMeds – Medicine Availability System

## 📌 Project Overview

### Project Title
CareMeds – Medicine Availability System

### Objective
The objective of this project is to develop a web-based platform where users can easily check the availability of medicines and place orders online.

The system helps users avoid visiting multiple pharmacies physically to search for medicines. The platform allows users to browse medicines, add them to a cart, and place orders either for home delivery or pharmacy pickup.

### Target Audience
- General users searching for medicines
- Patients who need medicines urgently
- Pharmacy customers who prefer online ordering

---

# 👥 Team Members

| Name | Roll | Email | Role |
|-----|-----|-----|-----|
| MD. Mushfiqur Rahman | 20230104099 | mushfiqur.cse.20230104099@aust.edu | Team Lead & Backend Developer |
| MD. Mahedi Hasan Oni | 20230104098 | mahedi.cse.20230104098@aust.edu | Frontend Developer |
| Maimuna Momtaj Emu | 20230104078 | maimuna.cse.20230104078@aust.edu | Frontend Developer |
| Sabikun Alam | 20230104095 | sabikun.cse.20230104095@aust.edu | Backend Developer |

---

# 🛠 Technology Stack

## Backend
- Laravel (PHP Framework)

## Frontend
- React
- HTML
- CSS
- JavaScript

## Database
- MySQL

---

# ⚙ Rendering Method
Client-Side Rendering (CSR)

---

# 🎨 UI Design

Figma Design Link:

https://www.figma.com/make/ObVKtTEbUS4QDOJ2wc4wJd/PharmaTrack-Web-Application-UI?p=f&t=jFXLXi9uMLL59jmO-0

---

# ✨ Project Features

- User registration and login system
- Secure authentication using API tokens
- Medicine listing and browsing
- Search and filter medicines
- Add medicines to cart
- Update cart quantity and remove items from cart
- Place medicine orders
- Option for home delivery or pharmacy pickup
- Automatic rider assignment for delivery orders
- User profile page to update personal information

---

# 🔗 API Endpoints

| Method | Endpoint | Description |
|------|------|------|
| POST | /api/register | Register a new user |
| POST | /api/login | Authenticate user and generate token |
| GET | /api/medicines | Fetch list of available medicines |
| POST | /api/cart | Add medicine to cart |
| GET | /api/cart | View cart items |
| DELETE | /api/cart/{id} | Remove item from cart |
| POST | /api/orders | Place an order |
| GET | /api/orders | View user orders |

---

# 📅 Project Milestones

## Milestone 1 – Project Setup
- Initial project setup
- Database design
- User authentication system (Login/Register)
- Basic frontend pages

## Milestone 2 – Core System Development
- Medicine listing and display
- Cart system implementation
- Search and filtering functionality
- API integration between frontend and backend

## Milestone 3 – Order System
- Order placement system
- Delivery or pickup option
- Rider assignment for delivery
- Testing and debugging
