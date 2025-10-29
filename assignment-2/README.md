# 🍳 Recipe Store - Full Stack E-Commerce Application

A complete full-stack recipe store application featuring advanced filtering, real-time analytics, role-based access control, and comprehensive admin dashboard.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start the server
npm start
```

Server runs on **http://localhost:3000**

## 📁 Project Structure

```
assignment-2/
├── index.html              # Enhanced store with filters & search
├── store.html              # Simple store interface
├── admin.html              # Admin dashboard
├── enhanced-app.js         # Store logic with sorting/filtering
├── store.js                # Simple store logic
├── admin.js                # Admin panel with real-time analytics
├── server.js               # Express.js backend server
├── styles-rbac.css         # Enhanced store styles
├── store.css               # Simple store styles
├── admin.css               # Admin panel styles
├── package.json            # Dependencies & scripts
├── services/
│   ├── backup-service.js   # Automatic backup system
│   └── api-recovery-service.js  # Data recovery & initialization
├── *.json                  # Data files (auto-created)
└── backups/                # Automatic backups folder
```

## 🌐 Access Points

| Interface | URL | Description |
|-----------|-----|-------------|
| **Enhanced Store** | http://localhost:3000/index.html | Full-featured store with sorting & filtering |
| **Simple Store** | http://localhost:3000/store.html | Basic store interface |
| **Admin Dashboard** | http://localhost:3000/admin.html | Real-time analytics & management |

## 👤 Default Login Credentials

### Admin Account
- **Username:** `admin`
- **Password:** `admin123`
- **Role:** Administrator (full access)

### Test User Account
You can register new accounts or use existing ones created through the app.

## ✨ Core Features

### 🛍️ Enhanced Store (index.html)
- **Smart Search** - Real-time product search
- **Multi-Sort Options**
  - Price: Low to High / High to Low
  - Rating: Best rated first
  - Name: A to Z
- **Advanced Filters**
  - Cuisine type (dynamic from products)
  - Difficulty level (Easy/Medium/Hard)
- **Shopping Cart**
  - Add/remove items
  - Quantity management
  - Real-time total calculation
- **User Authentication**
  - Secure login/register
  - Session management
  - Order history

### 👨‍💼 Admin Dashboard (admin.html)
- **Real-Time Analytics**
  - Total revenue tracking
  - Order count monitoring
  - User statistics
  - Product inventory
- **Interactive Charts**
  - Revenue trends (6-month view)
  - Order status distribution
  - Daily orders & revenue (7-day view)
- **Product Management**
  - View all products
  - Add new products
  - Edit existing products
  - Delete products
- **Order Management**
  - View all orders
  - Order details
  - Delete orders
  - Status tracking
- **User Management**
  - View all users
  - Toggle admin roles
  - Delete users
  - Activity tracking
- **Performance Metrics**
  - Conversion rate
  - Average order value
  - Revenue growth
  - Active users count

### 🔧 Backend Features
- **RESTful API** - Clean endpoint structure
- **RBAC Authentication** - Role-based access control
- **Session Management** - 24-hour cookie sessions
- **Data Persistence** - JSON file storage
- **Automatic Backups** - Created on startup
- **Error Handling** - Comprehensive error management
- **CORS Support** - Cross-origin requests enabled

## 🛠️ Technology Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern responsive design
- **JavaScript (ES6+)** - Async/await, classes
- **Chart.js** - Interactive data visualization
- **Font Awesome** - Icon library

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **bcryptjs** - Password hashing
- **express-session** - Session management
- **node-fetch** - HTTP client
- **csv-writer** - Data export

### Data Management
- **JSON Files** - Lightweight database
- **Automatic Backups** - Hourly & on startup
- **Data Recovery** - DummyJSON API fallback

## 📊 API Endpoints

### Public Endpoints
```
GET    /api/products           - Get all products
POST   /api/register           - Register new user
POST   /api/login              - User login
POST   /api/logout             - User logout
GET    /api/me                 - Get current user
```

### Protected Endpoints (Requires Login)
```
GET    /api/cart               - Get user cart
POST   /api/cart/add           - Add item to cart
POST   /api/cart/change        - Update quantity
POST   /api/cart/remove        - Remove item
POST   /api/cart/clear         - Clear cart
POST   /api/cart/checkout      - Place order
GET    /api/orders             - Get user orders
```

### Admin Endpoints (Requires Admin Role)
```
GET    /api/admin/products     - List all products
POST   /api/admin/products     - Create product
PUT    /api/admin/products/:id - Update product
DELETE /api/admin/products/:id - Delete product
GET    /api/admin/orders       - List all orders
DELETE /api/admin/orders/:id   - Delete order
GET    /api/admin/users        - List all users
PUT    /api/admin/users/:id/toggle-role - Toggle admin role
DELETE /api/admin/users/:id    - Delete user
GET    /api/admin/analytics    - Comprehensive analytics data
GET    /api/admin/backups      - List backups
POST   /api/admin/backup/create - Create backup
POST   /api/admin/backup/restore - Restore backup
```

## 📈 Real-Time Analytics Features

The admin dashboard provides real-time insights:

1. **Revenue Tracking**
   - Total revenue across all orders
   - Monthly revenue trends
   - Revenue growth percentage

2. **Order Analytics**
   - Total orders placed
   - Order status distribution
   - Daily order trends
   - Average order value

3. **Product Performance**
   - Top selling products
   - Total items sold
   - Revenue per product

4. **User Metrics**
   - Total registered users
   - Active users count
   - Conversion rate
   - Customer retention

5. **Performance Indicators**
   - Revenue growth rate
   - Order growth rate
   - Average order value
   - Active user percentage

## 🔐 Security Features

- **Password Hashing** - bcryptjs with salt rounds
- **Session Security** - HTTP-only cookies
- **Role-Based Access** - Admin vs User permissions
- **API Protection** - Authentication middleware
- **Input Validation** - Server-side validation
- **Error Handling** - No sensitive data exposure

## 🎨 UI/UX Features

- **Responsive Design** - Works on all devices
- **Modern Aesthetics** - Clean, professional interface
- **Toast Notifications** - User-friendly feedback
- **Loading Indicators** - Clear loading states
- **Modal Dialogs** - Intuitive interactions
- **Smooth Animations** - Enhanced user experience
- **Color-Coded Status** - Visual status indicators
- **Interactive Charts** - Hover tooltips & legends

## 🔄 Data Flow

1. **User Actions** → Frontend JavaScript
2. **API Requests** → Express.js Server
3. **Authentication** → Session Middleware
4. **Authorization** → RBAC Middleware
5. **Data Operations** → JSON File Storage
6. **Response** → Frontend Update
7. **UI Refresh** → Real-time Display

## 🚀 Development & Testing

### Running the Application
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

### Testing Workflow
1. Register a new user account
2. Browse products with filters
3. Add items to cart
4. Complete checkout process
5. View order history
6. Login as admin
7. Verify analytics data
8. Test product management
9. Test user management
10. Check backup functionality

## 📝 Important Notes

- **First Run**: Server creates default admin account and sample data
- **Data Storage**: All data in JSON files (products.json, users.json, etc.)
- **Backups**: Created hourly and on startup in `backups/` folder
- **Real-Time**: All admin analytics calculated from actual order data
- **Session**: 24-hour session duration
- **Port**: Default port is 3000 (configurable via PORT env variable)

## 🐛 Troubleshooting

### Server won't start
```bash
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Kill the process or change port
set PORT=3001 && npm start
```

### Charts not displaying
- Ensure Chart.js is loaded (check browser console)
- Wait for data to load completely
- Check browser compatibility

### Authentication issues
- Clear browser cookies
- Check session configuration
- Verify bcryptjs is installed

## 📦 Dependencies

```json
{
  "express": "^4.18.2",
  "cors": "^2.8.5",
  "bcryptjs": "^2.4.3",
  "express-session": "^1.17.3",
  "node-fetch": "^2.6.1",
  "csv-writer": "^1.6.0"
}
```

## 🎯 Future Enhancements

- [ ] Payment gateway integration
- [ ] Email notifications
- [ ] Image upload for products
- [ ] Advanced inventory management
- [ ] Customer reviews & ratings
- [ ] Discount codes & promotions
- [ ] Multi-language support
- [ ] Dark mode theme

## 👨‍💻 Author

**Assignment 2 - Full Stack Development**

## 📄 License

Educational project for learning purposes.

---

**Happy Coding! 🚀**
