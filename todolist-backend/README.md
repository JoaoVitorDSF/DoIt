# ToDoList Backend

Backend API for a ToDoList application with separate admin and client roles using Node.js, Express, TypeScript, and PostgreSQL.

## Features

- **Separate User Roles**: Admin and Client entities with different privileges
- **Authentication**: JWT-based authentication for both roles
- **Admin Privileges**:
  - View all clients and admins
  - Delete clients
  - View, create, update, and delete ALL todos (from all users)
  - View todos by specific client
- **Client Privileges**:
  - View, create, update, and delete ONLY their own todos
  - View their own profile
- **Password Security**: Passwords hashed with bcrypt

## Tech Stack

- Node.js
- Express
- TypeScript
- PostgreSQL (with TypeORM)
- JWT (jsonwebtoken)
- bcryptjs for password hashing
- CORS enabled

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Edit the `.env` file with your database credentials:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=todolist
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h
```

### 3. Create PostgreSQL Database

```sql
CREATE DATABASE todolist;
```

### 4. Run Development Server

```bash
npm run dev
```

### 5. Build for Production

```bash
npm run build
npm start
```

## API Endpoints

### Authentication

#### Admin
- `POST /api/auth/admin/register` - Register a new admin
- `POST /api/auth/admin/login` - Login as admin

#### Client
- `POST /api/auth/client/register` - Register a new client
- `POST /api/auth/client/login` - Login as client

### Admin Routes (Require Admin Token)

- `GET /api/admin/clients` - Get all clients
- `DELETE /api/admin/clients/:id` - Delete a client
- `GET /api/admin/admins` - Get all admins
- `GET /api/admin/todos` - Get all todos (from all users)
- `POST /api/admin/todos` - Create a todo (as admin)
- `PUT /api/admin/todos/:id` - Update any todo
- `DELETE /api/admin/todos/:id` - Delete any todo
- `GET /api/admin/clients/:id/todos` - Get todos by client ID

### Client Routes (Require Client Token)

- `GET /api/client/todos` - Get own todos
- `POST /api/client/todos` - Create a todo
- `PUT /api/client/todos/:id` - Update own todo
- `DELETE /api/client/todos/:id` - Delete own todo
- `GET /api/client/profile` - Get own profile

## Usage Examples

### Register and Login as Admin

```bash
# Register
curl -X POST http://localhost:3000/api/auth/admin/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin1","password":"admin123","email":"admin@example.com"}'

# Login
curl -X POST http://localhost:3000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin1","password":"admin123"}'
```

### Register and Login as Client

```bash
# Register
curl -X POST http://localhost:3000/api/auth/client/register \
  -H "Content-Type: application/json" \
  -d '{"username":"client1","password":"client123","email":"client@example.com"}'

# Login
curl -X POST http://localhost:3000/api/auth/client/login \
  -H "Content-Type: application/json" \
  -d '{"username":"client1","password":"client123"}'
```

### Using the Token

After login, use the returned token in the Authorization header:

```bash
curl -X GET http://localhost:3000/api/client/todos \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Database Schema

### Admin
- id (Primary Key)
- username (Unique)
- password (Hashed)
- email (Unique)
- createdAt

### Client
- id (Primary Key)
- username (Unique)
- password (Hashed)
- email (Unique)
- createdAt

### Todo
- id (Primary Key)
- title
- description (Optional)
- status (pending, in_progress, completed)
- createdAt
- completedAt (Optional)
- admin (Foreign Key, Nullable)
- client (Foreign Key, Nullable)
