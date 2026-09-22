# CareMeds

CareMeds is a full-stack medicine availability and online ordering platform that connects customers with pharmacies through a simple, secure, and user-friendly web application.

Customers can search for medicines, view availability, add items to their cart, place orders, choose delivery or pharmacy pickup, and make payments online or through cash on delivery.

## Features

### Customer Features

- User registration and login
- Email verification
- Google OAuth authentication
- Password reset and password change
- Browse available medicines
- Search and filter medicines
- View medicine details and pharmacy information
- Add, update, and remove cart items
- Place orders for home delivery or pharmacy pickup
- Cash on delivery and Stripe payment support
- View order history and order status
- Download or view order invoices
- Update profile information

### Pharmacy Features

- Pharmacy profile setup
- Add, update, and delete medicines
- Manage stock and medicine prices
- View incoming customer orders
- Update order status
- View order details
- Dispatch orders through Steadfast courier services
- Sandbox mode for courier testing

### Administrator Features

- View platform statistics
- Manage registered users
- Manage pharmacies
- View all orders
- Search and filter users, pharmacies, and orders
- Remove users and pharmacies when required

## Technology Stack

### Frontend

- React
- TypeScript
- Vite
- React Router
- React Bootstrap
- Axios
- Stripe React SDK
- jsPDF

### Backend

- PHP
- Laravel 8
- Laravel Sanctum
- Laravel Socialite
- RESTful API architecture

### Database

- MySQL

### External Services

- Stripe for online payments
- Google OAuth for social authentication
- Resend or SMTP for email delivery
- Steadfast API for courier dispatch

## Project Architecture

```text
CareMeds/
├── client/                 # React + TypeScript frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── config/         # Frontend configuration
│   │   ├── data/           # Static application data
│   │   ├── pages/          # Application pages
│   │   ├── styles/         # Page-specific styles
│   │   └── views/          # Shared layouts and views
│   └── package.json
│
├── server/                 # Laravel backend API
│   ├── app/
│   │   ├── Http/Controllers/
│   │   ├── Models/
│   │   └── Services/
│   ├── config/
│   ├── routes/
│   ├── resources/
│   └── composer.json
│
├── sql/                    # Incremental database schema scripts
├── images/                 # Project screenshots and visual assets
├── Dockerfile              # Production container configuration
├── docker-compose.yml      # Application and MySQL services
└── package.json            # Root-level development scripts
```

## Prerequisites

Make sure the following tools are installed:

- PHP 8.2 or later
- Composer
- Node.js 18 or later
- npm
- MySQL 8.0 or later
- Git

## Local Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Mushfiq-Srijon/Caremeds-SD.git
cd caremeds
```

### 2. Configure the Backend

```bash
cd server
cp .env.example .env
composer install
php artisan key:generate
```

Update the backend `.env` file with your local database configuration:

```env
APP_NAME=CareMeds
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=caremeds_db
DB_USERNAME=root
DB_PASSWORD=your_database_password
```

### 3. Configure the Database

Create a MySQL database:

```sql
CREATE DATABASE caremeds_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

The repository stores the CareMeds schema as incremental SQL scripts in the `sql/` directory. Apply the scripts in their checkpoint order:

1. `sql/checkpoint 1/`
2. `sql/CheckPoint 2/`
3. `sql/CheckPoint 3/`
4. `sql/Final CheckPoint/`

Some files are incremental `ALTER TABLE` or data-update scripts. Do not rerun a script if the corresponding change has already been applied to the database.

### 4. Configure the Frontend

From the project root:

```bash
cd client
cp .env.example .env
```

Set the backend endpoint in `client/.env`:

```env
VITE_BACKEND_ENDPOINT=http://localhost:8000
VITE_STRIPE_KEY=your_stripe_publishable_key
```

### 5. Start the Backend

```bash
cd server
php artisan serve
```

The Laravel API will be available at:

```text
http://localhost:8000
```

### 6. Start the Frontend

Open a new terminal:

```bash
cd client
npm install
npm run dev
```

The frontend will be available at:

```text
http://localhost:5173
```

## Docker Installation

The project includes Docker support for running the Laravel application and MySQL database together.

Create a root `.env` file based on `.env.docker` and update the values as required:

```env
APP_ENV=local
APP_KEY=your_application_key
APP_DEBUG=true
APP_URL=http://localhost
FRONTEND_URL=http://localhost
DB_PASSWORD=your_database_password
```

Start the services:

```bash
docker compose up --build
```

The application will be available at:

```text
http://localhost
```

Stop the services with:

```bash
docker compose down
```

To remove the database volume as well:

```bash
docker compose down -v
```

## Available Scripts

### Root Scripts

```bash
npm run start:client
npm run start:server
npm run build:client
npm run build:prod
```

### Frontend Scripts

```bash
cd client

npm run dev       # Start the Vite development server
npm run build     # Type-check and build the frontend
npm run lint      # Run ESLint
npm run preview   # Preview the production build
```

