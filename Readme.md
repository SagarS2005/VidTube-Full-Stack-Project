# VidTube Backend API

A production-ready backend REST API for a video-sharing platform built with **Node.js**, **Express.js**, and **MongoDB**. The project implements secure authentication, media uploads, user management, playlists, subscriptions, likes, comments, tweets, and dashboard analytics while following a modular and scalable architecture.

## ✨ Features

* JWT Authentication with Access & Refresh Token Rotation
* Secure HTTP-only Cookie-Based Authentication
* User Registration & Login
* Password Change & Account Management
* Avatar & Cover Image Uploads
* Video Uploads with Cloudinary Integration
* Like & Dislike System
* Comment Management
* Playlist Creation & Management
* Channel Subscription System
* Watch History
* Tweet (Community Post) Feature
* Dashboard & Channel Statistics
* Search, Pagination & Aggregation Pipelines
* Centralized Error Handling
* Modular MVC Architecture
* Environment Variable Configuration
* RESTful API Design

## 🛠️ Tech Stack

* Node.js
* Express.js
* MongoDB & Mongoose
* JWT (Authentication)
* Multer
* Cloudinary
* bcrypt
* Cookie Parser
* CORS

## 📁 Project Structure

```
src/
├── controllers/
├── models/
├── routes/
├── middlewares/
├── utils/
├── db/
├── constants/
├── app.js
└── index.js
```

## 🚀 Getting Started

### Clone the repository

```bash
git clone <repository-url>
cd <project-folder>
```

### Install dependencies

```bash
npm install
```

### Configure environment variables

Create a `.env` file in the root directory and add the required environment variables:

```env
PORT=
MONGODB_URI=

ACCESS_TOKEN_SECRET=
ACCESS_TOKEN_EXPIRY=

REFRESH_TOKEN_SECRET=
REFRESH_TOKEN_EXPIRY=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

CORS_ORIGIN=
```

### Start the development server

```bash
npm run dev
```

### Start the production server

```bash
npm start
```

## 📌 API Features

* Authentication APIs
* User APIs
* Video APIs
* Comment APIs
* Like APIs
* Playlist APIs
* Subscription APIs
* Tweet APIs
* Dashboard APIs
* Health Check APIs

## 📦 Deployment

The backend can be deployed on platforms like **Render**, while using **MongoDB Atlas** for the database and **Cloudinary** for media storage.

## 🤝 Contributing

Contributions, suggestions, and improvements are welcome. Feel free to fork the repository, create a new branch, and submit a pull request.

## 📄 License

This project is intended for learning and portfolio purposes.
