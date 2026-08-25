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
##  API Endpoints

### User Routes — `/api/v1/users`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/users/register` | Register a new user with avatar and cover image |
| POST | `/api/v1/users/login` | Log in a user |
| POST | `/api/v1/users/logout` | Log out the currently authenticated user |
| POST | `/api/v1/users/refresh-token` | Refresh the user's access token |
| POST | `/api/v1/users/change-password` | Change the current user's password |
| GET | `/api/v1/users/current-user` | Get the currently authenticated user's details |
| PATCH | `/api/v1/users/update-account` | Update the user's account details |
| PATCH | `/api/v1/users/avatar` | Update the user's avatar |
| PATCH | `/api/v1/users/cover-image` | Update the user's cover image |
| GET | `/api/v1/users/channel/:username` | Get a user's channel profile by username |
| GET | `/api/v1/users/history` | Get the current user's watch history |

### Video Routes — `/api/v1/videos`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/videos` | Get all videos (search, sort, filter, paginate) |
| POST | `/api/v1/videos` | Upload a new video |
| GET | `/api/v1/videos/:videoId` | Get a video by ID |
| PATCH | `/api/v1/videos/:videoId` | Update video details / thumbnail |
| DELETE | `/api/v1/videos/:videoId` | Delete a video |
| PATCH | `/api/v1/videos/toggle/publish/:videoId` | Toggle publish/unpublish status |

### Comment Routes — `/api/v1/comments`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/comments/:videoId` | Get all comments for a video |
| POST | `/api/v1/comments/:videoId` | Add a comment to a video |
| DELETE | `/api/v1/comments/:commentId` | Delete a comment |
| PATCH | `/api/v1/comments/:commentId` | Update a comment |

### Like Routes — `/api/v1/likes`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/likes/toggle/v/:videoId` | Like/unlike a video |
| POST | `/api/v1/likes/toggle/c/:commentId` | Like/unlike a comment |
| GET | `/api/v1/likes/videos` | Get all videos liked by the current user |

### Subscription Routes — `/api/v1/subscriptions`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/subscriptions/subscribed-channels` | Get channels the current user is subscribed to |
| GET | `/api/v1/subscriptions/u/:channelId` | Get subscribers of a channel |
| POST | `/api/v1/subscriptions/u/:channelId` | Subscribe/unsubscribe to a channel |

### Playlist Routes — `/api/v1/playlists`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/playlists` | Create a new playlist |
| GET | `/api/v1/playlists/:playlistId` | Get a playlist by ID |
| PATCH | `/api/v1/playlists/:playlistId` | Update playlist details |
| DELETE | `/api/v1/playlists/:playlistId` | Delete a playlist |
| PATCH | `/api/v1/playlists/add/:videoId/:playlistId` | Add a video to a playlist |
| PATCH | `/api/v1/playlists/remove/:videoId/:playlistId` | Remove a video from a playlist |
| GET | `/api/v1/playlists/user/:userId` | Get all playlists created by a user |

### Dashboard Routes — `/api/v1/dashboard`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/dashboard/stats` | Get channel statistics (views, subscribers, likes, video count) |
| GET | `/api/v1/dashboard/videos` | Get all videos uploaded by the current user |

### Healthcheck Route — `/api/v1/healthcheck`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/healthcheck` | Check if the API is running |

---

## Response Format

All responses follow a consistent shape:

**Success:**
```json
{
  "statusCode": 200,
  "data": { },
  "message": "Description of what happened",
  "success": true
}
```

**Error:**
```json
{
  "statusCode": 400,
  "message": "Description of the error",
  "success": false,
  "errors": []
}
```

---

## Testing This API

**Recommended order for a full walkthrough:**
1. `POST /users/register` — create an account (with avatar image)
2. `POST /users/login` — log in (cookies get set automatically in Postman)
3. `POST /videos` — upload a video (with thumbnail)
4. `GET /videos` — confirm it shows up in the listing
5. `POST /comments/:videoId` — add a comment
6. `POST /likes/toggle/v/:videoId` — like the video
7. `POST /subscriptions/u/:channelId` — subscribe to another user's channel
8. `POST /playlists` — create a playlist, then `PATCH /playlists/add/:videoId/:playlistId` to add a video to it
9. `GET /dashboard/stats` — check your channel's aggregated stats

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