### Backend Scripts

```bash
cd server

php artisan serve    # Start the Laravel development server
php artisan test     # Run backend tests
```

## Environment Variables

### Backend Variables

```env
APP_NAME
APP_ENV
APP_KEY
APP_DEBUG
APP_URL
FRONTEND_URL

DB_CONNECTION
DB_HOST
DB_PORT
DB_DATABASE
DB_USERNAME
DB_PASSWORD

GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI

STRIPE_KEY
STRIPE_SECRET
STRIPE_WEBHOOK_SECRET

RESEND_API_KEY

STEADFAST_API_KEY
STEADFAST_SECRET_KEY
STEADFAST_SANDBOX
```

### Frontend Variables

```env
VITE_BACKEND_ENDPOINT
VITE_STRIPE_KEY
```

Never commit real API keys, database passwords, application keys, or other sensitive credentials to version control.

## API Overview

All API endpoints are prefixed with `/api`.

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/register` | Register a new user |
| POST | `/api/login` | Authenticate a user |
| GET | `/api/auth/google` | Start Google OAuth authentication |
| GET | `/api/auth/google/callback` | Handle Google OAuth callback |
| POST | `/api/forgot-password` | Request a password reset |
| POST | `/api/reset-password` | Reset a password |
| GET | `/api/email/verify/{id}/{hash}` | Verify a user's email |

### Medicines

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/medicines` | List available medicines |
| GET | `/api/medicines/{id}` | View medicine details |
| POST | `/api/medicines` | Add a medicine |
| PUT | `/api/medicines/{id}` | Update a medicine |
| DELETE | `/api/medicines/{id}` | Delete a medicine |
| GET | `/api/locations` | Retrieve available locations |

### Cart and Orders

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/cart` | View the authenticated user's cart |
| POST | `/api/cart/add` | Add an item to the cart |
| PUT | `/api/cart/update` | Update cart quantity |
| DELETE | `/api/cart/remove/{id}` | Remove a cart item |
| DELETE | `/api/cart/clear` | Clear the cart |
| POST | `/api/orders` | Place a new order |
| GET | `/api/my-orders` | View the user's orders |
| GET | `/api/orders/{id}/invoice` | Retrieve invoice information |

### Pharmacy Management

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/pharmacy/profile` | View pharmacy profile |
| POST | `/api/pharmacy/setup` | Create or update pharmacy profile |
| GET | `/api/pharmacy/medicines` | View pharmacy medicines |
| GET | `/api/pharmacy/orders` | View pharmacy orders |
| PUT | `/api/pharmacy/orders/{id}/status` | Update order status |
| GET | `/api/pharmacy/orders/{id}/items` | View order items |
| POST | `/api/pharmacy/orders/{id}/dispatch` | Dispatch an order through Steadfast |

### Payments

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/payment/create-intent` | Create a Stripe payment intent |
| POST | `/api/payment/webhook` | Process Stripe payment events |

### Administration

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/stats` | Retrieve platform statistics |
| GET | `/api/admin/users` | List and search users |
| GET | `/api/admin/pharmacies` | List and search pharmacies |
| GET | `/api/admin/orders` | List and search orders |
| DELETE | `/api/admin/users/{id}` | Delete a user |
| DELETE | `/api/admin/pharmacies/{id}` | Delete a pharmacy |

Protected endpoints require a Laravel Sanctum bearer token:

```http
Authorization: Bearer <your_access_token>
```

## Authentication and Authorization

CareMeds uses Laravel Sanctum for API authentication.

The platform supports role-based access for:

- Customers
- Pharmacies
- Administrators

Users must verify their email address before logging in with standard authentication. Google-authenticated users are automatically verified by Google OAuth.

## Payment Options

CareMeds supports:

- Stripe card payments
- Cash on delivery

Stripe payment processing requires both frontend and backend Stripe configuration. Cash on delivery can be used without Stripe.

## Email Services

The system can send:

- Email verification messages
- Password reset links
- Order invoices

Resend is supported for production email delivery. Laravel's configured mail driver can be used as a local-development fallback.

## Courier Integration

Steadfast courier integration is available for pharmacy order dispatch.

For local development, enable sandbox mode:

```env
STEADFAST_SANDBOX=true
```

Sandbox mode generates a test consignment ID instead of sending a real courier request.

## Testing

Run the Laravel test suite:

```bash
cd server
php artisan test
```

Run frontend linting and production build checks:

```bash
cd client
npm run lint
npm run build
```

## Contributors

| Name | Role |
|---|---|
| MD. Mushfiqur Rahman | Team Lead and Backend Developer |
| MD. Mahedi Hasan Oni | Frontend Developer |
| Maimuna Momtaj Emu | Frontend Developer |
| Sabikun Alam | Backend Developer |

## Project Status

CareMeds is under active development. Features, integrations, and deployment configuration may continue to evolve.
