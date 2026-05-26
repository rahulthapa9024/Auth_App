# Auth App

A full-stack authentication app with:

- Express + TypeScript backend
- PostgreSQL + Prisma user storage
- Redis for OTP storage, OTP cooldowns, and JWT logout blacklisting
- Firebase Google login
- Email OTP login through Resend
- React + Redux Toolkit frontend

## Project Structure

```txt
backend/
  index.ts
  src/
    controllers/
    middlewares/
    routers/
    config/
    utils/
  prisma/

frontend/
  src/
    Components/
    Hooks/
    pages/
    slice/
    store/
    utils/
```

## Backend Setup

Install dependencies:

```bash
cd backend
npm install
```

Run the backend:

```bash
npm run dev
```

Backend runs on:

```txt
http://localhost:3000
```

Required backend environment variables live in `backend/.env`.

```env
DATABASE_URL=
JWT_SECRET=

REDIS_USERNAME=
REDIS_PASSWORD=
REDIS_HOST=
REDIS_PORT=

RESEND_API_KEY=
```

The backend explicitly loads `backend/.env`, so it works even if the app is started from another directory.

## Frontend Setup

Install dependencies:

```bash
cd frontend
npm install
```

Run the frontend:

```bash
npm run dev
```

Frontend runs on:

```txt
http://localhost:5173
```

Axios API base URL is configured in:

```txt
frontend/src/utils/axiosClient.ts
```

Current base URL:

```ts
http://localhost:3000
```

## Authentication Flow

The backend stores the JWT in an HTTP-only cookie named:

```txt
token
```

Cookie settings:

- `httpOnly: true`
- `secure: false`
- `sameSite: "lax"`
- `maxAge: 7 days`

Frontend requests include credentials through Axios:

```ts
withCredentials: true
```

On logout, the token is also blacklisted in Redis until the JWT expires. This prevents a logged-out token from being reused.

## User Model

Defined in `backend/prisma/schema.prisma`.

