# Course & Category Management API with Authentication

A RESTful backend built with **Node.js**, **Express.js**, **MongoDB**, and **Mongoose**, featuring Category management, Course management with Mongoose ObjectId referencing, and User Authentication with **bcrypt** password hashing and **JWT** (JSON Web Tokens).

---

## 📁 Project Architecture

```
.
├── .env.example
├── .env
├── package.json
├── README.md
├── tests/
│   └── test.js                  # Automated test suite
└── src/
    ├── config/
    │   └── db.js                # MongoDB connection
    ├── models/
    │   ├── Category.js          # Phase 1: Category Mongoose Model
    │   ├── Course.js            # Phase 2: Course Mongoose Model (ref: Category)
    │   └── User.js              # Phase 3: User Mongoose Model
    ├── controllers/
    │   ├── categoryController.js # Category CRUD controllers
    │   ├── courseController.js   # Course CRUD controllers
    │   └── authController.js     # Register & Login controllers
    ├── routes/
    │   ├── categoryRoutes.js    # /api/categories router
    │   ├── courseRoutes.js      # /api/courses router
    │   └── authRoutes.js        # /api/auth router
    ├── middleware/
    │   └── authMiddleware.js    # JWT verification middleware
    ├── app.js                   # Express application setup
    └── server.js                # Server entry point
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/hometask_db
JWT_SECRET=home_task_super_secret_jwt_key_2026
JWT_EXPIRES_IN=1d
```

### 3. Run the Server
```bash
# Production / Normal start
npm start

# Development mode (with file watcher)
npm run dev
```

### 4. Run Automated Tests
```bash
npm test
```

---

## 📌 API Endpoints & Specification

### Phase 1: Category Module (`/api/categories`)
Model fields: `name` (String, required, unique), `description` (String), `timestamps`.

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/categories` | Create a new category |
| `GET` | `/api/categories` | Get all categories |
| `GET` | `/api/categories/:id` | Get single category by ID |
| `PUT` / `PATCH` | `/api/categories/:id` | Update category by ID |
| `DELETE` | `/api/categories/:id` | Delete category by ID |

#### Example Request: Create Category
```http
POST /api/categories
Content-Type: application/json

{
  "name": "Web Development",
  "description": "Frontend, backend, and full-stack development courses"
}
```

---

### Phase 2: Course Module (`/api/courses`)
Model fields: `title` (String, required), `description` (String), `price` (Number), `category` (ObjectId ref to `Category`, required), `timestamps`.

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/courses` | Create a course linked to a Category |
| `GET` | `/api/courses` | Get all courses (supports `?category=<id>` filter, populates category) |
| `GET` | `/api/courses/:id` | Get single course by ID (populates category) |
| `PUT` / `PATCH` | `/api/courses/:id` | Update course by ID |
| `DELETE` | `/api/courses/:id` | Delete course by ID |

#### Example Request: Create Course
```http
POST /api/courses
Content-Type: application/json

{
  "title": "Mastering Node.js & Express",
  "description": "Comprehensive guide to building scalable REST APIs",
  "price": 49.99,
  "category": "660c1d2e8f1b2c001f3e4a5b"
}
```

---

### Phase 3: Auth Module (`/api/auth`)
Model fields: `email` (String, required, unique, lowercase), `password` (String, required, hashed with bcrypt), `timestamps`.

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register new user (checks existence, hashes password with bcrypt, saves to DB, returns JWT token) |
| `POST` | `/api/auth/login` | Login user (finds by email, compares password with bcrypt, returns JWT token) |
| `GET` | `/api/auth/me` | Protected route: Get current user profile (requires `Bearer <token>`) |

#### Example Request: Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "StrongPassword123!"
}
```

#### Example Response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "660c1d2e8f1b2c001f3e4a5c",
    "email": "student@example.com"
  }
}
```

#### Example Request: Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "StrongPassword123!"
}
```

#### Example Response:
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "660c1d2e8f1b2c001f3e4a5c",
    "email": "student@example.com"
  }
}
```

