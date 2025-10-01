# Enhanced Recipe Store - Complete Full-Stack Application

A comprehensive full-stack recipe store application with authentication, admin panel, cart management, and analytics.

## 🚀 Features

### Core Features
- **Product Management**: Browse, search, and filter recipes
- **Shopping Cart**: Add, remove, modify quantities with persistent storage
- **User Authentication**: Register, login, logout functionality
- **Order Management**: Place orders and view order history
- **Responsive Design**: Mobile-friendly interface

### Advanced Features
- **Admin Panel**: Complete admin dashboard with analytics
- **Real-time Data**: Fetches data from external APIs and stores locally
- **Export Functionality**: CSV export for products, orders, and users
- **Price Generation**: Automatic price generation for products
- **Session Management**: Secure user sessions
- **Toast Notifications**: Real-time user feedback

## 🏗️ Architecture

### Backend (Node.js + Express)
- **Authentication**: bcryptjs for password hashing
- **Session Management**: express-session with secure cookies
- **File Storage**: JSON-based database system
- **API Integration**: Fetches data from dummyjson.com/recipes
- **Export System**: CSV generation for admin reports

### Frontend (Vanilla JavaScript)
- **SPA-like Experience**: No page refreshes, dynamic content loading
- **Responsive CSS**: Grid layouts, animations, mobile support
- **Modal System**: Product details, login/register forms
- **Real-time Updates**: Cart updates, notifications

### Data Storage
- `products.json` - Product catalog
- `cart.json` - User shopping carts
- `orders.json` - Order history
- `users.json` - User accounts
- `prices.json` - Generated pricing data
- `analytics.json` - Admin analytics data

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation Steps

1. **Clone or Download the Project**
   ```bash
   # Navigate to the assignment-2 directory
   cd assignment-2
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start the Server**
   ```bash
   npm start
   ```

4. **Access the Application**
   - Main Store: http://localhost:3000/index-enhanced.html
   - Admin Panel: http://localhost:3000/admin.html
   - Default Admin Login: `admin` / `admin123`

## 📁 Project Structure

```
assignment-2/
├── server-enhanced.js          # Main server with all features
├── index-enhanced.html         # Enhanced frontend with auth
├── enhanced-app.js             # Main application logic
├── styles-enhanced.css         # Enhanced responsive styles
├── admin.html                  # Admin panel interface
├── admin.js                    # Admin panel functionality
├── package.json                # Dependencies and scripts
├── node_modules/               # Installed dependencies
├── products.json               # Product data
├── cart.json                   # Cart storage
├── orders.json                 # Order history
├── users.json                  # User accounts
├── prices.json                 # Price data
└── analytics.json              # Analytics data
```

## 🎯 Usage Guide

### For Customers

1. **Browse Products**
   - View recipe cards with images, ratings, and details
   - Use search and filter options
   - Sort by price, rating, or name

2. **Product Details**
   - Click "Details" to view full recipe information
   - See ingredients, instructions, and cooking time
   - Add products to cart with custom quantities

3. **Shopping Cart**
   - Click cart icon to view cart contents
   - Modify quantities or remove items
   - Proceed to checkout

4. **User Account**
   - Register for a new account
   - Login to save cart and view order history
   - Access order history from the navigation

### For Administrators

1. **Access Admin Panel**
   - Login with admin credentials
   - Navigate to http://localhost:3000/admin.html

2. **Dashboard Overview**
   - View total products, orders, users, revenue
   - See recent order activity
   - Export all data

3. **Product Management**
   - Add new products manually
   - Edit existing product details
   - Delete products
   - Refresh products from external API

4. **Order Management**
   - View all orders with details
   - Export order data to CSV
   - Delete orders if needed

5. **User Management**
   - View all registered users
   - Toggle user roles (admin/user)
   - Delete user accounts
   - Export user data

6. **Analytics**
   - View revenue analytics
   - See top-performing products
   - Export analytics reports

## 🔧 API Endpoints

### Public Endpoints
- `GET /api/products` - Get all products
- `POST /api/products/refresh` - Refresh products from external API
- `POST /api/register` - Register new user
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/me` - Get current user info

