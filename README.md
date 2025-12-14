# 🛡️ ScamShield – Scam Lookup & Fraud Prevention Platform

![License](https://img.shields.io/badge/license-MIT-yellow)
![Tech](https://img.shields.io/badge/stack-Next.js%20%7C%20Node.js%20%7C%20Supabase-blue)
![Security](https://img.shields.io/badge/security-Supabase%20Auth%20%2B%20Cloudflare-success)

ScamShield is a **modern web application** designed to help users detect and avoid online scams.  
The platform allows users to **look up phone numbers, email addresses, and websites**, providing real-time risk analysis and fraud reports with a strong focus on **security, performance, and user experience**.

This project was developed for the **Computing Research Project – Group 5**.

---

## 🚀 Live Overview

- 🔍 Scam lookup in real time  
- 🔐 Secure authentication with Google OAuth  
- 🛡️ Multi-layer protection against bots & spam  
- 📱 Fully responsive & SEO-friendly UI  

---

## 📸 Screenshots

> *(Add real screenshots when available)*

- Homepage  
- Scam Lookup Result  
- Risk Assessment UI  

---

## ✨ Core Features

- **Comprehensive Scam Lookup**
  - Phone numbers
  - Email addresses
  - Websites / URLs

- **Real-Time Risk Analysis**
  - Fast RESTful API responses
  - Clear risk-level indicators

- **Fraud Reporting System**
  - Store scam reports securely
  - Support future data analytics

- **Modern User Interface**
  - Clean, minimal design
  - Optimized for mobile & desktop

---

## 🔐 Security Architecture

ScamShield applies **defence-in-depth security** using industry-standard tools:

### 🔑 Authentication & Authorization
- **Supabase Auth**
  - Email & password login
  - Google OAuth integration
  - Secure session & token handling
- **Two-layer authentication flow**
  - Identity verification via Supabase
  - API protection & rate control

### 🛡️ Anti-Bot & Anti-Spam
- **Cloudflare Protection**
  - Bot & crawler filtering
  - Rate limiting for lookup APIs
  - Protection against automated spam attacks

### 🗄️ Data Security
- **Supabase PostgreSQL**
  - Encrypted data storage
  - Row Level Security (RLS)
  - Controlled access policies

---

## 💻 Technology Stack

### Frontend
- **React.js (Next.js Framework)**
  - Fast rendering
  - SEO-friendly
- **Tailwind CSS**
  - Responsive & modern UI

### Backend
- **Node.js + Express**
  - RESTful API architecture
  - Efficient request handling

### Database & Auth
- **Supabase (PostgreSQL)**
  - User data & fraud reports
  - Authentication & authorization

### Infrastructure & DevOps
- **Cloudflare** – Security & traffic protection  
- **Git & GitHub** – Version control & collaboration  

---

## 📁 Project Structure

```
Computing_Research_Project_Group5/
│
├── backend/              # Node.js + Express API
│
├── frontend/             # Next.js frontend
│
├── README.md
```

---

## ⚙️ Getting Started

### Prerequisites

- Node.js **v16+**
- NPM 
- Supabase account
- Cloudflare account (optional but recommended)

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/MaFiMoi/Computing_Research_Project_Group5.git
cd Computing_Research_Project_Group5
```

---

### 2️⃣ Backend Setup

```bash
cd backend
npm install
npm run dev
```

Create `.env` file:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Access the app at:

```
http://localhost:3000
```

---

## 🎯 Project Objectives

- Raise awareness of online scams
- Provide a reliable scam lookup platform
- Apply modern full-stack web technologies
- Demonstrate secure system design principles

---

## 📌 Future Improvements

- AI-based scam classification
- User reputation scoring
- Advanced analytics dashboard
- Mobile application version

---

## 📄 License

This project is licensed under the **MIT License**.

---

> Developed by **Group 5 – Computing Research Project**
