# Recipe Store - Assignment 2

A complete recipe store application with admin panel, user authentication, and cart functionality.

## 🚀 Quick Start

```bash
npm install
npm start
```

Server will run on http://localhost:3000

## 📁 File Structure

```
assignment-2/
├── index.html          # Main store front
├── admin.html          # Admin panel interface
├── admin.js            # Admin panel logic
├── server.js           # Node.js server with authentication
├── package.json        # Dependencies and scripts
├── services/           # Backend services
├── *.json             # Data files (users, orders, products, cart)
└── backups/           # Automatic backups
```

## 🔗 Access Points

- **Store Front**: http://localhost:3000/index.html
- **Admin Panel**: http://localhost:3000/admin.html
- **API Endpoints**: http://localhost:3000/api/

## 👤 Default Accounts

**Admin Account:**
- Username: `admin`
- Password: `admin123`

**User Account:**
- Username: `user`
- Password: `user123`

## ✨ Features

### Store Front
- Browse recipe catalog
- Add items to cart
- User authentication
- Order management

### Admin Panel
- Dashboard with analytics
- Product management
- Order tracking
- User administration
- Real-time charts and statistics

### Backend
- RBAC authentication
- RESTful API
- Data persistence
- Automatic backups
- Session management

## 🛠️ Technology Stack

- **Frontend**: HTML, CSS, JavaScript, Chart.js
- **Backend**: Node.js, Express.js
- **Authentication**: bcryptjs, express-session
- **Data**: JSON file storage
- **Charts**: Chart.js for analytics

## 📊 Admin Dashboard Features

- **Revenue Analytics**: ₹1,630 total revenue tracking
- **Product Management**: 5 diverse menu items
- **Order Tracking**: Real-time status updates
- **User Management**: Role-based access control
- **Interactive Charts**: Sales trends and order distribution

## 🔧 Development

The application uses a clean, modular structure with:
- Separated concerns (frontend/backend)
- Error handling and fallback data
- Professional UI/UX design
- Comprehensive logging and debugging

## 📝 Notes

- Data is stored in JSON files for simplicity
- Automatic backups are created on startup
- The admin panel works with both real data and fallback demonstration data
- All functionality is tested and working