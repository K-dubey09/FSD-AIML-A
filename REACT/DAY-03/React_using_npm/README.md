# Book Store (React + Parcel)

This is a simple React bookstore app using Vite for development and build.

Features added in the redesign:
- Modern responsive UI and improved styles
- Product covers and detail modal
- Checkout form (stores orders in localStorage)
- Orders page (view past orders)

Run the app locally and use the top navigation to switch between Home and Orders.

Backend (API)
1. Start the Express API server (stores data in `data/*.json`):

```powershell
npm run server
```

The server listens on http://localhost:4000 by default and exposes these endpoints:
- POST /api/auth/login — login (demo users: admin/admin, user/user)
- GET/POST/PUT/DELETE /api/books — books CRUD (admin only for write)
- GET /api/orders (admin only)
- POST /api/orders — create an order (public)

Notes
- In this demo the server uses simple JWTs and a small in-memory user list. For production use a real auth provider and a database.

## Run locally

1. Install dependencies:

```powershell
cd "d:\SEM-V\fsd sem-v\REACT\DAY-03\React_using_npm"
npm install
```


2. Start dev server (Parcel with HMR):

```powershell
npm run dev
# or
npm start
# opens on http://localhost:3000 by default
```

3. Build production files:

```powershell
npm run build
# output will be in the `dist/` folder
```

Features added:
- Search by title or author
- Cart with quantity controls
- Cart persisted to localStorage
- Simple checkout modal