```prisma
model User {
  id          Int      @id @default(autoincrement())
  firebaseUid String? @unique
  email       String   @unique
  userName    String?
  photoURL    String?
  phoneNumber String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## Backend API Routes

All auth routes are mounted under:

```txt
/auth
```

Router file:

```txt
backend/src/routers/userRouts.ts
```

### POST `/auth/signup`

Used for Firebase Google authentication.

Middleware:

```txt
guestMiddleware
```

Request body:

```json
{
  "firebaseToken": "firebase-id-token"
}
```

Behavior:

- Verifies the Firebase ID token.
- Extracts user data from Firebase.
- Finds an existing user by email.
- Creates the user if it does not exist.
- Creates a 7-day JWT.
- Stores the JWT in the `token` cookie.
- Returns the authenticated user.

Success response:

```json
{
  "success": true,
  "message": "Authentication successful",
  "token": "jwt-token",
  "user": {
    "id": 1,
    "firebaseUid": "firebase-uid",
    "email": "user@example.com",
    "userName": "User Name",
    "photoURL": "https://...",
    "phoneNumber": null,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

Common errors:

- `400` - Firebase token required
- `400` - Email not found
- `500` - Firebase/authentication failure

### POST `/auth/send-otp`

Used to send a 6-digit OTP to an existing user's email.

Middleware:

```txt
guestMiddleware
```

Request body:

```json
{
  "email": "user@example.com"
}
```

Behavior:

- Validates email is present.
- Checks that the user exists.
- Checks Redis cooldown key.
- Generates a 6-digit OTP.
- Hashes the OTP with bcrypt.
- Stores the hashed OTP in Redis for 5 minutes.
- Stores a cooldown key in Redis for 30 seconds.
- Sends the OTP email using Resend.

Redis keys:

```txt
otp:{email}        expires in 5 minutes
cooldown:{email}   expires in 30 seconds
```

Success response:

```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```

Common errors:

- `400` - Email is required
- `404` - User does not exist
- `429` - Please wait before requesting another OTP
- `500` - Failed to send OTP

### POST `/auth/verify-otp`

Used to verify the OTP and log the user in.

Middleware:

```txt
guestMiddleware
```

Request body:

```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

Behavior:

- Validates email and OTP.
- Reads the hashed OTP from Redis.
- Verifies the OTP using bcrypt.
- Deletes the OTP from Redis after successful verification.
- Finds the user by email.
- Creates the user if it does not exist.
- Creates a 7-day JWT.
- Stores the JWT in the `token` cookie.
- Returns the authenticated user.

Success response:

```json
{
  "success": true,
  "message": "OTP verified successfully",
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

Common errors:

- `400` - Email and OTP required
- `400` - OTP expired
- `400` - Invalid OTP
- `500` - OTP verification failed

### GET `/auth/checkAuth`

Used by the frontend on app load or refresh to restore the logged-in user from the cookie.

Middleware:

```txt
authMiddleware
```

Request:

- No request body.
- Browser must send the `token` cookie.

Behavior:

- Reads the JWT from the cookie.
- Checks if the token is blacklisted.
- Verifies the JWT.
- Attaches decoded user data to `req.user`.
- Fetches the user from the database.
- Returns the user and `isAuthenticated: true`.

Success response:

```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com"
  },
  "isAuthenticated": true
}
```

Common errors:

- `401` - No User is Logged In
- `401` - Token has been logged out
- `401` - Invalid token
- `404` - User not found
- `500` - Something went wrong

### POST `/auth/logout`

Used to log the user out.

Middleware:

```txt
authMiddleware
```

Request:

- No request body.
- Browser must send the `token` cookie.

Behavior:

- Reads the JWT from the current request.
- Decodes its expiry.
- Stores a SHA-256 hash of the token in Redis until the JWT expiry.
- Clears the `token` cookie.

Redis blacklist key:

```txt
blacklistedToken:{sha256-token-hash}
```

Success response:

```json
{
  "success": true,
  "message": "Logout successful"
}
```

Common errors:

- `401` - No User is Logged In
- `401` - Invalid token
- `500` - Logout failure

## Backend Middleware

### `authMiddleware`

File:

```txt
backend/src/middlewares/authMiddleware.ts
```

Used on protected routes.

Responsibilities:

- Read `token` from cookies.
- Reject missing tokens.
- Reject blacklisted tokens.
- Verify JWT with `JWT_SECRET`.
- Attach decoded payload to `req.user`.
- Attach raw token to `req.token`.

### `guestMiddleware`

File:

```txt
backend/src/middlewares/guestMiddleware.ts
```

Used on guest-only routes such as signup, send OTP, and verify OTP.

Responsibilities:

- If no token exists, allow the request.
- If the token is blacklisted, allow the request.
- If the token is valid, reject with `You are already logged in`.
- If the token is invalid, allow the request.

## Frontend API Hooks

File:

```txt
frontend/src/Hooks/AuthHooks.ts
```

These are plain async API helpers used by React components.

### `userRegister(data)`

Used for Google login/signup.

Signature:

```ts
userRegister(data: { firebaseToken: string }): Promise<RegisterResponse>
```

Calls:

```txt
POST /auth/signup
```

Example:

```ts
const res = await userRegister({ firebaseToken });
```

Returns:

```ts
{
  success: boolean;
  message: string;
  user: User;
}
```

### `sendOtp(email)`

Used to send an email OTP.

Signature:

```ts
sendOtp(email: string): Promise<OtpResponse>
```

Calls:

```txt
POST /auth/send-otp
```

Example:

```ts
await sendOtp(email);
```

Returns:

```ts
{
  success: boolean;
  message: string;
}
```

### `verifyOtp(email, otp)`

Used to verify OTP and log the user in.

Signature:

```ts
verifyOtp(email: string, otp: string): Promise<VerifyOtpResponse>
```

Calls:

```txt
POST /auth/verify-otp
```

Example:

```ts
const res = await verifyOtp(email, code);
```

Returns:

```ts
{
  success: boolean;
  message: string;
  user: User;
}
```

## Frontend Utilities

### `axiosClient`

File:

```txt
frontend/src/utils/axiosClient.ts
```

Configured Axios instance.

```ts
const axiosClient = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});
```

`withCredentials: true` is required so the browser sends and receives the HTTP-only auth cookie.

### `getErrorMessage`

File:

```txt
frontend/src/utils/errorMessage.ts
```

Formats API, Axios, network, and unknown errors into user-friendly messages.

Important network message:

```txt
Could not reach the server. Please make sure the backend is running and try again.
```

## Redux Store

File:

```txt
frontend/src/store/store.ts
```

The app uses Redux Toolkit.

```ts
export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});
```

Exported types:

```ts
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

Use these types with React Redux:

```ts
const dispatch = useDispatch<AppDispatch>();
const auth = useSelector((state: RootState) => state.auth);
```

## Redux Auth Slice

File:

```txt
frontend/src/slice/authSlice.ts
```

Slice name:

```txt
auth
```

### State Shape

```ts
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}
```

Initial state:

```ts
{
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
}
```

`loading` starts as `true` so the app can wait for `/auth/checkAuth` before deciding whether a session exists.

### User Type

```ts
interface User {
  id: string;
  email: string;
  userName?: string | null;
  photoURL?: string | null;
  phoneNumber?: string | null;
}
```

### Async Thunks

#### `checkAuth`

Calls:

```txt
GET /auth/checkAuth
```

Used in:

```txt
frontend/src/App.tsx
```

Purpose:

- Runs when the app loads.
- Restores the user from the backend cookie session.
- If the cookie is valid, sets `isAuthenticated` to `true`.
- If not logged in, sets `isAuthenticated` to `false`.

State behavior:

- `pending`: `loading = true`
- `fulfilled`: stores user, `isAuthenticated = true`, `loading = false`
- `rejected`: clears user, `isAuthenticated = false`, `loading = false`

#### `logoutAsync`

Calls:

```txt
POST /auth/logout
```

Purpose:

- Logs out on the backend.
- Blacklists the current JWT.
- Clears the frontend auth state.

State behavior:

- `pending`: `loading = true`
- `fulfilled`: clears user, `isAuthenticated = false`, `loading = false`
- `rejected`: still clears user, `isAuthenticated = false`, `loading = false`

### Reducer Actions

#### `setUser`

Used after Google login or OTP verification succeeds.

```ts
dispatch(setUser(user));
```

Effect:

- Stores the user.
- Sets `isAuthenticated = true`.

#### `logoutUser`

Local-only logout reset.

```ts
dispatch(logoutUser());
```

Effect:

- Clears the user.
- Sets `isAuthenticated = false`.

Most logout flows should use `logoutAsync` instead, because it also calls the backend and blacklists the token.

## Frontend Pages and Components

### `App.tsx`

Responsibilities:

- Dispatches `checkAuth()` on app load.
- Shows loading while the auth check is running.
- Defines routes.

Routes:

```txt
/        -> Home
/signup  -> Login/signup page
```

Home is public. It can be visited even when `isAuthenticated` is false.

### `SighUp.tsx`

Current login/signup page.

Responsibilities:

- Google login with Firebase.
- Email OTP send.
- OTP verification.
- Success and error display.
- Dispatches `setUser()` after successful login.

### `NavBar.tsx`

Responsibilities:

- Shows app logo.
- Shows Sign Up button for guests.
- Shows welcome text and Signout button for logged-in users.
- Opens the logout confirmation modal.

### `ConfirmLogout.tsx`

Responsibilities:

- Confirms logout before calling `logoutAsync`.
- Shows logout errors inside the modal.

### `StatusMessage.tsx`

Reusable status alert for success and error messages.

## Common Development Issues

### `ERR_CONNECTION_REFUSED` on `/auth/send-otp`

This means the frontend is running, but the backend is not listening on `localhost:3000`.

Fix:

```bash
cd backend
npm run dev
```

### `/auth/checkAuth` returns `401`

This is normal when the user is not logged in.

The frontend uses this response to set:

```ts
isAuthenticated = false
```

It does not block public pages like `Home.tsx`.

### Redis port error

If Redis shows an invalid port error, check:

```env
REDIS_PORT=
```

It must be a valid number from `0` to `65535`.

## Running Locally with Docker

Docker lets you spin up the entire stack — backend and frontend — with a single command, without installing Node.js, configuring Redis, or setting up a database manually on your machine.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.
- A Redis instance reachable from your machine (e.g. Redis Cloud, Upstash, or a local Redis container).
- A PostgreSQL database reachable from your machine (e.g. Supabase, Neon, or a local Postgres container).
- `backend/.env` and `frontend/.env` files filled in (see env sections below).

### Docker Files Overview

#### `backend/dockerfile`

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
```

- Based on the official **Node 20 Alpine** image (small footprint).
- Sets `/app` as the working directory inside the container.
- Copies `package.json` and `package-lock.json` first so Docker can cache the `npm install` layer — rebuilds are faster when only source files change.
- Copies the rest of the source code.
- Exposes port `3000` (the backend dev server port).
- Starts the backend with `npm run dev`.

#### `frontend/dockerfile`

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev"]
```

- Same structure as the backend Dockerfile.
- Exposes port `5173` (the Vite dev server port).
- The `docker-compose.yml` overrides the CMD to pass `--host` so Vite binds to `0.0.0.0` and is reachable from outside the container.

#### `backend/.dockerignore` and `frontend/.dockerignore`

```txt
node_modules
.env
```

- **`node_modules`** is excluded so the host's `node_modules` folder is never copied into the image. Dependencies are installed fresh inside the container.
- **`.env`** is excluded from the image for security. Environment variables are injected at runtime via `docker-compose.yml` using the `env_file` directive.

#### `docker-compose.yml`

```yaml
services:
  backend:
    build: ./backend

    ports:
      - "3000:3000"

    volumes:
      - ./backend:/app
      - /app/node_modules

    env_file:
      - ./backend/.env

    command: npm run dev

  frontend:
    build: ./frontend

    ports:
      - "5173:5173"

    volumes:
      - ./frontend:/app
      - /app/node_modules

    env_file:
      - ./frontend/.env

    command: npm run dev -- --host
```

Key points:

| Setting | Purpose |
|---|---|
| `build: ./backend` | Builds the image from `backend/dockerfile` |
| `ports: "3000:3000"` | Maps host port 3000 to container port 3000 |
| `volumes: ./backend:/app` | Mounts the local source folder into the container so live edits reflect immediately (hot reload) |
| `volumes: /app/node_modules` | Anonymous volume that preserves the container's `node_modules` so the host mount does not override it |
| `env_file: ./backend/.env` | Loads all variables from `backend/.env` into the container's environment |
| `command: npm run dev -- --host` | Overrides the frontend CMD to bind Vite to `0.0.0.0` so the dev server is accessible on the host |

### Step-by-Step: Run the Full Stack with Docker

**1. Create your environment files**

Create `backend/.env`:

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=your-jwt-secret

REDIS_USERNAME=default
REDIS_PASSWORD=your-redis-password
REDIS_HOST=your-redis-host
REDIS_PORT=6379

RESEND_API_KEY=your-resend-api-key
```

Create `frontend/.env` (if needed for Firebase config):

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
```

**2. Build and start both services**

Run this from the project root (the directory that contains `docker-compose.yml`):

```bash
docker compose up --build
```

- `--build` forces Docker to rebuild images. Omit it on subsequent runs if nothing has changed.
- Docker will pull the base image, install dependencies, and start both containers.

**3. Access the app**

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000 |

**4. Stop the containers**

```bash
docker compose down
```

This stops and removes the containers but keeps the built images cached.

### Useful Docker Commands

```bash
# Start in detached (background) mode
docker compose up -d --build

# View logs from both services
docker compose logs -f

# View logs from only the backend
docker compose logs -f backend

# Rebuild only the backend image
docker compose build backend

# Stop and remove containers and anonymous volumes
docker compose down -v

# Open a shell inside the running backend container
docker compose exec backend sh
```

### Common Docker Issues

#### Port already in use

```txt
Error: address already in use 0.0.0.0:3000
```

Another process is using port 3000 or 5173. Stop that process or change the host port in `docker-compose.yml`:

```yaml
ports:
  - "3001:3000"   # maps host 3001 -> container 3000
```

#### `node_modules` conflicts

If you see module-not-found errors after switching between running locally and Docker, it's usually a `node_modules` mismatch. Remove the anonymous volume and rebuild:

```bash
docker compose down -v
docker compose up --build
```

#### Cannot connect to Redis or PostgreSQL

Make sure your `backend/.env` uses a host that is reachable from inside the Docker container. `localhost` inside the container refers to the container itself, not your host machine. Use:

- The actual service hostname (e.g. Redis Cloud hostname).
- `host.docker.internal` if the service is running on your Mac host:

```env
REDIS_HOST=host.docker.internal
```

---

## Build Commands

Backend type check:

```bash
cd backend
npx tsc --noEmit
```

Frontend build:

```bash
cd frontend
npm run build
```