# Real-Time Polling System with Commenting Feature and Enhanced User Profiles

## Overview

This is a **Real-Time Polling System** built using the **MERN stack (MongoDB, Express, React, Node.js)** and **Socket.IO** to provide real-time updates. The system allows users to create polls, vote in polls, view poll results, comment on polls, and view their user profiles. The results update in real-time as new votes and comments are received.

### Features:
- **Real-Time Poll Results**: View live updates on poll results as new votes are cast using **Socket.IO**.
- **Commenting System**: Users can add comments to polls and reply to comments, creating threads.
- **User Profiles**: Each user has a profile with their created and voted polls, and they can upload a profile picture.
- **User Authentication**: JWT-based login and registration system. Users can only vote once per poll when logged in.
- **Notifications**: Users get real-time notifications when their polls receive new votes or comments.

## Project Setup

This project consists of both a **frontend** and **backend**, which should be run in separate terminals.

### Frontend (React)
1. Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2. Install dependencies:
    ```bash
    npm install
    ```
3. Start the development server:
    ```bash
    npm run dev
    ```
   The frontend will be available at [http://localhost:5173](http://localhost:5173).

### Backend (Node.js/Express)
1. Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2. Install dependencies:
    ```bash
    npm install
    ```
3. Start the backend server using `nodemon`:
    ```bash
    nodemon server.js
    ```
   The backend will be available at [http://localhost:3000](http://localhost:3000).

## Features Breakdown

### 1. **Frontend (React)**
- **Poll Creation**: Users can create new polls by providing a question and a list of options.
- **Poll Voting**: Users can vote on polls. Each vote is saved, and results are displayed in real-time.
- **Real-Time Results**: Poll results update live as new votes are received, using **Socket.IO** for real-time functionality.
- **User Interface**: Components are structured to ensure smooth navigation between the poll creation, voting, and results pages.

### 2. **Backend (Express/Node.js)**
- **RESTful APIs**: Implemented for creating polls, voting, retrieving poll results, adding comments, and retrieving user profiles.
- **Database (MongoDB)**: Stores polls, votes, comments, and user profiles. Each poll has a question and options, votes reference a poll and an option, comments can reference another comment (for replies).
- **User Authentication (JWT)**: Users must register and log in to vote. JWT tokens are used for secure authentication.
- **Socket.IO**: Used to broadcast real-time updates of poll results and new comments.

### 3. **Additional Features**
- **Commenting System**: Users can comment on polls and reply to existing comments, forming a threaded conversation.
- **User Profile**: Each user has a profile page that includes their username, email, profile picture, a list of polls they’ve created, and a list of polls they’ve voted on.
- **File Upload for Profile Picture**: Users can upload a profile picture, which is handled by the server.
- **User Notifications (Bonus)**: Users receive notifications when their polls receive new votes or comments.

## Technologies Used
- **Frontend**: React, Axios, Tailwind CSS, React Router
- **Backend**: Node.js, Express, Socket.IO
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Handling profile picture uploads
- **Real-Time Updates**: Socket.IO

## How to Contribute

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Commit your changes.
4. Push your branch to your forked repository.
5. Submit a pull request for review.

---