### Cart Endpoints
- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add item to cart
- `POST /api/cart/change` - Change item quantity
- `POST /api/cart/remove` - Remove item from cart
- `POST /api/cart/clear` - Clear entire cart
- `POST /api/cart/checkout` - Process checkout

### Order Endpoints
- `GET /api/orders` - Get user orders

### Admin Endpoints
- `GET /api/admin/products` - Get all products (admin)
- `POST /api/admin/products` - Create new product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product
- `GET /api/admin/orders` - Get all orders
- `DELETE /api/admin/orders/:id` - Delete order
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/toggle-role` - Toggle user role
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/analytics` - Get analytics data
- `GET /api/admin/export/*` - Export data to CSV

## 🔐 Security Features

- **Password Hashing**: Uses bcryptjs for secure password storage
- **Session Management**: Secure session cookies
- **Authentication Middleware**: Protects admin routes
- **Input Validation**: Server-side validation for all inputs
- **CORS Configuration**: Secure cross-origin requests

## 📊 Analytics & Reporting

The admin panel provides comprehensive analytics:
- Total revenue tracking
- Order volume analysis
- User activity metrics
- Product performance data
- CSV export functionality for all data

## 🎨 Design Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern UI**: Clean, professional interface
- **Smooth Animations**: CSS transitions and hover effects
- **Toast Notifications**: Real-time user feedback
- **Loading States**: Visual feedback during operations
- **Modal System**: Overlay dialogs for forms and details

## 🔄 Data Flow

1. **External API Integration**: Fetches recipes from dummyjson.com
2. **Price Generation**: Automatically generates realistic prices
3. **Local Storage**: Saves all data in JSON files
4. **Real-time Updates**: Updates UI without page refreshes
5. **Persistent Cart**: Cart data survives page reloads
6. **Order Tracking**: Complete order lifecycle management

## 🛡️ Error Handling

- **Server Errors**: Comprehensive error responses
- **Client Errors**: User-friendly error messages
- **Network Issues**: Graceful fallback behavior
- **Data Validation**: Input sanitization and validation
- **Session Handling**: Automatic login state management

## 🚀 Performance Optimizations

- **Lazy Loading**: Images load as needed
- **Pagination**: Products loaded in chunks
- **Efficient Filtering**: Client-side search and filter
- **Session Caching**: Reduces database queries
- **File-based Storage**: Fast read/write operations

## 📱 Mobile Responsiveness

- **Responsive Grid**: Adapts to screen size
- **Touch-friendly**: Large tap targets
- **Mobile Navigation**: Hamburger menu for small screens
- **Optimized Images**: Proper sizing for mobile
- **Fast Loading**: Optimized for mobile networks

## 🔧 Customization

### Adding New Features
1. Add new API endpoints in `server-enhanced.js`
2. Update frontend JavaScript in `enhanced-app.js`
3. Add new UI components in HTML files
4. Style with CSS in `styles-enhanced.css`

### Configuration Options
- Server port in `server-enhanced.js`
- Session settings for security
- API refresh intervals
- Pagination limits

## 📝 Development Notes

### Code Organization
- **Modular Design**: Separate files for different concerns
- **Class-based Architecture**: ES6 classes for organization
- **Event-driven**: Event listeners for user interactions
- **Async/Await**: Modern JavaScript for API calls

### Best Practices
- **Error Boundaries**: Comprehensive error handling
- **Loading States**: User feedback during operations
- **Accessibility**: Semantic HTML and ARIA labels
- **Performance**: Optimized queries and operations

## 🎉 Demo Features

This application demonstrates:
- Full-stack JavaScript development
- REST API design and implementation
- User authentication and authorization
- Real-time data operations
- Admin panel development
- Responsive web design
- Modern JavaScript (ES6+)
- File-based database operations
- CSV export functionality
- Analytics and reporting

## 📞 Support

For issues or questions:
1. Check the console for error messages
2. Verify all dependencies are installed
3. Ensure the server is running on port 3000
4. Check that all JSON files are properly formatted

## 🔄 Future Enhancements

Potential improvements:
- Real database integration (MongoDB, PostgreSQL)
- Payment gateway integration
- Email notifications
- Image upload functionality
- Advanced analytics with charts
- Multi-language support
- PWA capabilities
- Real-time chat support

---

**Built with ❤️ using Node.js, Express, and Vanilla JavaScript**