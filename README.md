# Real-Time Employee Task Management Tool

A full-stack employee task management system built with React, Express, Firebase, Firestore, Firebase Authentication, and Socket.IO.

The application allows owners/managers to authenticate through phone number verification, manage employees, send employee account setup links, and communicate with employees through real-time chat.


## Features

- Owner login with Firebase Phone Authentication
- Role-based access control for owner and employee pages
- Employee creation and management
- Employee account setup through secure email verification link
- Firebase Authentication for employee accounts
- Firestore user profile storage
- Real-time one-to-one chat using Socket.IO
- Responsive dashboard layout


## Tech Stack

The structure and some of the code were reused from one of my previous projects: https://github.com/BuiNhienLoc/MediMe

### Frontend
- React
- React Router
- Firebase Web SDK
- Firestore
- Firebase Authentication
- Socket.IO Client
- Ant Design
- Material UI DataGrid
- React Icons

### Backend
- Node.js
- Express
- Firebase Admin SDK
- Firestore
- Nodemailer
- Socket.IO
- dotenv
- bcrypt
- crypto

---

## Project Structure

```txt
taskmanager/
├── client/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── firebase.js
│   │   └── socket.js
│   └── package.json
│
└── server/
    ├── config/
    │   └── firebase.js
    ├── controllers/
    │   ├── authController.js
    │   └── employeeController.js
    ├── routes/
    │   ├── authRoutes.js
    │   └── employeeRoutes.js
    ├── services/
    │   └── emailService.js
    ├── server.js
    └── package.json

```

## SMS Log In Initial Approach

The original plan used a custom OTP system:

1. Owner enters phone number.
2. Express generates a 6-digit code.
3. Code is stored in Firestore.
4. Twilio sends the SMS.
5. Express validates the OTP.
6. Backend creates a Firebase custom token.
Frontend signs in with the custom token.

This worked, but Twilio does not allow SMS messages to be sent on a free trial account.The code can be tested by extracting the body of the sent Twilio message and using the OTP value directly in the frontend. However, this only works for testing purposes.

## SMS Log In Final Approach

The project was later updated to use Firebase Phone Authentication:

1. Owner enters phone number.
2. Express checks whether the phone number belongs to an active owner in Firestore.
3. Firebase sends the SMS verification code.
4. Firebase verifies the code.
5. Firebase creates the authenticated user session.
6. Protected routes check the user role from Firestore.

This approach is cleaner because Firebase handles SMS verification and creates the authenticated session directly.

**However, because of Firebase's new security measures, authourized domains do not work with localhost. So 127.0.0.1 was added to the authorized domains in Firebase Console, and the demo was updated to 127.0.0.1. Depending on the deployment environment, you may need to adjust the authorized domains accordingly.**

## Firebase Collections

```
users
{
  uid: "firebase-auth-uid",
  name: "User Name",
  email: "user@example.com",
  phoneNumber: "+14582724423",
  role: "owner" | "employee",
  avatar: null,
  avatarPath: null,
  isOnline: false,
  isActive: true,
  accountSetupComplete: true,
  createdAt: timestamp
}

employeeInvites
{
  employeeId: "firestore-user-doc-id",
  email: "employee@example.com",
  tokenHash: "hashed-token",
  used: false,
  expiresAt: timestamp,
  createdAt: timestamp
}

tasks
{
  assignedTo: "firestore-user-doc-id",
  assignedToName: "Employee Name",
  createdAt: timestamp,
  createdBy: "firestore-user-doc-id",
  description: "task-description",
  dueDate: timestamp,
  priority: "low" | "medium" | "high",
  status: "pending" | "in-progress" | "completed",
  title: "Task Title",
  updatedAt: timestamp
}
```
## Setup Instructions
1. Clone the repository
```bash
git clone https://github.com/BuiNhienLoc/taskmanager.git
cd taskmanager
```
### Frontend Setup


2. Install frontend dependencies
```bash
cd client
npm install
```
3. Create frontend .env

Create a .env file inside the client folder:
```text
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
```
Do not put Firebase Admin credentials in the frontend. That would be a public self-own with extra steps.

4. Start frontend
```bash
npm start
```

Frontend runs on:

http://127.0.0.1:3000


Make sure the URL matches your backend CORS settings.

### Backend Setup
5. Install backend dependencies
```bash
cd server
npm install
```
6. Create backend .env

Create a .env file inside the server folder:

```text
PORT=5000
CLIENT_URL=http://127.0.0.1:3000

FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key_here\n-----END PRIVATE KEY-----\n"

EMAIL_USER=your_email@gmail.com
EMAIL_APP_PASSWORD=your_gmail_app_password
```
7. Start backend in development mode
```bash
npm run dev
```

Backend runs on:

http://127.0.0.1:5000

## Firebase Configuration

In Firebase Console:

1. Go to Authentication.
2. Enable Email/Password authentication.
3. Enable Phone authentication.
4. Add authorized domains:
   - localhost
   - 127.0.0.1
5. For development, add Firebase test phone numbers.

Example test number:

```
Phone: +14582724423
Code: 123456
```

Using test numbers avoids SMS billing and rate limits during development.

## Screenshots

Add screenshots in this section before submission.

### Landing Page

![Landing Page](./screenshots/landing.png)

### Owner Login

![Landing Page to Owner Login](./screenshots/landing_owner.png)

![Owner Login](./screenshots/login_owner_init.png)

![Owner Login Phone Entered](./screenshots/login_owner_after.png)

![Owner Login Code Sent](./screenshots/login_owner_code_sent.png)

### Dashboard

![Dashboard](./screenshots/dashboard_owner.png)

### Employee Management

![Employee Management](./screenshots/user_management.png)

![View Profile](./screenshots/view_profile.png)

![Edit Employee](./screenshots/update_user.png)

![Add Employee](./screenshots/add_user.png)

![Email Received](./screenshots/email.png)

### Employee Setup Page
![Employee Setup](./screenshots/user-register.png)

### Employee Login

![landing to employee login](./screenshots/landing_employee.png)

![Employee Login](./screenshots/login_employee.png)

### Employee Dashboard

![Employee Dashboard](./screenshots/dashboard_user.png)

### Real-Time Chat

![Chat](./screenshots/messages.png)

![Chat](./screenshots/messages_2.png)

### Task Management

![Task Management](./screenshots/owner_tasks.png)
![Task Management](./screenshots/employee_tasks.png)

### Firebase Screenshot

![Firebase](./screenshots/firebase_1.png)
![Firebase2](./screenshots/firebase_2.png)
![Firebase3](./screenshots/firebase_3.png)
![Firebase4](./screenshots/firebase_4.png)

## Future Improvements
- Add stronger Firestore security rules
- Persist Socket.IO messages to Firestore

