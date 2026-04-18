# Mr. Smoothy App

Production-ready full-stack food ordering platform for Mr. Smoothy with real-time order tracking, OTP/guest customer login, reward points, admin operations, POS workflows, and inventory management.

## Live Project

- Frontend (Customer + Admin + POS): https://mrsmoothy-frontend.vercel.app
- Backend API: https://mrsmoothy-backend.vercel.app
- API Health Check: https://mrsmoothy-backend.vercel.app/api/health
- Live Orders Board: https://mrsmoothy-frontend.vercel.app/live-orders

## Live User Showcase

This project is designed for live, concurrent users across multiple roles:

- Customers: browse menu, login with OTP or continue as guest, place orders, track token status, and view reward points.
- Admin: manage incoming orders in real time, place walk-in orders, manage menu, export reports, and trigger status updates.
- POS/Counter Staff: operate token-based order workflows for fast in-store processing.
- Kitchen/Operations: monitor live queue and order status progression.

### Real-time behavior used by live users

- Live order updates using Socket.IO.
- Push notifications via Firebase Cloud Messaging (FCM).
- Token-based order tracking from pending to ready/completed.
- Shared live board for active orders.

## Core Functionalities

### Customer App

- OTP-based phone login.
- Guest login support.
- Menu browsing by categories.
- Item customization (bread/cheese/size/protein depending on category).
- Cart and checkout workflow.
- Token-based order confirmation and status tracking.
- Customer dashboard with order history and reward points.
- Foreground order notifications.

### Admin Dashboard

- Real-time order feed and status controls.
- Walk-in order placement.
- Payment state handling.
- QR code generation for ordering.
- Excel export of orders.
- Menu item updates (details, images, availability, badges).
- Basic reporting stats.

### POS + Operations

- POS dashboard for quick token/order handling.
- Live orders board for operational visibility.
- Inventory routes and movement tracking.
- Transaction, branch, and counter route support.

### Rewards and Pricing

- Reward points earning and redemption flow.
- Discount settings support.
- Handling charge and packaging fee logic.

## Tech Stack

### Frontend

- React 18
- Vite 5
- React Router DOM
- Tailwind CSS
- Axios
- Socket.IO Client
- Firebase Web SDK
- React Hot Toast
- Lucide React
- XLSX

### Backend

- Node.js + Express
- MongoDB + Mongoose
- Socket.IO
- Firebase Admin (push notifications)
- JWT + bcryptjs
- Nodemailer + Brevo SDK
- CORS + dotenv

### Deployment

- Vercel (Frontend)
- Vercel (Backend)
- MongoDB Atlas (expected)

## Project Structure

- client: React frontend app
- server: Express API server and business logic
- server/routes: API modules (auth, orders, admin, inventory, transactions, etc.)
- server/models: MongoDB schemas
- server/services: OTP, WhatsApp, and FCM integrations

## API Highlights

- /api/auth: OTP, verify, guest login, Firebase login
- /api/orders: create order, token lookup, customer orders, live board
- /api/admin: admin order management, dashboard actions, QR generation
- /api/customers: profile and FCM token updates
- /api/inventory and /api/inventory-admin: stock and admin inventory actions

## Local Development

### Prerequisites

- Node.js 18+
- npm
- MongoDB connection string
- Firebase credentials (for push)

### 1) Clone and install

Install dependencies separately:

- In client:
  - npm install
- In server:
  - npm install

### 2) Environment variables

Create .env in server with required values (example keys):

- MONGODB_URI
- CLIENT_URL
- PORT
- BREVO_API_KEY (optional)
- GMAIL_USER / GMAIL_PASS (optional fallback)
- Firebase Admin credentials

Create .env in client (optional when using default backend URL):

- VITE_API_URL=https://mrsmoothy-backend.vercel.app

### 3) Run locally

- Client:
  - npm run dev
- Server:
  - npm run dev

## Production Notes

- Frontend is configured to consume backend via VITE_API_URL.
- Backend CORS allows localhost and production frontend origin.
- Socket.IO is enabled for real-time order flow.

## Roadmap Ideas

- Add role-based authentication hardening for admin/POS routes.
- Add analytics dashboard (hourly demand, top items, conversion).
- Add integration tests for critical checkout and admin actions.
- Add CI/CD checks for lint, build, and smoke tests.

---

Built for fast food-cart operations with real-time customer experience and admin control.