# Intelli-NIET

## Campus Complaint Management System

Intelli-NIET is a full-stack web application designed to simplify and digitize the process of submitting, tracking, and managing campus complaints.

The system provides separate interfaces for **Faculty** and **Administrators**, with real-time complaint status synchronization through a MongoDB database.


## Live Demo

**Website:**  https://intelli-niet.onrender.com 


## ✨ Features

### Faculty
- Secure faculty login
- Submit new complaints
- Select complaint category and priority
- Provide location details such as block, floor, and room
- View submitted complaints
- Track complaint status
- View complaint statistics

### Admin
- Secure administrator login
- View all submitted complaints
- Search and filter complaints
- View complaint details
- Update complaint status
- Monitor complaint priorities and categories
- Manage complaint resolution workflow

## 🛠️ Tech Stack

### Frontend
- HTML5
- CSS3
- JavaScript

### Backend
- Node.js
- Express.js
- REST API

### Database
- MongoDB
- Mongoose
- MongoDB Atlas

### Authentication & Security
- Express Session
- MongoDB Session Store
- bcrypt.js
- Helmet
- Rate Limiting
- Environment Variables

### Deployment
- Render
- MongoDB Atlas

## 📁 Project Structure

```text
Intelli-NIET/
│
├── public/
│   ├── login.html
│   ├── faculty.html
│   ├── admin.html
│   │
│   ├── css/
│   ├── js/
│   └── images/
│
├── models/
│   ├── User.js
│   └── Complaint.js
│
├── routes/
│   ├── auth.js
│   └── complaints.js
│
├── middleware/
│   └── authMiddleware.js
│
├── server.js
├── package.json
├── package-lock.json
└── .gitignore
